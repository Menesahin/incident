import { formatRelativeTime } from '@/lib/utils';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '@/shared/constants';
import type { IncidentTimeline as TimelineEntry } from '../types/incident';

interface IncidentTimelineProps {
  timelines: TimelineEntry[];
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: 'Incident created',
  DELETED: 'Incident deleted',
  STATUS_CHANGED: 'Status changed',
  SEVERITY_CHANGED: 'Severity changed',
  DESCRIPTION_CHANGED: 'Description updated',
};

function formatValue(field: string | null, value: string | null): string {
  if (!value) return '—';
  if (field === 'status') return STATUS_CONFIG[value]?.label ?? value;
  if (field === 'severity') return SEVERITY_CONFIG[value]?.label ?? value;
  return value;
}

function formatDescription(entry: TimelineEntry): string {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  if (entry.field && entry.previousValue != null && entry.newValue != null) {
    return `${label}: ${formatValue(entry.field, entry.previousValue)} → ${formatValue(entry.field, entry.newValue)}`;
  }
  return label;
}

export function IncidentTimeline({ timelines }: IncidentTimelineProps) {
  const sorted = [...timelines].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity yet.</p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[5px] top-6 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {sorted.map((entry) => (
          <div key={entry.id} className="flex gap-3 items-start">
            <div className="size-[10px] rounded-full bg-muted-foreground/30 border-2 border-background shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{formatDescription(entry)}</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                {formatRelativeTime(entry.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
