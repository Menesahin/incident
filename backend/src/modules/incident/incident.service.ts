import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IncidentRepository } from './incident.repository';
import { IncidentEventDispatcher } from './incident-event.dispatcher';
import { Incident } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { Status, QueueEvent } from '../../common/enums/index';
import { diffChanges } from './utils/diff-changes';

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(
    private readonly incidentRepo: IncidentRepository,
    private readonly dispatcher: IncidentEventDispatcher,
  ) {}

  async create(dto: CreateIncidentDto): Promise<Incident> {
    const incident = await this.incidentRepo.save({
      ...dto,
      status: Status.OPEN,
    });

    this.logger.log(
      `Incident created: ${incident.id} [${incident.severity}] ${incident.title}`,
    );

    await this.dispatcher.dispatch(QueueEvent.INCIDENT_CREATED, { incident });

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

    const changes = diffChanges(incident, dto);

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
        await this.dispatcher.dispatch(QueueEvent.INCIDENT_UPDATED, {
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

    await this.dispatcher.dispatch(QueueEvent.INCIDENT_DELETED, {
      id,
      incident,
    });
  }
}
