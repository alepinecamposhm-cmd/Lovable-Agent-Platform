import { useEffect } from "react";
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
import { LovableAgentLayout } from "./components/lovable/layout/LovableAgentLayout";
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
import AgentExperienceReport from "./pages/agents/reports-experience";
import AgentRoiReport from "./pages/agents/reports-roi";
import AgentLeadReport from "./pages/agents/reports-leads";
import AgentTeamReport from "./pages/agents/reports-team";
import AgentTeam from "./pages/agents/team";
import AgentTeamV2 from "./pages/agents/team-v2";
import AgentTeamV2Settings from "./pages/agents/team-v2-settings";
import AgentTeamMemberDetailV2 from "./pages/agents/team-member-detail-v2";
import AgentTeamV2WorkspaceLayout from "./pages/agents/team-v2-workspace-layout";
import AgentSettings from "./pages/agents/settings";
import AgentRoadmap from "./pages/agents/roadmap";
import AgentNotifications from "./pages/agents/notifications";
import AgentTasks from "./pages/agents/tasks";
import AgentIntegrations from "./pages/agents/integrations";
import AgentNotificationSettings from "./pages/agents/settings/notifications";
import AgentOpenHouseVisitors from "./pages/agents/open-house/visitors";
import AgentAudit from "./pages/agents/audit";
import InviteAcceptPage from "./pages/invite";
import { toast } from "@/components/ui/use-toast";
import { AccessGate } from "@/components/auth/AccessGate";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__MSW_ERROR__) {
      toast({
        title: 'Mocks no disponibles',
        description: window.__MSW_ERROR__,
        variant: 'destructive',
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invite/:token" element={<InviteAcceptPage />} />

            {/* Agent Platform Routes */}
            <Route path="/agents" element={<AgentErrorBoundary><AgentLayout /></AgentErrorBoundary>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AccessGate cap="view_dashboard"><AgentOverview /></AccessGate>} />
              <Route path="leads" element={<AccessGate cap="view_leads"><AgentLeads /></AccessGate>} />
              {/* PDF route alias: /agents/lead/:id */}
              <Route path="lead/:leadId" element={<AccessGate cap="view_leads"><AgentLeadDetail /></AccessGate>} />
              <Route path="leads/:leadId" element={<AccessGate cap="view_leads"><AgentLeadDetail /></AccessGate>} />
              <Route path="inbox" element={<AccessGate cap="view_inbox"><AgentInbox /></AccessGate>} />
              <Route path="calendar" element={<AccessGate cap="view_calendar"><AgentCalendar /></AccessGate>} />
              <Route path="listings" element={<AccessGate cap="view_listings"><AgentListings /></AccessGate>} />
              <Route path="listings/new" element={<AccessGate cap="view_listings"><AgentListingWizard /></AccessGate>} />
              <Route path="listings/:listingId/edit" element={<AccessGate cap="view_listings"><AgentListingWizard /></AccessGate>} />
              <Route path="listings/:listingId" element={<AccessGate cap="view_listings"><AgentListingDetail /></AccessGate>} />
              <Route path="profile" element={<AgentProfilePage />} />
              <Route path="profile/:agentId" element={<AgentProfilePage />} />
              <Route path="credits" element={<AccessGate cap="view_billing"><AgentCredits /></AccessGate>} />
              <Route path="team" element={<AccessGate cap="view_team"><AgentTeam /></AccessGate>} />
              <Route path="reports" element={<AccessGate cap="view_reports_self"><AgentReports /></AccessGate>} />
              <Route path="reports/leads" element={<AccessGate cap="view_reports_self"><AgentLeadReport /></AccessGate>} />
              <Route path="reports/experience" element={<AccessGate cap="view_reports_self"><AgentExperienceReport /></AccessGate>} />
              <Route path="reports/roi" element={<AccessGate cap="view_reports_self"><AgentRoiReport /></AccessGate>} />
              <Route path="reports/team" element={<AccessGate cap="view_reports_team"><AgentTeamReport /></AccessGate>} />
              <Route path="roadmap" element={<AgentRoadmap />} />
              <Route path="notifications" element={<AccessGate cap="view_notifications"><AgentNotifications /></AccessGate>} />
              <Route path="tasks" element={<AccessGate cap="view_tasks"><AgentTasks /></AccessGate>} />
              <Route path="integrations" element={<AgentIntegrations />} />
              <Route path="settings/notifications" element={<AgentNotificationSettings />} />
              <Route path="open-house/visitors" element={<AgentOpenHouseVisitors />} />
              <Route path="settings" element={<AccessGate cap="view_settings"><AgentSettings /></AccessGate>} />
              <Route path="audit" element={<AgentAudit />} />
            </Route>


            {/* Lovable reference layout (v2) – start with Equipo */}
            <Route path="/agents/team-v2" element={<AgentErrorBoundary><LovableAgentLayout /></AgentErrorBoundary>}>
              <Route element={<AgentTeamV2WorkspaceLayout />}>
                <Route index element={<AccessGate cap="view_team"><AgentTeamV2 /></AccessGate>} />
                <Route path="settings" element={<AccessGate cap="manage_team_settings"><AgentTeamV2Settings /></AccessGate>} />
                <Route path="member/:id" element={<AccessGate cap="view_team"><AgentTeamMemberDetailV2 /></AccessGate>} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
