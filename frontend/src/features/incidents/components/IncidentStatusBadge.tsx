import { STATUS_CONFIG } from '@/shared/constants';
import { cn } from '@/lib/utils';
import type { Status } from '../types/incident';

interface IncidentStatusBadgeProps {
  status: Status;
}

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={cn('size-1.5 rounded-full', config.dotColor)} />
      <span className={config.color}>{config.label}</span>
    </span>
  );
}
