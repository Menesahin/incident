import { useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_CONFIG, SocketEvent } from '@/shared/constants';
import { useSocket } from '@/shared/hooks/useSocket';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { IncidentSeverityBadge } from './IncidentSeverityBadge';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { IncidentTimeline } from './IncidentTimeline';
import {
  useSelectedIncidentId,
  useSetSelectedIncidentId,
} from '../stores/incidentStore';
import { useIncident, useUpdateIncident, useDeleteIncident } from '../api/useIncidents';
import type { Status, Severity } from '../types/incident';

export function IncidentDetailSheet() {
  const selectedId = useSelectedIncidentId();
  const setSelectedId = useSetSelectedIncidentId();
  const { data, isLoading } = useIncident(selectedId);
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();
  const socket = useSocket();

  const incident = data?.data;

  useEffect(() => {
    if (!selectedId || !socket) return;

    socket.emit(SocketEvent.SUBSCRIBE_INCIDENT, { incidentId: selectedId });

    return () => {
      socket.emit(SocketEvent.UNSUBSCRIBE_INCIDENT, {
        incidentId: selectedId,
      });
    };
  }, [selectedId, socket]);

  const handleStatusChange = (status: Status) => {
    if (!incident) return;
    updateIncident.mutate({
      id: incident.id,
      data: { status, version: incident.version },
    });
  };

  const handleSeverityChange = (severity: Severity) => {
    if (!incident) return;
    updateIncident.mutate({
      id: incident.id,
      data: { severity, version: incident.version },
    });
  };

  const handleDelete = () => {
    if (!incident) return;
    deleteIncident.mutate(incident.id, {
      onSuccess: () => setSelectedId(null),
    });
  };

  return (
    <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : incident ? (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl font-semibold">{incident.title}</SheetTitle>
              <SheetDescription className="sr-only">Incident details</SheetDescription>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <IncidentSeverityBadge severity={incident.severity} />
                <IncidentStatusBadge status={incident.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {incident.service}
              </p>
            </SheetHeader>

            <div className="space-y-2 px-4">
              {incident.description && (
                <>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {incident.description}
                  </p>
                </>
              )}

              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                Status
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const isActive = incident.status === key;
                  return (
                    <Button
                      key={key}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      disabled={isActive || updateIncident.isPending}
                      onClick={() => handleStatusChange(key as Status)}
                    >
                      {updateIncident.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <span className={cn('size-2 rounded-full', config.dotColor)} />
                      )}
                      {config.label}
                    </Button>
                  );
                })}
              </div>

              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                Severity
              </h4>
              <Select
                value={incident.severity}
                onValueChange={(v) => handleSeverityChange(v as Severity)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>

              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                Metadata
              </h4>
              <div className="font-mono text-xs text-muted-foreground space-y-1">
                <p>Created {formatRelativeTime(incident.createdAt)}</p>
                <p>Updated {formatRelativeTime(incident.updatedAt)}</p>
              </div>

              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-2">
                Activity
              </h4>
              <IncidentTimeline timelines={incident.timelines ?? []} />

              <div className="pt-6">
                <Button
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  disabled={deleteIncident.isPending}
                  onClick={handleDelete}
                >
                  {deleteIncident.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete Incident
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">
              Incident not found
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
