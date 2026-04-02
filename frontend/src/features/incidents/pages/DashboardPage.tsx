import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from '@/shared/hooks/useSocket';
import { SocketEvent } from '@/shared/constants';
import { incidentKeys } from '../api/keys';
import { IncidentDashboard } from '../components/IncidentDashboard';
import {
  useSelectedIncidentId,
  useSetSelectedIncidentId,
} from '../stores/incidentStore';
import type { Incident } from '../types/incident';
import type { ApiResponse } from '@/shared/api/types';

export function DashboardPage() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const selectedId = useSelectedIncidentId();
  const setSelectedId = useSetSelectedIncidentId();

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (payload: { incident: Incident }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all }).catch(() => {});
      toast.info(`New incident: ${payload.incident.title}`);
    };

    const handleUpdated = (payload: { incident: Incident; changes?: Array<{ field: string; previousValue: string; newValue: string }> }) => {
      queryClient.setQueryData<ApiResponse<Incident>>(
        incidentKeys.detail(payload.incident.id),
        (prev) =>
          prev
            ? { ...prev, data: payload.incident }
            : undefined,
      );
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() }).catch(() => {});
    };

    const handleDeleted = (payload: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all }).catch(() => {});
      if (selectedId === payload.id) {
        setSelectedId(null);
      }
    };

    socket.on(SocketEvent.INCIDENT_CREATED, handleCreated);
    socket.on(SocketEvent.INCIDENT_UPDATED, handleUpdated);
    socket.on(SocketEvent.INCIDENT_DELETED, handleDeleted);

    return () => {
      socket.off(SocketEvent.INCIDENT_CREATED, handleCreated);
      socket.off(SocketEvent.INCIDENT_UPDATED, handleUpdated);
      socket.off(SocketEvent.INCIDENT_DELETED, handleDeleted);
    };
  }, [socket, queryClient, selectedId, setSelectedId]);

  return <IncidentDashboard />;
}
