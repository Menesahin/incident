export enum QueueEvent {
  INCIDENT_CREATED = 'incident.created',
  INCIDENT_UPDATED = 'incident.updated',
  INCIDENT_DELETED = 'incident.deleted',
  INCIDENT_INGEST = 'incident.ingest',
}

export const INCIDENT_QUEUE = 'incident-events';
