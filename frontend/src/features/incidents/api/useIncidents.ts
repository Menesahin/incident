import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type {
  Incident,
  IncidentFilters,
  IncidentStats,
} from '../types/incident';
import type {
  CreateIncidentInput,
  UpdateIncidentInput,
} from '../schemas/incident.schema';
import { incidentKeys } from './keys';

export function useIncidents(filters: IncidentFilters) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () =>
      apiGet<Incident[]>('/incidents', { ...filters }),
    staleTime: 15_000,
  });
}

export function useIncident(id: string | null) {
  return useQuery({
    queryKey: incidentKeys.detail(id ?? ''),
    queryFn: () => apiGet<Incident>(`/incidents/${id}`),
    enabled: !!id,
  });
}

export function useIncidentStats() {
  return useQuery({
    queryKey: incidentKeys.stats(),
    queryFn: () => apiGet<IncidentStats>('/incidents/stats'),
    staleTime: 30_000,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncidentInput) =>
      apiPost<Incident>('/incidents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      toast.success('Incident created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateIncidentInput;
    }) => apiPatch<Incident>(`/incidents/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: incidentKeys.detail(id) });

      const previousIncident = queryClient.getQueryData<ApiResponse<Incident>>(
        incidentKeys.detail(id),
      );

      if (previousIncident) {
        queryClient.setQueryData<ApiResponse<Incident>>(
          incidentKeys.detail(id),
          {
            ...previousIncident,
            data: { ...previousIncident.data, ...data },
          },
        );
      }

      return { previousIncident, id };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousIncident && context.id) {
        queryClient.setQueryData(
          incidentKeys.detail(context.id),
          context.previousIncident,
        );
      }

      if (error.message.includes('409') || error.message.includes('conflict')) {
        toast.error('Conflict: This incident was modified. Refreshing...');
        queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      } else {
        toast.error(error.message);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/incidents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      toast.success('Incident deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
