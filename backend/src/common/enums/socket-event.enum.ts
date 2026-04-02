export enum SocketEvent {
  // Server → Client
  INCIDENT_CREATED = 'incident:created',
  INCIDENT_UPDATED = 'incident:updated',
  INCIDENT_DELETED = 'incident:deleted',

  // Client → Server
  SUBSCRIBE_INCIDENT = 'subscribe:incident',
  UNSUBSCRIBE_INCIDENT = 'unsubscribe:incident',
}

export const SocketRoom = {
  ALL_INCIDENTS: 'incidents:all',
  INCIDENT: (id: string) => `incident:${id}`,
} as const;
