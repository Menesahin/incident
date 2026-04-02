import { createContext, useEffect, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { queryClient } from './QueryProvider';

export const SocketContext = createContext<Socket | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io('http://localhost:3000/incidents', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }

  const socket = socketRef.current;

  useEffect(() => {
    let wasConnected = false;

    socket.on('connect', () => {
      if (wasConnected) {
        queryClient.invalidateQueries().catch(() => {});
        toast.success('Reconnected to server');
      }
      wasConnected = true;
    });

    socket.on('disconnect', () => {
      toast.warning('Disconnected from server');
    });

    socket.connect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
