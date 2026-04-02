import {
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  CircleAlert,
  Search,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const SocketEvent = {
  INCIDENT_CREATED: 'incident:created',
  INCIDENT_UPDATED: 'incident:updated',
  INCIDENT_DELETED: 'incident:deleted',
  SUBSCRIBE_INCIDENT: 'subscribe:incident',
  UNSUBSCRIBE_INCIDENT: 'unsubscribe:incident',
} as const;

interface SeverityConfigItem {
  label: string;
  color: string;
  dotColor: string;
  glowClass: string;
  icon: LucideIcon;
}

export const SEVERITY_CONFIG: Record<string, SeverityConfigItem> = {
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-600',
    dotColor: 'bg-red-500',
    glowClass: '',
    icon: AlertTriangle,
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-600',
    dotColor: 'bg-orange-500',
    glowClass: '',
    icon: ArrowUp,
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-amber-600',
    dotColor: 'bg-amber-500',
    glowClass: '',
    icon: Minus,
  },
  LOW: {
    label: 'Low',
    color: 'text-gray-500',
    dotColor: 'bg-gray-400',
    glowClass: '',
    icon: ArrowDown,
  },
} as const;

interface StatusConfigItem {
  label: string;
  color: string;
  dotColor: string;
  icon: LucideIcon;
}

export const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  OPEN: {
    label: 'Open',
    color: 'text-red-600',
    dotColor: 'bg-red-500',
    icon: CircleAlert,
  },
  INVESTIGATING: {
    label: 'Investigating',
    color: 'text-orange-600',
    dotColor: 'bg-orange-500',
    icon: Search,
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'text-green-600',
    dotColor: 'bg-green-500',
    icon: CheckCircle2,
  },
} as const;

export const SERVICE_LIST = [
  'PAYMENT_API',
  'AUTH_SERVICE',
  'NOTIFICATION_WORKER',
] as const;

export const SERVICE_LABELS: Record<string, string> = {
  PAYMENT_API: 'Payment API',
  AUTH_SERVICE: 'Auth Service',
  NOTIFICATION_WORKER: 'Notification Worker',
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: 'border-l-red-500',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-gray-400',
} as const;
