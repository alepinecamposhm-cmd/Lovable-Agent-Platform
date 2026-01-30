import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AgentSidebar } from './AgentSidebar';
import { AgentTopbar } from './AgentTopbar';
import { CommandPalette } from './CommandPalette';
import { useState } from 'react';

// #region agent log
const DEBUG_INGEST = 'http://127.0.0.1:7242/ingest/09986fe5-9bd4-4263-a66c-7f830704a56d';
function logToDebug(p: Record<string, unknown>) {
  fetch(DEBUG_INGEST, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, timestamp: Date.now(), sessionId: 'debug-session' }) }).catch(() => {});
}
// #endregion

export function AgentLayout() {
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();

  // #region agent log
  // useEffect(() => {
  //   logToDebug({ hypothesisId: 'H2', location: 'AgentLayout.tsx:mount', message: 'AgentLayout mounted', data: { pathname: location.pathname } });
  // }, [location.pathname]);
  // #endregion

  // Placeholder auth check - replace with real auth
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AgentSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AgentTopbar onOpenCommand={() => setCommandOpen(true)} />
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl py-6 px-4 md:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
