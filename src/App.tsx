import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Agent Platform
import { AgentLayout } from "./components/agents/layout/AgentLayout";
import AgentOverview from "./pages/agents/overview";
import AgentLeads from "./pages/agents/leads";
import AgentInbox from "./pages/agents/inbox";
import AgentCalendar from "./pages/agents/calendar";
import AgentListings from "./pages/agents/listings";
import AgentCredits from "./pages/agents/credits";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Agent Platform Routes */}
          <Route path="/agents" element={<AgentLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AgentOverview />} />
            <Route path="leads" element={<AgentLeads />} />
            <Route path="inbox" element={<AgentInbox />} />
            <Route path="calendar" element={<AgentCalendar />} />
            <Route path="listings" element={<AgentListings />} />
            <Route path="credits" element={<AgentCredits />} />
            <Route path="team" element={<AgentOverview />} />
            <Route path="reports" element={<AgentOverview />} />
            <Route path="settings" element={<AgentOverview />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
