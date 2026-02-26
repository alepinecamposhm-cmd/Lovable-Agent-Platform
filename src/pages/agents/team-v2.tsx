import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Settings,
  MoreVertical,
  Crown,
  Shield,
  User,
  Pause,
  Play,
  Mail,
  RefreshCw,
  Trash2,
  BarChart3,
  ListFilter,
  Activity,
  ArrowLeftRight,
  StickyNote,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  mockTeam,
  mockRoutingRules,
  mockPendingInvitations,
  mockTeamPerformance,
  mockTeamActivity,
  mockLeads,
} from '@/data/mockData';
import { TeamMemberRole, TeamMemberStatus, LeadRoutingRule, TeamActivityEvent } from '@/types';
import { RoutingRulesTable } from '@/components/team/RoutingRulesTable';
import { PerformanceTable } from '@/components/team/PerformanceTable';
import type { TeamPerformanceData } from '@/components/team/PerformanceTable';
import { PendingInvitations, PendingInvitation } from '@/components/team/PendingInvitations';
import { PauseMemberDialog, ActivateMemberDialog } from '@/components/team/PauseMemberDialog';
import { RemoveMemberDialog } from '@/components/team/RemoveMemberDialog';
import { TransferLeadershipDialog } from '@/components/team/TransferLeadershipDialog';
import { ChangeRoleDialog } from '@/components/team/ChangeRoleDialog';
import { TeamSettingsSheet } from '@/components/team/TeamSettingsSheet';
import { ReassignLeadsDialog } from '@/components/team/ReassignLeadsDialog';
import { TeamActivityLog } from '@/components/team/TeamActivityLog';
import { TeamLeadsOverview } from '@/components/team/TeamLeadsOverview';
import { TeamPlanLimitBadge } from '@/components/team/TeamPlanLimitBadge';
import { BulkActionToolbar } from '@/components/team/BulkActionToolbar';
import { TeamOnboardingChecklist } from '@/components/team/TeamOnboardingChecklist';
import { TeamWorkloadSummary } from "@/components/team/TeamWorkloadSummary";
import { WorkloadIndicator } from '@/components/team/WorkloadIndicator';
import { getNoteForMember } from '@/components/team/MemberNotesCard';
import { ScheduleCompactDots } from '@/components/team/AgentScheduleGrid';
import { AgentComparisonSheet } from '@/components/team/AgentComparisonSheet';
import { TeamProfileCard } from '@/components/team/TeamProfileCard';
import { currentAgent } from '@/data/mockData';
import { toast } from 'sonner';
import type { WeeklySchedule } from '@/types';

const roleConfig: Record<TeamMemberRole, { label: string; icon: React.ReactNode; color: string }> = {
  lider: { label: 'Líder', icon: <Crown className="h-4 w-4" />, color: 'text-yellow-500' },
  admin: { label: 'Admin', icon: <Shield className="h-4 w-4" />, color: 'text-blue-500' },
  agente: { label: 'Agente', icon: <User className="h-4 w-4" />, color: 'text-muted-foreground' },
};

const statusConfig: Record<TeamMemberStatus, { label: string; color: string }> = {
  activo: { label: 'Activo', color: 'bg-green-500' },
  pausado: { label: 'Pausado', color: 'bg-yellow-500' },
  invitado: { label: 'Invitado', color: 'bg-blue-500' },
};

// Mock team agents data
const initialTeamAgents = [
  {
    id: 'agent-001',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    role: 'lider' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 40,
    leadsThisMonth: 12,
    conversionRate: 18,
  },
  {
    id: 'agent-002',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    role: 'agente' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 35,
    leadsThisMonth: 8,
    conversionRate: 22,
  },
  {
    id: 'agent-003',
    name: 'Miguel Rodríguez',
    email: 'miguel.rodriguez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    role: 'agente' as TeamMemberRole,
    status: 'pausado' as TeamMemberStatus,
    leadRoutingWeight: 25,
    leadsThisMonth: 0,
    conversionRate: 15,
  },

  {
    id: 'agent-004',
    name: 'Sofía Torres',
    email: 'sofia.torres@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    role: 'agente' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 0,
    leadsThisMonth: 6,
    conversionRate: 19,
  },
  {
    id: 'agent-005',
    name: 'Pedro García',
    email: 'pedro.garcia@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    role: 'admin' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 0,
    leadsThisMonth: 4,
    conversionRate: 16,
  },
  {
    id: 'agent-006',
    name: 'Javier Soto',
    email: 'javier.soto@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
    role: 'agente' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 0,
    leadsThisMonth: 3,
    conversionRate: 14,
  },
  {
    id: 'agent-007',
    name: 'Lucía Reyes',
    email: 'lucia.reyes@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia',
    role: 'agente' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 0,
    leadsThisMonth: 2,
    conversionRate: 11,
  },
];

const DEFAULT_TEAM_NAME = 'Equipo de Carlos Martínez';

export default function TeamV2() {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'agente' | 'admin'>('agente');
  const [agents, setAgents] = useState(initialTeamAgents);
  const [routingRules, setRoutingRules] = useState<LeadRoutingRule[]>(mockRoutingRules);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>(
    mockPendingInvitations.map((i) => ({
      ...i,
      role: i.role as TeamMemberRole,
    }))
  );
  const [routingSubTab, setRoutingSubTab] = useState<'weights' | 'rules'>('weights');
  const [activeTab, setActiveTab] = useState('members');

  // Dialog states
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof agents[0] | null>(null);

  // Bulk selection state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  
  // Team settings state
  const [teamSettings, setTeamSettings] = useState({
    name: mockTeam.name,
    description: '',
  });

  // Activity log state
  const [activityLog, setActivityLog] = useState<TeamActivityEvent[]>(mockTeamActivity);

  // Onboarding tracking
  const [hasVisitedPerformance, setHasVisitedPerformance] = useState(false);
  const [highlightPerformance, setHighlightPerformance] = useState(false);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sprint 9 state
  const [comparisonSheetOpen, setComparisonSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const leadLimitByAgent = useMemo<Record<string, number>>(
    () => ({
      // Force 3 visual capacity states in V2 mock:
      // Carlos 1/2 (green), Sofia 2/2 (amber), Pedro 1/9 (low).
      'agent-001': 2,
      'agent-002': 12,
      'agent-003': 10,
      'agent-004': 2,
      'agent-005': 9,
      'agent-006': 11,
      'agent-007': 14,
    }),
    []
  );

  // Mock schedules for agents
  const [agentSchedules] = useState<Record<string, WeeklySchedule>>({
    'agent-001': currentAgent.availability,
    'agent-002': {
      monday: [{ start: '10:00', end: '19:00' }],
      tuesday: [{ start: '10:00', end: '19:00' }],
      wednesday: [{ start: '10:00', end: '19:00' }],
      thursday: [{ start: '10:00', end: '19:00' }],
      friday: [{ start: '10:00', end: '18:00' }],
      saturday: [],
      sunday: [],
    },
    'agent-003': {
      monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
    },
  });

  // Plan limit
  const TEAM_PLAN_LIMIT = 5;
  const isAtLimit = agents.length >= TEAM_PLAN_LIMIT;
  const isLeader = agents.find((a) => a.id === 'agent-001')?.role === 'lider';

  const totalLeads = agents.reduce((sum, a) => sum + a.leadsThisMonth, 0);
  const activeAgents = agents.filter((a) => a.status === 'activo');

  // Workload calculation
  
  // Mock override SOLO para probar "Carga del Equipo" en V2 sin tocar mockData global (V1 no se afecta)
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

const agentActiveLeads = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach((a) => {
      counts[a.id] = mockLeads.filter(
        (l) => (leadAssigneeOverride[l.id] ?? l.assignedAgentId) === a.id && l.stage !== 'cerrado' && l.stage !== 'perdido'
      ).length;
    });
    return counts;
  }, [agents, leadAssigneeOverride]);

  const workloadAgents = useMemo(() => {
    return agents
      .filter((a) => a.status !== "invitado")
      .map((a) => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        activeLeads: agentActiveLeads[a.id] ?? 0,
        leadLimit: leadLimitByAgent[a.id] ?? 10,
      }));
  }, [agents, agentActiveLeads, leadLimitByAgent]);

  const goToPerformance = useCallback(() => {
    setActiveTab("performance");
    setHasVisitedPerformance(true);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    setHighlightPerformance(true);
    highlightTimeout.current = setTimeout(() => setHighlightPerformance(false), 900);
    setTimeout(() => {
      document.getElementById("team-performance")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    };
  }, []);


  const teamAverageLeads = useMemo(() => {
    const activeIds = activeAgents.map((a) => a.id);
    if (activeIds.length === 0) return 1;
    const total = activeIds.reduce((sum, id) => sum + (agentActiveLeads[id] || 0), 0);
    return total / activeIds.length;
  }, [activeAgents, agentActiveLeads]);

  // Bulk helpers
  const memberNames = new Map(agents.map((a) => [a.id, a.name]));

  const performanceMetricsById = useMemo(() => {
    return new Map(mockTeamPerformance.map((row) => [row.id, row]));
  }, []);

  const normalizedPerformanceData = useMemo<TeamPerformanceData[]>(() => {
    const normalizePct = (value: number) => Math.max(40, Math.min(95, value));
    return agents.map((agent, idx) => {
      const existing = performanceMetricsById.get(agent.id);
      if (existing) return existing;

      const active = agentActiveLeads[agent.id] ?? 0;
      const leads = Math.max(0, active * 3);
      const responseRate = normalizePct(40 + ((idx * 11) % 56));
      const respondedUnder5Min = leads > 0 ? Math.round((responseRate / 100) * leads) : 0;
      const appointmentsScheduled = Math.max(0, Math.min(15, Math.round(leads * 0.35)));
      const conversions = Math.max(0, Math.min(30, Math.round(10 + (idx * 3) % 21)));
      const score = Math.max(50, Math.min(100, Math.round(58 + (idx * 7) % 43)));

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        avatar: agent.avatar,
        leadsReceived: leads,
        respondedUnder5Min,
        appointmentsScheduled,
        conversions,
        score,
      };
    });
  }, [agents, agentActiveLeads, performanceMetricsById]);

  const missingPerformanceMetricsCount = useMemo(() => {
    return agents.filter((agent) => !performanceMetricsById.has(agent.id)).length;
  }, [agents, performanceMetricsById]);

  const isSelectable = (agent: typeof agents[0]) =>
    agent.role !== 'lider' && agent.status !== 'invitado';

  const selectableAgents = agents.filter(isSelectable);

  const toggleMemberSelection = useCallback((id: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedMembers((prev) => {
      if (prev.size === selectableAgents.length) return new Set();
      return new Set(selectableAgents.map((a) => a.id));
    });
  }, [selectableAgents]);

  const handleBulkPause = (ids: string[]) => {
    setAgents((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, status: 'pausado' as TeamMemberStatus } : a))
    );
    toast.success(`${ids.length} agente${ids.length > 1 ? 's' : ''} pausado${ids.length > 1 ? 's' : ''}`);
  };

  const handleBulkChangeRole = (ids: string[], newRole: TeamMemberRole) => {
    setAgents((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, role: newRole } : a))
    );
    toast.success(`Rol actualizado para ${ids.length} agente${ids.length > 1 ? 's' : ''}`);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;

    const newInvitation: PendingInvitation = {
      id: `invite-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      sentAt: new Date(),
    };
    setPendingInvitations([...pendingInvitations, newInvitation]);
    toast.success(`Invitación enviada a ${inviteEmail}`);
    setInviteEmail('');
    setInviteRole('agente');
    setIsInviteOpen(false);
  };

  const handleCancelInvitation = (id: string) => {
    setPendingInvitations(pendingInvitations.filter((i) => i.id !== id));
  };

  const handleResendInvitation = (id: string) => {
    const invitation = pendingInvitations.find((i) => i.id === id);
    if (invitation) {
      setPendingInvitations(
        pendingInvitations.map((i) =>
          i.id === id ? { ...i, sentAt: new Date() } : i
        )
      );
    }
  };

  const handlePauseMember = (memberId: string, reassignTo?: string) => {
    setAgents(agents.map((a) => (a.id === memberId ? { ...a, status: 'pausado' as TeamMemberStatus } : a)));
    toast.success(`Agente pausado correctamente`);
  };

  const handleActivateMember = (memberId: string) => {
    setAgents(agents.map((a) => (a.id === memberId ? { ...a, status: 'activo' as TeamMemberStatus } : a)));
    toast.success(`Agente activado correctamente`);
  };

  const handleRemoveMember = (memberId: string, reassignTo: string | null) => {
    const member = agents.find((a) => a.id === memberId);
    setAgents(agents.filter((a) => a.id !== memberId));
    if (reassignTo) {
      const target = agents.find((a) => a.id === reassignTo);
      toast.success(`${member?.name} removido. Leads reasignados a ${target?.name}`);
    } else {
      toast.success(`${member?.name} fue removido del equipo`);
    }
  };

  const openPauseDialog = (member: typeof agents[0]) => {
    setSelectedMember(member);
    setPauseDialogOpen(true);
  };

  const openActivateDialog = (member: typeof agents[0]) => {
    setSelectedMember(member);
    setActivateDialogOpen(true);
  };

  const openRemoveDialog = (member: typeof agents[0]) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const openReassignDialog = (member: typeof agents[0]) => {
    setSelectedMember(member);
    setReassignDialogOpen(true);
  };

  const openChangeRoleDialog = (member: typeof agents[0]) => {
    setSelectedMember(member);
    setChangeRoleDialogOpen(true);
  };

  // Get the current leader
  const currentLeader = agents.find((a) => a.role === 'lider');

  // Count leads for reassignment
  const getAgentLeadsCount = (agentId: string) => {
    const activeLeads = mockLeads.filter(
      (l) => l.assignedAgentId === agentId && l.stage !== 'cerrado' && l.stage !== 'perdido'
    );
    const uncontactedLeads = activeLeads.filter((l) => l.stage === 'nuevo');
    return { active: activeLeads.length, uncontacted: uncontactedLeads.length };
  };

  // Handlers for features
  const handleTransferLeadership = (newLeaderId: string) => {
    const newLeader = agents.find((a) => a.id === newLeaderId);
    setAgents(agents.map((a) => {
      if (a.role === 'lider') return { ...a, role: 'admin' as TeamMemberRole };
      if (a.id === newLeaderId) return { ...a, role: 'lider' as TeamMemberRole };
      return a;
    }));
    addActivityEvent('leadership_transferred', `Liderazgo transferido a ${newLeader?.name}`, undefined, newLeaderId, newLeader?.name);
    toast.success(`Liderazgo transferido a ${newLeader?.name}`);
  };

  const handleChangeRole = (memberId: string, newRole: TeamMemberRole) => {
    const member = agents.find((a) => a.id === memberId);
    const oldRole = member?.role;
    setAgents(agents.map((a) => (a.id === memberId ? { ...a, role: newRole } : a)));
    addActivityEvent('role_changed', `Rol de ${member?.name} cambiado a ${roleConfig[newRole].label}`, `Antes: ${roleConfig[oldRole!].label}`, memberId, member?.name);
    toast.success(`Rol de ${member?.name} cambiado a ${roleConfig[newRole].label}`);
  };

  const handleSaveSettings = (settings: { name: string; description: string }) => {
    setTeamSettings(settings);
    toast.success('Configuración del equipo actualizada');
  };

  const handleReassignLeads = (fromAgentId: string, toAgentId: string, onlyUncontacted: boolean) => {
    const fromAgent = agents.find((a) => a.id === fromAgentId);
    const toAgent = agents.find((a) => a.id === toAgentId);
    const leadCounts = getAgentLeadsCount(fromAgentId);
    const count = onlyUncontacted ? leadCounts.uncontacted : leadCounts.active;
    addActivityEvent('leads_reassigned', `${count} leads reasignados de ${fromAgent?.name} a ${toAgent?.name}`);
    toast.success(`${count} leads reasignados a ${toAgent?.name}`);
  };

  const addActivityEvent = (
    type: TeamActivityEvent['type'],
    description: string,
    details?: string,
    targetId?: string,
    targetName?: string
  ) => {
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
    setActivityLog((prev) => [newEvent, ...prev]);
  };

  // Onboarding checklist detection
  const hasCustomWeights = agents.some((a) => a.leadRoutingWeight !== 33 && a.leadRoutingWeight !== 34);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{teamSettings.name}</h1>
          <p className="text-muted-foreground">
            Gestiona tu equipo y distribuye leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setProfileSheetOpen(true)} aria-label="Ver perfil del equipo">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setSettingsSheetOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              {isAtLimit ? (
                <div className="relative group">
                  <Button disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Invitar Agente
                  </Button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md border shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Límite de miembros alcanzado
                  </div>
                </div>
              ) : (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invitar Agente
                  {pendingInvitations.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pendingInvitations.length}
                    </Badge>
                  )}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Agente al Equipo</DialogTitle>
                <DialogDescription>
                  Envía una invitación por email para unirse al equipo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="agente@email.com"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'agente' | 'admin')}
                  >
                    <option value="agente">Agente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Invitación
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Onboarding Checklist */}
      {isLeader && (
        <TeamOnboardingChecklist
          agentCount={agents.length}
          teamName={teamSettings.name}
          defaultTeamName={DEFAULT_TEAM_NAME}
          hasCustomWeights={hasCustomWeights}
          routingRulesCount={routingRules.length}
          hasVisitedPerformance={hasVisitedPerformance}
          onInvite={() => setIsInviteOpen(true)}
          onSettings={() => setSettingsSheetOpen(true)}
          onGoToRouting={() => {
            setActiveTab('routing');
            setRoutingSubTab('rules');
          }}
          onGoToPerformance={() => {
            setActiveTab('performance');
            setHasVisitedPerformance(true);
          }}
        />
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeAgents.length} activos
            </p>
            <TeamPlanLimitBadge currentCount={agents.length} maxCount={TEAM_PLAN_LIMIT} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads del Mes</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              distribuidos entre el equipo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <Badge variant="outline">Promedio</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(agents.reduce((sum, a) => sum + a.conversionRate, 0) / agents.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              promedio del equipo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad</CardTitle>
            <Progress value={75} className="w-16" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              de capacidad de leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      <PendingInvitations
        invitations={pendingInvitations}
        onCancel={handleCancelInvitation}
        onResend={handleResendInvitation}
      />

      {/* Team Members & Routing */}
      
      {activeTab !== "performance" && (
        <TeamWorkloadSummary
          teamName="Equipo Polanco"
          agents={workloadAgents}
          onMoreClick={goToPerformance}
          className="mb-4"
        />
      )}

<div className="mt-2">
<Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v);
        if (v === 'performance') setHasVisitedPerformance(true);
      }}>
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="routing">
            <ListFilter className="mr-2 h-4 w-4" />
            Ruteo de Leads
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Actividad
          </TabsTrigger>
          {isLeader && (
            <TabsTrigger value="leads">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Leads
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-4">
          {/* Select all header */}
          {isLeader && selectableAgents.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedMembers.size === selectableAgents.length && selectableAgents.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Seleccionar todos los miembros"
              />
              <span className="text-sm text-muted-foreground">
                Seleccionar todos
              </span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const canSelect = isSelectable(agent);
              const isSelected = selectedMembers.has(agent.id);

              return (
                <Card
                  key={agent.id}
                  className={cn(
                    'transition-all',
                    agent.status === 'pausado' && 'opacity-70',
                    isSelected && 'ring-2 ring-primary'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Bulk checkbox */}
                      <div className="relative">
                        {isLeader && canSelect && (
                          <div className="absolute -top-1 -left-1 z-10">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleMemberSelection(agent.id)}
                              className="bg-background/80 backdrop-blur-sm"
                              aria-label={`Seleccionar a ${agent.name}`}
                            />
                          </div>
                        )}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold truncate">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {agent.email}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/agents/team-v2/member/${agent.id}`)}>
                                <User className="mr-2 h-4 w-4" />
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openReassignDialog(agent)}>
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                Reasignar leads
                              </DropdownMenuItem>
                              {agent.role !== 'lider' && (
                                <DropdownMenuItem onClick={() => openChangeRoleDialog(agent)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Cambiar rol
                                </DropdownMenuItem>
                              )}
                              {agent.role === 'lider' && (
                                <DropdownMenuItem onClick={() => setTransferDialogOpen(true)}>
                                  <Crown className="mr-2 h-4 w-4" />
                                  Transferir liderazgo
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {agent.status === 'activo' ? (
                                <DropdownMenuItem onClick={() => openPauseDialog(agent)}>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pausar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openActivateDialog(agent)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activar
                                </DropdownMenuItem>
                              )}
                              {agent.role !== 'lider' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => openRemoveDialog(agent)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remover del equipo
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div className={cn(
                            "flex items-center gap-1 text-sm",
                            roleConfig[agent.role].color
                          )}>
                            {roleConfig[agent.role].icon}
                            <span>{roleConfig[agent.role].label}</span>
                          </div>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            statusConfig[agent.status].color
                          )} />
                          <span className="text-xs text-muted-foreground">
                            {statusConfig[agent.status].label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-2xl font-bold">{agent.leadsThisMonth}</p>
                            <p className="text-xs text-muted-foreground">Leads del mes</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{agent.conversionRate}%</p>
                            <p className="text-xs text-muted-foreground">Conversión</p>
                          </div>
                        </div>

                        {/* Workload indicator */}
                        <div className="mt-3">
                          <WorkloadIndicator
                            agentLeads={agentActiveLeads[agent.id] || 0}
                            teamAverage={teamAverageLeads}
                            isPaused={agent.status === 'pausado'}
                          />
                        </div>

                        {/* Schedule dots + note badge */}
                        <div className="flex items-center justify-between mt-2">
                          {agentSchedules[agent.id] && (
                            <ScheduleCompactDots schedule={agentSchedules[agent.id]} />
                          )}
                          {getNoteForMember(agent.id) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <StickyNote className="h-3.5 w-3.5 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>Tiene nota del líder</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* H1: Inline Toggle */}
                        {isLeader && agent.status !== 'invitado' && (
                          <div className="flex items-center justify-between mt-4 pt-3 border-t">
                            <span className="text-xs text-muted-foreground">Recibir leads</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      checked={agent.status === 'activo'}
                                      disabled={agent.role === 'lider'}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          openActivateDialog(agent);
                                        } else {
                                          openPauseDialog(agent);
                                        }
                                      }}
                                      aria-label={`Toggle recibir leads para ${agent.name}`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {agent.role === 'lider'
                                    ? 'El líder no puede ser pausado'
                                    : agent.status === 'activo'
                                    ? 'Pausar agente'
                                    : 'Activar agente'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="routing" className="mt-4 space-y-6">
          {/* Sub-tabs for routing */}
          <div className="flex gap-2">
            <Button
              variant={routingSubTab === 'weights' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoutingSubTab('weights')}
            >
              Distribución por Peso
            </Button>
            <Button
              variant={routingSubTab === 'rules' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoutingSubTab('rules')}
            >
              Reglas con Criterios
            </Button>
          </div>

          {routingSubTab === 'weights' ? (
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Leads</CardTitle>
                <CardDescription>
                  Configura el porcentaje de leads que recibe cada agente activo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeAgents.map((agent) => (
                  <div key={agent.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <span className="font-bold">{agent.leadRoutingWeight}%</span>
                    </div>
                    <Slider
                      value={[agent.leadRoutingWeight]}
                      max={100}
                      step={5}
                      className="w-full"
                      onValueChange={([value]) => {
                        setAgents(agents.map((a) =>
                          a.id === agent.id ? { ...a, leadRoutingWeight: value } : a
                        ));
                      }}
                    />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Los leads se distribuyen automáticamente según estos porcentajes cuando se recibe uno nuevo.
                    Los agentes pausados no reciben leads.
                  </p>
                </div>

                <Button className="w-full" onClick={() => toast.success('Configuración guardada')}>
                  Guardar Configuración
                </Button>
              </CardContent>
            </Card>
          ) : (
            <RoutingRulesTable
              rules={routingRules}
              agents={agents}
              onRulesChange={setRoutingRules}
            />
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-4 space-y-4">
          <div id="team-performance" className="scroll-mt-24" />
          <div
            className={cn(
              "space-y-4 transition duration-300 ease-out rounded-lg",
              highlightPerformance ? "ring-2 ring-primary/30" : undefined
            )}
          >
            <TeamWorkloadSummary
              teamName="Equipo Polanco"
              agents={workloadAgents}
              mode="full"
            />
            <PerformanceTable
              data={normalizedPerformanceData}
              totalAgents={agents.length}
              missingMetricsCount={missingPerformanceMetricsCount}
              onCompare={() => setComparisonSheetOpen(true)}
              compareDisabled={agents.length < 2}
            />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <TeamActivityLog activities={activityLog} />
        </TabsContent>

        {isLeader && (
          <TabsContent value="leads" className="mt-4">
            <TeamLeadsOverview agents={agents} leads={mockLeads} />
          </TabsContent>
        )}
      </Tabs>
</div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedIds={selectedMembers}
        memberNames={memberNames}
        onPause={handleBulkPause}
        onChangeRole={handleBulkChangeRole}
        onClear={() => setSelectedMembers(new Set())}
      />

      {/* Dialogs */}
      <PauseMemberDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        member={selectedMember}
        activeLeadsCount={selectedMember ? selectedMember.leadsThisMonth : 0}
        otherActiveAgents={activeAgents.filter((a) => a.id !== selectedMember?.id)}
        onConfirm={handlePauseMember}
      />

      <ActivateMemberDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        member={selectedMember}
        onConfirm={handleActivateMember}
      />

      <RemoveMemberDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        member={selectedMember}
        activeLeadsCount={selectedMember ? selectedMember.leadsThisMonth : 0}
        otherActiveAgents={activeAgents.filter((a) => a.id !== selectedMember?.id)}
        onConfirm={handleRemoveMember}
      />

      {/* New Dialogs for Sprint 6 */}
      {currentLeader && (
        <TransferLeadershipDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          currentLeader={currentLeader}
          eligibleMembers={agents.filter((a) => a.id !== currentLeader.id && a.status === 'activo')}
          onConfirm={handleTransferLeadership}
        />
      )}

      <ChangeRoleDialog
        open={changeRoleDialogOpen}
        onOpenChange={setChangeRoleDialogOpen}
        member={selectedMember}
        onConfirm={handleChangeRole}
      />

      <TeamSettingsSheet
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        settings={teamSettings}
        onSave={handleSaveSettings}
      />

      <ReassignLeadsDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        sourceAgent={selectedMember}
        targetAgents={agents.filter((a) => a.id !== selectedMember?.id)}
        activeLeadsCount={selectedMember ? getAgentLeadsCount(selectedMember.id).active : 0}
        uncontactedLeadsCount={selectedMember ? getAgentLeadsCount(selectedMember.id).uncontacted : 0}
        onConfirm={handleReassignLeads}
      />

      {/* Sprint 9: Comparison Sheet */}
      <AgentComparisonSheet
        open={comparisonSheetOpen}
        onOpenChange={setComparisonSheetOpen}
        agents={mockTeamPerformance}
      />

      {/* Sprint 9: Team Profile */}
      <TeamProfileCard
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
        teamName={teamSettings.name}
        teamDescription={teamSettings.description}
        agents={agents.map((a) => ({ id: a.id, name: a.name, avatar: a.avatar, status: a.status, role: a.role }))}
        stats={{
          activeMembers: activeAgents.length,
          totalLeads,
          avgResponseRate: Math.round(agents.reduce((sum, a) => sum + a.conversionRate, 0) / agents.length),
        }}
      />
    </div>
  );
}
