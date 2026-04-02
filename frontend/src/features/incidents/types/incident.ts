export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Status = 'open' | 'investigating' | 'resolved';

export type ServiceName =
  | 'Payment API'
  | 'Auth Service'
  | 'Notification Worker';

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
  description: string;
  changes: IncidentChange | null;
  createdAt: string;
}

export interface IncidentChange {
  field: string;
  from: string;
  to: string;
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
  open: number;
  investigating: number;
  resolved: number;
  bySeverity: Record<Severity, number>;
}
