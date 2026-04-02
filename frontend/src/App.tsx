import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { DashboardPage } from '@/features/incidents/pages/DashboardPage';

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <SocketProvider>
          <DashboardPage />
          <Toaster richColors position="bottom-right" />
        </SocketProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
