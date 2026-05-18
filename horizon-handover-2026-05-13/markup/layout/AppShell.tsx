import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { ApiErrorBoundary } from '../auth/ApiErrorBoundary';
import { BackgroundTaskToast } from './BackgroundTaskToast';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <ApiErrorBoundary key={location.pathname}>
            <Outlet />
          </ApiErrorBoundary>
        </main>
      </div>
      <StatusBar />
      <BackgroundTaskToast />
    </div>
  );
}
