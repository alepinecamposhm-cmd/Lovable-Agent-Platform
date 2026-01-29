import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AgentSidebar } from './AgentSidebar';
import { AgentTopbar } from './AgentTopbar';
import { CommandPalette } from './CommandPalette';
import { useState } from 'react';

export function AgentLayout() {
  const [commandOpen, setCommandOpen] = useState(false);
  
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
