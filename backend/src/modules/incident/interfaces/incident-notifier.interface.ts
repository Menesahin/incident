import { Incident } from '../entities/incident.entity';
import { ChangeEntry } from '../../../common/interfaces/change-entry.interface';

export const INCIDENT_NOTIFIER = Symbol('INCIDENT_NOTIFIER');

export interface IncidentNotifier {
  emitCreated(incident: Incident): void;
  emitUpdated(incident: Incident, changes: ChangeEntry[]): void;
  emitDeleted(id: string): void;
}
