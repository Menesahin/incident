import { Incident } from '../entities/incident.entity';
import { ChangeEntry } from '../../../common/interfaces/change-entry.interface';
import { QueueEvent } from '../../../common/enums/index';
import { Severity } from '../../../common/enums/severity.enum';
import { ServiceName } from '../../../common/enums/service-name.enum';

export interface CreatedPayload {
  incident: Incident;
}

export interface UpdatedPayload {
  incident: Incident;
  changes: ChangeEntry[];
}

export interface DeletedPayload {
  id: string;
  incident: Incident;
}

export interface IngestPayload {
  title: string;
  description?: string;
  service: ServiceName;
  severity: Severity;
}

export interface EventPayloadMap {
  [QueueEvent.INCIDENT_CREATED]: CreatedPayload;
  [QueueEvent.INCIDENT_UPDATED]: UpdatedPayload;
  [QueueEvent.INCIDENT_DELETED]: DeletedPayload;
  [QueueEvent.INCIDENT_INGEST]: IngestPayload;
}

export type PayloadFor<E extends QueueEvent> = EventPayloadMap[E];
