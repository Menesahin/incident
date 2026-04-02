import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { IncidentRepository } from './incident.repository.js';
import { IncidentGateway } from './incident.gateway.js';
import { Incident } from './entities/incident.entity.js';
import { IncidentTimeline } from './entities/incident-timeline.entity.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import { QueryIncidentDto } from './dto/query-incident.dto.js';
import { ApiResponse } from '../../common/dto/api-response.dto.js';
import {
  Status,
  QueueEvent,
  INCIDENT_QUEUE,
  TimelineAction,
} from '../../common/enums/index.js';
import { ChangeEntry } from '../../common/interfaces/change-entry.interface.js';

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(
    private readonly incidentRepo: IncidentRepository,
    @InjectRepository(IncidentTimeline)
    private readonly timelineRepo: Repository<IncidentTimeline>,
    @InjectQueue(INCIDENT_QUEUE)
    private readonly eventQueue: Queue,
    private readonly gateway: IncidentGateway,
  ) {}

  async create(dto: CreateIncidentDto): Promise<Incident> {
    const incident = await this.incidentRepo.save({
      ...dto,
      status: Status.OPEN,
    });

    this.logger.log(
      `Incident created: ${incident.id} [${incident.severity}] ${incident.title}`,
    );

    await this.enqueueEvent(QueueEvent.INCIDENT_CREATED, { incident });

    return incident;
  }

  async findAll(query: QueryIncidentDto): Promise<ApiResponse<Incident[]>> {
    const [items, total] = await this.incidentRepo.findWithFilters(query);
    return ApiResponse.paginated(items, total, query);
  }

  async findById(id: string): Promise<Incident> {
    const incident = await this.incidentRepo.findByIdWithTimeline(id);

    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.incidentRepo.findOneById(id);

    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    if (incident.version !== dto.version) {
      throw new ConflictException(
        'Incident was modified by another user. Please refresh.',
      );
    }

    const changes = this.diffChanges(incident, dto);

    if (dto.status !== undefined) incident.status = dto.status;
    if (dto.severity !== undefined) incident.severity = dto.severity;
    if (dto.description !== undefined) incident.description = dto.description;

    try {
      const saved = await this.incidentRepo.save(incident);

      const changedFields = changes.map((c) => c.field);
      this.logger.log(
        `Incident updated: ${id} — fields: ${changedFields.join(', ')}`,
      );

      if (changes.length > 0) {
        await this.enqueueEvent(QueueEvent.INCIDENT_UPDATED, {
          incident: saved,
          changes,
        });
      }

      return saved;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'OptimisticLockVersionMismatchError'
      ) {
        throw new ConflictException(
          'Incident was modified by another user. Please refresh.',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const incident = await this.incidentRepo.findOneById(id);

    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    await this.incidentRepo.softDelete(id);

    this.logger.log(`Incident soft-deleted: ${id}`);

    await this.enqueueEvent(QueueEvent.INCIDENT_DELETED, {
      id,
      incident,
    });
  }

  async getStats(): Promise<Record<string, unknown>> {
    const statusCounts = await this.incidentRepo
      .createQueryBuilder('incident')
      .select('incident.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.status')
      .getRawMany<{ status: string; count: string }>();

    const severityCounts = await this.incidentRepo
      .createQueryBuilder('incident')
      .select('incident.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.severity')
      .getRawMany<{ severity: string; count: string }>();

    return {
      byStatus: statusCounts.reduce(
        (acc, row) => {
          acc[row.status] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      bySeverity: severityCounts.reduce(
        (acc, row) => {
          acc[row.severity] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      total: statusCounts.reduce((sum, row) => sum + Number(row.count), 0),
    };
  }

  private async enqueueEvent(
    event: QueueEvent,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.eventQueue.add(event, data);
    } catch (error) {
      // Sync fallback: timeline creation + socket emit ONLY runs here when
      // the queue is unavailable. When the queue IS working, the consumer
      // (IncidentConsumer) handles timeline + socket — no duplicate path.
      this.logger.warn(
        `Queue unavailable for ${event}, sync fallback: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      await this.handleEventSync(event, data);
    }
  }

  private async handleEventSync(
    event: QueueEvent,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const incident = data['incident'] as Incident | undefined;

      if (event === QueueEvent.INCIDENT_CREATED && incident) {
        await this.timelineRepo.save({
          incidentId: incident.id,
          action: TimelineAction.CREATED,
        });
        this.gateway.emitCreated(data['incident'] as Record<string, unknown>);
      }

      if (event === QueueEvent.INCIDENT_UPDATED && incident) {
        const changes = (data['changes'] ?? []) as ChangeEntry[];
        for (const change of changes) {
          await this.timelineRepo.save({
            incidentId: incident.id,
            action: this.getTimelineAction(change.field),
            field: change.field,
            previousValue: change.previousValue,
            newValue: change.newValue,
          });
        }
        this.gateway.emitUpdated(
          data['incident'] as Record<string, unknown>,
          changes,
        );
      }

      if (event === QueueEvent.INCIDENT_DELETED) {
        const id = data['id'] as string;
        if (incident) {
          await this.timelineRepo.save({
            incidentId: id,
            action: TimelineAction.DELETED,
          });
        }
        this.gateway.emitDeleted(id);
      }
    } catch (syncError) {
      this.logger.error(
        `Sync fallback also failed for ${event}`,
        syncError instanceof Error ? syncError.stack : undefined,
      );
    }
  }

  private getTimelineAction(field: string): TimelineAction {
    switch (field) {
      case 'status':
        return TimelineAction.STATUS_CHANGED;
      case 'severity':
        return TimelineAction.SEVERITY_CHANGED;
      case 'description':
        return TimelineAction.DESCRIPTION_CHANGED;
      default:
        return TimelineAction.CREATED;
    }
  }

  private diffChanges(
    existing: Incident,
    dto: UpdateIncidentDto,
  ): ChangeEntry[] {
    const changes: ChangeEntry[] = [];

    if (dto.status !== undefined && dto.status !== existing.status) {
      changes.push({
        field: 'status',
        previousValue: existing.status,
        newValue: dto.status,
      });
    }

    if (dto.severity !== undefined && dto.severity !== existing.severity) {
      changes.push({
        field: 'severity',
        previousValue: existing.severity,
        newValue: dto.severity,
      });
    }

    if (
      dto.description !== undefined &&
      dto.description !== existing.description
    ) {
      changes.push({
        field: 'description',
        previousValue: existing.description,
        newValue: dto.description,
      });
    }

    return changes;
  }
}
