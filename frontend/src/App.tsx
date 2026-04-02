import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { DashboardPage } from '@/features/incidents/pages/DashboardPage';

export function App() {
  return (
    <QueryProvider>
      <SocketProvider>
        <DashboardPage />
        <Toaster richColors position="bottom-right" />
      </SocketProvider>
    </QueryProvider>
  );
}
