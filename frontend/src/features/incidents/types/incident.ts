export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Status = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export type ServiceName =
  | 'PAYMENT_API'
  | 'AUTH_SERVICE'
  | 'NOTIFICATION_WORKER';

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  service: ServiceName;
  severity: Severity;
  status: Status;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  timelines?: IncidentTimeline[];
}

export interface IncidentTimeline {
  id: string;
  incidentId: string;
  action: string;
  field: string | null;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface IncidentFilters {
  page: number;
  limit: number;
  search?: string;
  status?: Status;
  severity?: Severity;
  service?: ServiceName;
}

export interface IncidentStats {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
}
