import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LovableAgentSidebar } from "./LovableAgentSidebar";
import { LovableAgentHeader } from "./LovableAgentHeader";

export function LovableAgentLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <LovableAgentSidebar />
        <SidebarInset className="flex flex-col">
          <LovableAgentHeader />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
