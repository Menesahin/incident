import { Inject, Injectable, Logger } from '@nestjs/common';
import { IncidentTimelineService } from './incident-timeline.service.js';
import { IncidentRepository } from './incident.repository.js';
import { INCIDENT_NOTIFIER } from './interfaces/incident-notifier.interface.js';
import type { IncidentNotifier } from './interfaces/incident-notifier.interface.js';
import {
  CreatedPayload,
  UpdatedPayload,
  DeletedPayload,
  IngestPayload,
  EventPayloadMap,
} from './events/event-payloads.js';
import { QueueEvent, Status } from '../../common/enums/index.js';

type EventHandler<E extends QueueEvent> = (
  data: EventPayloadMap[E],
) => Promise<void>;

@Injectable()
export class IncidentEventProcessor {
  private readonly logger = new Logger(IncidentEventProcessor.name);

  private readonly handlers = new Map<string, EventHandler<QueueEvent>>([
    [
      QueueEvent.INCIDENT_CREATED,
      (d) => this.handleCreated(d as CreatedPayload),
    ],
    [
      QueueEvent.INCIDENT_UPDATED,
      (d) => this.handleUpdated(d as UpdatedPayload),
    ],
    [
      QueueEvent.INCIDENT_DELETED,
      (d) => this.handleDeleted(d as DeletedPayload),
    ],
    [QueueEvent.INCIDENT_INGEST, (d) => this.handleIngest(d as IngestPayload)],
  ]);

  constructor(
    private readonly timelineService: IncidentTimelineService,
    @Inject(INCIDENT_NOTIFIER)
    private readonly notifier: IncidentNotifier,
    private readonly incidentRepo: IncidentRepository,
  ) {}

  async process<E extends QueueEvent>(
    event: E,
    data: EventPayloadMap[E],
  ): Promise<void> {
    const handler = this.handlers.get(event);

    if (!handler) {
      throw new Error(`No handler registered for event: ${event}`);
    }

    await handler(data);
  }

  private async handleCreated(data: CreatedPayload): Promise<void> {
    await this.timelineService.recordCreated(data.incident.id);
    this.notifier.emitCreated(data.incident);
  }

  private async handleUpdated(data: UpdatedPayload): Promise<void> {
    await this.timelineService.recordChanges(data.incident.id, data.changes);
    this.notifier.emitUpdated(data.incident, data.changes);
  }

  private async handleDeleted(data: DeletedPayload): Promise<void> {
    await this.timelineService.recordDeleted(data.id);
    this.notifier.emitDeleted(data.id);
  }

  private async handleIngest(data: IngestPayload): Promise<void> {
    const incident = await this.incidentRepo.save({
      title: data.title,
      description: data.description ?? null,
      service: data.service,
      severity: data.severity,
      status: Status.OPEN,
    });

    this.logger.log(
      `Ingested incident: ${incident.id} [${incident.severity}] ${incident.title}`,
    );

    await this.timelineService.recordCreated(incident.id);
    this.notifier.emitCreated(incident);
  }
}
