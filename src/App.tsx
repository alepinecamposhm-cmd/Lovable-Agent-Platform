import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AgentErrorBoundary } from "./AgentErrorBoundary";

// Agent Platform
import { AgentLayout } from "./components/agents/layout/AgentLayout";
import AgentOverview from "./pages/agents/overview";
import AgentLeads from "./pages/agents/leads";
import AgentLeadDetail from "./pages/agents/lead-detail";
import AgentInbox from "./pages/agents/inbox";
import AgentCalendar from "./pages/agents/calendar";
import AgentListings from "./pages/agents/listings";
import AgentListingDetail from "./pages/agents/listing-detail";
import AgentListingWizard from "./pages/agents/listing-new";
import AgentProfilePage from "./pages/agents/profile";
import AgentCredits from "./pages/agents/credits";
import AgentReports from "./pages/agents/reports";
import AgentTeam from "./pages/agents/team";
import AgentSettings from "./pages/agents/settings";
import AgentRoadmap from "./pages/agents/roadmap";
import AgentNotifications from "./pages/agents/notifications";
import AgentTasks from "./pages/agents/tasks";
import AgentIntegrations from "./pages/agents/integrations";
import AgentNotificationSettings from "./pages/agents/settings/notifications";
import AgentOpenHouseVisitors from "./pages/agents/open-house/visitors";
import AgentAudit from "./pages/agents/audit";

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
          <Route path="/agents" element={<AgentErrorBoundary><AgentLayout /></AgentErrorBoundary>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AgentOverview />} />
            <Route path="leads" element={<AgentLeads />} />
            <Route path="leads/:leadId" element={<AgentLeadDetail />} />
            <Route path="inbox" element={<AgentInbox />} />
            <Route path="calendar" element={<AgentCalendar />} />
            <Route path="listings" element={<AgentListings />} />
            <Route path="listings/new" element={<AgentListingWizard />} />
            <Route path="listings/:listingId/edit" element={<AgentListingWizard />} />
            <Route path="listings/:listingId" element={<AgentListingDetail />} />
            <Route path="profile" element={<AgentProfilePage />} />
            <Route path="profile/:agentId" element={<AgentProfilePage />} />
            <Route path="credits" element={<AgentCredits />} />
            <Route path="team" element={<AgentTeam />} />
            <Route path="reports" element={<AgentReports />} />
            <Route path="roadmap" element={<AgentRoadmap />} />
            <Route path="notifications" element={<AgentNotifications />} />
            <Route path="tasks" element={<AgentTasks />} />
            <Route path="integrations" element={<AgentIntegrations />} />
            <Route path="settings/notifications" element={<AgentNotificationSettings />} />
            <Route path="open-house/visitors" element={<AgentOpenHouseVisitors />} />
            <Route path="settings" element={<AgentSettings />} />
            <Route path="audit" element={<AgentAudit />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
