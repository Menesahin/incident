import { create } from 'zustand';
import type { IncidentFilters } from '../types/incident';
import { DEFAULT_PAGE_SIZE } from '@/shared/constants';

type ViewMode = 'card' | 'table';

interface IncidentStoreState {
  viewMode: ViewMode;
  filters: IncidentFilters;
  selectedIncidentId: string | null;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: IncidentFilters) => void;
  updateFilter: <K extends keyof IncidentFilters>(
    key: K,
    value: IncidentFilters[K],
  ) => void;
  resetFilters: () => void;
  setSelectedIncidentId: (id: string | null) => void;
}

const defaultFilters: IncidentFilters = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
};

const useIncidentStore = create<IncidentStoreState>((set) => ({
  viewMode: 'card',
  filters: defaultFilters,
  selectedIncidentId: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: key === 'page' ? (value as number) : 1 },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
}));

// Atomic selectors
export const useViewMode = () => useIncidentStore((s) => s.viewMode);
export const useSetViewMode = () => useIncidentStore((s) => s.setViewMode);
export const useFilters = () => useIncidentStore((s) => s.filters);
export const useSetFilters = () => useIncidentStore((s) => s.setFilters);
export const useUpdateFilter = () => useIncidentStore((s) => s.updateFilter);
export const useResetFilters = () => useIncidentStore((s) => s.resetFilters);
export const useSelectedIncidentId = () =>
  useIncidentStore((s) => s.selectedIncidentId);
export const useSetSelectedIncidentId = () =>
  useIncidentStore((s) => s.setSelectedIncidentId);
