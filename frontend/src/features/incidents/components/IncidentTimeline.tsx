import { formatRelativeTime } from '@/lib/utils';
import type { IncidentTimeline as TimelineEntry } from '../types/incident';

interface IncidentTimelineProps {
  timelines: TimelineEntry[];
}

function formatDescription(entry: TimelineEntry): string {
  if (entry.changes) {
    return `${entry.changes.field}: ${entry.changes.from} \u2192 ${entry.changes.to}`;
  }
  return entry.description;
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
