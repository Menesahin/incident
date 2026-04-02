import { Inbox } from 'lucide-react';

export function IncidentEmptyState() {
  return (
    <div className="bg-card rounded-lg border border-border flex flex-col items-center justify-center py-20 text-center">
      <Inbox className="size-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-sm font-medium text-foreground">
        No incidents
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        All systems operational. Create an incident or adjust your filters.
      </p>
    </div>
  );
}
