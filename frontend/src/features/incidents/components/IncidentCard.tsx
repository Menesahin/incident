import { motion } from 'framer-motion';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STATUS_CONFIG } from '@/shared/constants';
import { formatRelativeTime } from '@/lib/utils';
import { IncidentSeverityBadge } from './IncidentSeverityBadge';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { useSetSelectedIncidentId } from '../stores/incidentStore';
import { useUpdateIncident, useDeleteIncident } from '../api/useIncidents';
import type { Incident, Status } from '../types/incident';

const SEVERITY_BORDER_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#9ca3af',
};

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const setSelectedIncidentId = useSetSelectedIncidentId();
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();

  const handleStatusChange = (status: Status) => {
    updateIncident.mutate({
      id: incident.id,
      data: { status, version: incident.version },
    });
  };

  const handleDelete = () => {
    deleteIncident.mutate(incident.id);
  };

  const statusOptions = Object.entries(STATUS_CONFIG).filter(
    ([key]) => key !== incident.status,
  );

  return (
    <motion.div
      layout
      layoutId={incident.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-lg border border-border border-l-[3px] p-4 hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeftColor: SEVERITY_BORDER_COLORS[incident.severity] ?? '#9ca3af' }}
      onClick={() => setSelectedIncidentId(incident.id)}
    >
      {/* Title */}
      <h3 className="text-sm font-medium text-foreground line-clamp-1">
        {incident.title}
      </h3>

      {/* Service */}
      <p className="text-xs text-muted-foreground mt-1">
        {incident.service}
      </p>

      {/* Description */}
      {incident.description && (
        <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-2">
          {incident.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <IncidentSeverityBadge severity={incident.severity} />
        <IncidentStatusBadge status={incident.status} />
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {formatRelativeTime(incident.createdAt)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="size-6" />
              }
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(key as Status);
                  }}
                >
                  <span className={cn('size-2 rounded-full', config.dotColor)} />
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
                  handleDelete();
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
