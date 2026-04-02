import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SERVICE_LIST, SERVICE_LABELS } from '@/shared/constants';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  useFilters,
  useUpdateFilter,
  useResetFilters,
} from '../stores/incidentStore';
import type { Severity, Status, ServiceName } from '../types/incident';

export function IncidentFilters() {
  const filters = useFilters();
  const updateFilter = useUpdateFilter();
  const resetFilters = useResetFilters();
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput);

  useEffect(() => {
    updateFilter('search', debouncedSearch || undefined);
  }, [debouncedSearch, updateFilter]);

  const hasActiveFilters =
    filters.search || filters.status || filters.severity || filters.service;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incidents..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.status ?? ''}
        onValueChange={(value) =>
          updateFilter('status', (value || undefined) as Status | undefined)
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="INVESTIGATING">Investigating</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.severity ?? ''}
        onValueChange={(value) =>
          updateFilter(
            'severity',
            (value || undefined) as Severity | undefined,
          )
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Severities</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.service ?? ''}
        onValueChange={(value) =>
          updateFilter(
            'service',
            (value || undefined) as ServiceName | undefined,
          )
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Services</SelectItem>
          {SERVICE_LIST.map((service) => (
            <SelectItem key={service} value={service}>
              {SERVICE_LABELS[service] ?? service}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground"
          onClick={() => {
            resetFilters();
            setSearchInput('');
          }}
        >
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
