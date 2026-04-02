import { SEVERITY_CONFIG } from '@/shared/constants';
import { cn } from '@/lib/utils';
import type { Severity } from '../types/incident';

interface IncidentSeverityBadgeProps {
  severity: Severity;
}

export function IncidentSeverityBadge({ severity }: IncidentSeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  if (!config) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={cn('size-1.5 rounded-full', config.dotColor)} />
      <span className={config.color}>{config.label}</span>
    </span>
  );
}
