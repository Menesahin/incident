import { useState } from 'react';
import { LayoutGrid, TableIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IncidentStats } from './IncidentStats';
import { IncidentFilters } from './IncidentFilters';
import { IncidentList } from './IncidentList';
import { IncidentTableView } from './IncidentTableView';
import { IncidentCreateDialog } from './IncidentCreateDialog';
import { IncidentDetailSheet } from './IncidentDetailSheet';
import { IncidentSkeleton } from './IncidentSkeleton';
import {
  useViewMode,
  useSetViewMode,
  useFilters,
  useUpdateFilter,
} from '../stores/incidentStore';
import { useIncidents } from '../api/useIncidents';

export function IncidentDashboard() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const viewMode = useViewMode();
  const setViewMode = useSetViewMode();
  const filters = useFilters();
  const updateFilter = useUpdateFilter();
  const { data, isLoading, isError, error } = useIncidents(filters);

  const incidents = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = filters.page;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
              Incidents
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and manage service incidents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('card')}
                aria-label="Card view"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
              >
                <TableIcon className="size-4" />
              </Button>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="size-4" />
              Create Incident
            </Button>
          </div>
        </div>

        {/* Stats */}
        <IncidentStats />

        {/* Filters */}
        <IncidentFilters />

        {/* Content */}
        {isLoading ? (
          <IncidentSkeleton />
        ) : isError ? (
          <div className="bg-card rounded-lg border border-border flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load incidents'}
            </p>
          </div>
        ) : viewMode === 'card' ? (
          <IncidentList incidents={incidents} />
        ) : (
          <IncidentTableView incidents={incidents} />
        )}

        {/* Pagination */}
        {meta && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrev}
              onClick={() => updateFilter('page', currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNext}
              onClick={() => updateFilter('page', currentPage + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Dialogs & Sheets */}
        <IncidentCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
        <IncidentDetailSheet />
      </div>
    </div>
  );
}
