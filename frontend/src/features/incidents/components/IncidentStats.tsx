import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useIncidentStats } from '../api/useIncidents';
import { IncidentSeverityBadge } from './IncidentSeverityBadge';
import type { Severity } from '../types/incident';

export function IncidentStats() {
  const { data, isLoading } = useIncidentStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-16 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Open',
      value: stats.byStatus['OPEN'] ?? 0,
      borderColor: 'border-t-red-500',
    },
    {
      title: 'Investigating',
      value: stats.byStatus['INVESTIGATING'] ?? 0,
      borderColor: 'border-t-orange-500',
    },
    {
      title: 'Resolved',
      value: stats.byStatus['RESOLVED'] ?? 0,
      borderColor: 'border-t-green-500',
    },
    {
      title: 'Total',
      value: stats.total,
      borderColor: 'border-t-gray-400',
    },
  ];

  const severities: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={cn(
              'bg-card rounded-lg border border-border border-t-2 p-5',
              stat.borderColor,
            )}
          >
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-3xl font-semibold tabular-nums tracking-tight mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      {stats.bySeverity && (
        <div className="flex flex-wrap gap-3">
          {severities.map((severity) => (
            <div key={severity} className="flex items-center gap-1.5">
              <IncidentSeverityBadge severity={severity} />
              <span className="font-mono text-xs text-muted-foreground">
                {stats.bySeverity[severity] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
