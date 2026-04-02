import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STATUS_CONFIG } from '@/shared/constants';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { IncidentSeverityBadge } from './IncidentSeverityBadge';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { IncidentEmptyState } from './IncidentEmptyState';
import { useSetSelectedIncidentId } from '../stores/incidentStore';
import { useUpdateIncident, useDeleteIncident } from '../api/useIncidents';
import type { Incident, Status } from '../types/incident';

interface IncidentTableViewProps {
  incidents: Incident[];
}

export function IncidentTableView({ incidents }: IncidentTableViewProps) {
  const setSelectedIncidentId = useSetSelectedIncidentId();
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();

  if (incidents.length === 0) {
    return <IncidentEmptyState />;
  }

  const handleStatusChange = (incident: Incident, status: Status) => {
    updateIncident.mutate({
      id: incident.id,
      data: { status, version: incident.version },
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => {
            const statusOptions = Object.entries(STATUS_CONFIG).filter(
              ([key]) => key !== incident.status,
            );

            return (
              <TableRow
                key={incident.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedIncidentId(incident.id); }}
                onClick={() => setSelectedIncidentId(incident.id)}
              >
                <TableCell className="font-medium text-sm">{incident.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{incident.service}</TableCell>
                <TableCell>
                  <IncidentSeverityBadge severity={incident.severity} />
                </TableCell>
                <TableCell>
                  <IncidentStatusBadge status={incident.status} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {formatRelativeTime(incident.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-xs" />
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusOptions.map(([key, config]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(incident, key as Status);
                          }}
                        >
                          <span
                            className={cn('size-2 rounded-full', config.dotColor)}
                          />
                          Mark as {config.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncidentId(incident.id);
                        }}
                      >
                        <Eye className="size-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteIncident.mutate(incident.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
