import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/agents/team/store';
import { track } from '@/lib/agents/reports/analytics';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type ReportsTab = 'overview' | 'leads' | 'experience' | 'roi' | 'team';

const TAB_TO_PATH: Record<ReportsTab, string> = {
  overview: '/agents/reports',
  leads: '/agents/reports/leads',
  experience: '/agents/reports/experience',
  roi: '/agents/reports/roi',
  team: '/agents/reports/team',
};

function getActiveTab(pathname: string): ReportsTab {
  if (pathname.startsWith('/agents/reports/leads')) return 'leads';
  if (pathname.startsWith('/agents/reports/experience')) return 'experience';
  if (pathname.startsWith('/agents/reports/roi')) return 'roi';
  if (pathname.startsWith('/agents/reports/team')) return 'team';
  return 'overview';
}

export function ReportsSubnav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const isLeader = currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'broker';

  const active = useMemo(() => getActiveTab(location.pathname), [location.pathname]);

  const onChange = (next: string) => {
    const to = next as ReportsTab;
    const from = active;
    if (to === from) return;
    track('reports.nav_click', { from, to });
    navigate(TAB_TO_PATH[to]);
  };

  return (
    <div className="overflow-x-auto">
      <Tabs value={active} onValueChange={onChange}>
        <TabsList className="w-full justify-start min-w-max">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Report</TabsTrigger>
          <TabsTrigger value="experience">Customer Experience</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
          {isLeader && <TabsTrigger value="team">Team</TabsTrigger>}
        </TabsList>
      </Tabs>
    </div>
  );
}

