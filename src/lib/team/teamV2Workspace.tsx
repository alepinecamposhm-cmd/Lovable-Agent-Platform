import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { mockLeads, mockPendingInvitations, mockRoutingRules, mockTeam, mockTeamActivity } from '@/data/mockData';
import type { LeadRoutingRule, TeamActivityEvent, TeamMemberRole, TeamMemberStatus } from '@/types';
import { buildTeamWorkloadMetrics, getTeamWorkloadToneClasses } from './buildTeamWorkloadMetrics';

export type TeamV2Agent = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  leadRoutingWeight: number;
  leadsThisMonth: number;
  conversionRate: number;
};

export type TeamV2PendingInvitation = {
  id: string;
  email: string;
  role: TeamMemberRole;
  sentAt: Date;
};

export type TeamV2Settings = {
  name: string;
  description: string;
  defaultLeadLimit: number;
};

const TEAM_PLAN_LIMIT = 5;
const DEFAULT_TEAM_NAME = 'Equipo de Carlos Martínez';

const initialTeamAgents: TeamV2Agent[] = [
  {
    id: 'agent-001',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    role: 'lider',
    status: 'activo',
    leadRoutingWeight: 40,
    leadsThisMonth: 12,
    conversionRate: 18,
  },
  {
    id: 'agent-002',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    role: 'agente',
    status: 'activo',
    leadRoutingWeight: 35,
    leadsThisMonth: 8,
    conversionRate: 22,
  },
  {
    id: 'agent-003',
    name: 'Miguel Rodríguez',
    email: 'miguel.rodriguez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    role: 'agente',
    status: 'pausado',
    leadRoutingWeight: 25,
    leadsThisMonth: 0,
    conversionRate: 15,
  },
  {
    id: 'agent-004',
    name: 'Sofía Torres',
    email: 'sofia.torres@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    role: 'agente',
    status: 'activo',
    leadRoutingWeight: 0,
    leadsThisMonth: 6,
    conversionRate: 19,
  },
  {
    id: 'agent-005',
    name: 'Pedro García',
    email: 'pedro.garcia@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    role: 'admin',
    status: 'activo',
    leadRoutingWeight: 0,
    leadsThisMonth: 4,
    conversionRate: 16,
  },
  {
    id: 'agent-006',
    name: 'Javier Soto',
    email: 'javier.soto@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
    role: 'agente',
    status: 'activo',
    leadRoutingWeight: 0,
    leadsThisMonth: 3,
    conversionRate: 14,
  },
  {
    id: 'agent-007',
    name: 'Lucía Reyes',
    email: 'lucia.reyes@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia',
    role: 'agente',
    status: 'activo',
    leadRoutingWeight: 0,
    leadsThisMonth: 2,
    conversionRate: 11,
  },
];

type TeamV2WorkspaceValue = {
  DEFAULT_TEAM_NAME: string;
  TEAM_PLAN_LIMIT: number;
  agents: TeamV2Agent[];
  setAgents: React.Dispatch<React.SetStateAction<TeamV2Agent[]>>;
  activeAgents: TeamV2Agent[];
  currentLeader?: TeamV2Agent;
  isLeader: boolean;
  isAtLimit: boolean;
  totalLeads: number;
  routingRules: LeadRoutingRule[];
  setRoutingRules: React.Dispatch<React.SetStateAction<LeadRoutingRule[]>>;
  pendingInvitations: TeamV2PendingInvitation[];
  handleInvite: (email: string, role: 'agente' | 'admin') => boolean;
  handleCancelInvitation: (id: string) => void;
  handleResendInvitation: (id: string) => void;
  teamSettings: TeamV2Settings;
  handleSaveSettings: (settings: Partial<TeamV2Settings>) => void;
  activityLog: TeamActivityEvent[];
  addActivityEvent: (
    type: TeamActivityEvent['type'],
    description: string,
    details?: string,
    targetId?: string,
    targetName?: string
  ) => void;
  resolveLeadLimit: (agentId: string) => number;
  agentActiveLeads: Record<string, number>;
  workloadAgents: Array<{
    id: string;
    name: string;
    avatar?: string;
    activeLeads: number;
    leadLimit: number;
  }>;
  teamWorkloadMetrics: ReturnType<typeof buildTeamWorkloadMetrics>;
  teamWorkloadTone: ReturnType<typeof getTeamWorkloadToneClasses>;
  hasCustomWeights: boolean;
  getAgentLeadsCount: (agentId: string) => { active: number; uncontacted: number };
};

const TeamV2WorkspaceContext = createContext<TeamV2WorkspaceValue | null>(null);

export function TeamV2WorkspaceProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<TeamV2Agent[]>(initialTeamAgents);
  const [routingRules, setRoutingRules] = useState<LeadRoutingRule[]>(mockRoutingRules);
  const [pendingInvitations, setPendingInvitations] = useState<TeamV2PendingInvitation[]>(
    mockPendingInvitations.map((invitation) => ({
      ...invitation,
      role: invitation.role as TeamMemberRole,
    }))
  );
  const [teamSettings, setTeamSettings] = useState<TeamV2Settings>({
    name: mockTeam.name,
    description: '',
    defaultLeadLimit: 10,
  });
  const [activityLog, setActivityLog] = useState<TeamActivityEvent[]>(mockTeamActivity);

  const leadLimitByAgent = useMemo<Record<string, number>>(
    () => ({
      'agent-001': 14,
      'agent-002': 12,
      'agent-003': 10,
      'agent-004': 2,
      'agent-005': 9,
      'agent-006': 11,
      'agent-007': 14,
    }),
    []
  );

  const leadAssigneeOverride = useMemo<Record<string, string>>(
    () => ({
      'lead-001': 'agent-001',
      'lead-002': 'agent-004',
      'lead-003': 'agent-004',
      'lead-004': 'agent-005',
      'lead-005': 'agent-006',
      'lead-006': 'agent-007',
    }),
    []
  );

  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.status === 'activo'),
    [agents]
  );

  const currentLeader = useMemo(
    () => agents.find((agent) => agent.role === 'lider'),
    [agents]
  );

  const isLeader = currentLeader?.id === 'agent-001';
  const isAtLimit = agents.length >= TEAM_PLAN_LIMIT;
  const totalLeads = useMemo(
    () => agents.reduce((sum, agent) => sum + agent.leadsThisMonth, 0),
    [agents]
  );

  const resolveLeadLimit = useCallback(
    (agentId: string) => {
      const agentLeadLimit = leadLimitByAgent[agentId];
      return agentLeadLimit && agentLeadLimit > 0
        ? agentLeadLimit
        : teamSettings.defaultLeadLimit;
    },
    [leadLimitByAgent, teamSettings.defaultLeadLimit]
  );

  const agentActiveLeads = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach((agent) => {
      counts[agent.id] = mockLeads.filter(
        (lead) =>
          (leadAssigneeOverride[lead.id] ?? lead.assignedAgentId) === agent.id &&
          lead.stage !== 'cerrado' &&
          lead.stage !== 'perdido'
      ).length;
    });
    return counts;
  }, [agents, leadAssigneeOverride]);

  const workloadAgents = useMemo(
    () =>
      agents
        .filter((agent) => agent.status !== 'invitado')
        .map((agent) => ({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          activeLeads: agentActiveLeads[agent.id] ?? 0,
          leadLimit: resolveLeadLimit(agent.id),
        })),
    [agents, agentActiveLeads, resolveLeadLimit]
  );

  const teamWorkloadMetrics = useMemo(
    () => buildTeamWorkloadMetrics(workloadAgents),
    [workloadAgents]
  );

  const teamWorkloadTone = useMemo(
    () => getTeamWorkloadToneClasses(teamWorkloadMetrics.tone),
    [teamWorkloadMetrics.tone]
  );

  const hasCustomWeights = useMemo(
    () => agents.some((agent) => agent.leadRoutingWeight !== 33 && agent.leadRoutingWeight !== 34),
    [agents]
  );

  const handleInvite = useCallback((email: string, role: 'agente' | 'admin') => {
    if (!email.trim()) return false;
    const newInvitation: TeamV2PendingInvitation = {
      id: `invite-${Date.now()}`,
      email: email.trim(),
      role,
      sentAt: new Date(),
    };
    setPendingInvitations((current) => [...current, newInvitation]);
    return true;
  }, []);

  const handleCancelInvitation = useCallback((id: string) => {
    setPendingInvitations((current) => current.filter((invitation) => invitation.id !== id));
  }, []);

  const handleResendInvitation = useCallback((id: string) => {
    setPendingInvitations((current) =>
      current.map((invitation) =>
        invitation.id === id ? { ...invitation, sentAt: new Date() } : invitation
      )
    );
  }, []);

  const handleSaveSettings = useCallback((settings: Partial<TeamV2Settings>) => {
    setTeamSettings((current) => ({
      ...current,
      ...settings,
    }));
  }, []);

  const addActivityEvent = useCallback<
    TeamV2WorkspaceValue['addActivityEvent']
  >((type, description, details, targetId, targetName) => {
    const newEvent: TeamActivityEvent = {
      id: `activity-${Date.now()}`,
      teamId: 'team-001',
      type,
      description,
      details,
      actorId: 'agent-001',
      actorName: 'Carlos Martínez',
      actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      targetId,
      targetName,
      timestamp: new Date(),
    };
    setActivityLog((current) => [newEvent, ...current]);
  }, []);

  const getAgentLeadsCount = useCallback(
    (agentId: string) => {
      const activeLeads = mockLeads.filter(
        (lead) =>
          (leadAssigneeOverride[lead.id] ?? lead.assignedAgentId) === agentId &&
          lead.stage !== 'cerrado' &&
          lead.stage !== 'perdido'
      );
      return {
        active: activeLeads.length,
        uncontacted: activeLeads.filter((lead) => lead.stage === 'nuevo').length,
      };
    },
    [leadAssigneeOverride]
  );

  const value = useMemo<TeamV2WorkspaceValue>(
    () => ({
      DEFAULT_TEAM_NAME,
      TEAM_PLAN_LIMIT,
      agents,
      setAgents,
      activeAgents,
      currentLeader,
      isLeader,
      isAtLimit,
      totalLeads,
      routingRules,
      setRoutingRules,
      pendingInvitations,
      handleInvite,
      handleCancelInvitation,
      handleResendInvitation,
      teamSettings,
      handleSaveSettings,
      activityLog,
      addActivityEvent,
      resolveLeadLimit,
      agentActiveLeads,
      workloadAgents,
      teamWorkloadMetrics,
      teamWorkloadTone,
      hasCustomWeights,
      getAgentLeadsCount,
    }),
    [
      agents,
      activeAgents,
      currentLeader,
      isLeader,
      isAtLimit,
      totalLeads,
      routingRules,
      pendingInvitations,
      handleInvite,
      handleCancelInvitation,
      handleResendInvitation,
      teamSettings,
      handleSaveSettings,
      activityLog,
      addActivityEvent,
      resolveLeadLimit,
      agentActiveLeads,
      workloadAgents,
      teamWorkloadMetrics,
      teamWorkloadTone,
      hasCustomWeights,
      getAgentLeadsCount,
    ]
  );

  return (
    <TeamV2WorkspaceContext.Provider value={value}>
      {children}
    </TeamV2WorkspaceContext.Provider>
  );
}

export function useTeamV2Workspace() {
  const context = useContext(TeamV2WorkspaceContext);
  if (!context) {
    throw new Error('useTeamV2Workspace must be used inside TeamV2WorkspaceProvider');
  }
  return context;
}

