export enum QueueEvent {
  INCIDENT_CREATED = 'incident.created',
  INCIDENT_UPDATED = 'incident.updated',
  INCIDENT_DELETED = 'incident.deleted',
}

export const INCIDENT_QUEUE = 'incident-events';
