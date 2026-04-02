import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { IncidentTimeline } from './entities/incident-timeline.entity.js';
import { IncidentGateway } from './incident.gateway.js';
import { IncidentRepository } from './incident.repository.js';
import { INCIDENT_QUEUE, QueueEvent, TimelineAction, Status } from '../../common/enums/index.js';
import { ChangeEntry } from '../../common/interfaces/change-entry.interface.js';
import { Severity } from '../../common/enums/severity.enum.js';
import { ServiceName } from '../../common/enums/service-name.enum.js';

interface IngestPayload {
  title: string;
  description?: string;
  service: ServiceName;
  severity: Severity;
}

@Processor(INCIDENT_QUEUE, { concurrency: 1 })
export class IncidentConsumer extends WorkerHost {
  private readonly logger = new Logger(IncidentConsumer.name);

  constructor(
    @InjectRepository(IncidentTimeline)
    private readonly timelineRepo: Repository<IncidentTimeline>,
    private readonly gateway: IncidentGateway,
    private readonly incidentRepo: IncidentRepository,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case QueueEvent.INCIDENT_CREATED:
        await this.handleCreated(job);
        break;
      case QueueEvent.INCIDENT_UPDATED:
        await this.handleUpdated(job);
        break;
      case QueueEvent.INCIDENT_DELETED:
        await this.handleDeleted(job);
        break;
      case QueueEvent.INCIDENT_INGEST:
        await this.handleIngest(job);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  /**
   * Handles incidents created via HTTP (Service → Queue → Consumer).
   * Incident already exists in DB; consumer creates timeline + emits socket.
   */
  private async handleCreated(job: Job): Promise<void> {
    const { incident } = job.data as { incident: Record<string, unknown> };

    await this.timelineRepo.save({
      incidentId: incident['id'] as string,
      action: TimelineAction.CREATED,
    });

    this.gateway.emitCreated(incident);
  }

  /**
   * Handles incidents ingested directly via queue from external services.
   * Creates the incident in DB, then creates timeline + emits socket.
   *
   * External services push to the queue:
   *   queue.add('incident.ingest', { title, description?, service, severity })
   */
  private async handleIngest(job: Job): Promise<void> {
    const payload = job.data as IngestPayload;

    const incident = await this.incidentRepo.save({
      title: payload.title,
      description: payload.description ?? null,
      service: payload.service,
      severity: payload.severity,
      status: Status.OPEN,
    });

    this.logger.log(
      `Ingested incident: ${incident.id} [${incident.severity}] ${incident.title}`,
    );

    await this.timelineRepo.save({
      incidentId: incident.id,
      action: TimelineAction.CREATED,
    });

    this.gateway.emitCreated(incident as unknown as Record<string, unknown>);
  }

  private async handleUpdated(job: Job): Promise<void> {
    const { incident, changes } = job.data as {
      incident: Record<string, unknown>;
      changes: ChangeEntry[];
    };

    for (const change of changes) {
      await this.timelineRepo.save({
        incidentId: incident['id'] as string,
        action: this.getTimelineAction(change.field),
        field: change.field,
        previousValue: change.previousValue,
        newValue: change.newValue,
      });
    }

    this.gateway.emitUpdated(incident, changes);
  }

  private async handleDeleted(job: Job): Promise<void> {
    const { id, incident } = job.data as {
      id: string;
      incident: Record<string, unknown>;
    };

    await this.timelineRepo.save({
      incidentId: (incident['id'] as string) ?? id,
      action: TimelineAction.DELETED,
    });

    this.gateway.emitDeleted(id);
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

  @OnWorkerEvent('completed')
  onCompleted(job: Job, _result: unknown, _prev: string): void {
    this.logger.log(`Job completed: ${job.name} [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error, _prev: string): void {
    this.logger.error(
      `Job failed: ${job?.name ?? 'unknown'} [${job?.id ?? 'unknown'}] — ${error.message}`,
      error.stack,
    );
  }
}
