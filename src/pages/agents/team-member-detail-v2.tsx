import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Crown,
  Shield,
  User,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MemberInfoCard } from '@/components/team/MemberInfoCard';
import { MemberMetricsCard } from '@/components/team/MemberMetricsCard';
import { MemberConfigCard } from '@/components/team/MemberConfigCard';
import { MemberActivityTimeline } from '@/components/team/MemberActivityTimeline';
import { MemberNotesCard } from '@/components/team/MemberNotesCard';
import { AgentScheduleGrid } from '@/components/team/AgentScheduleGrid';
import { PauseMemberDialog, ActivateMemberDialog } from '@/components/team/PauseMemberDialog';
import { RemoveMemberDialog } from '@/components/team/RemoveMemberDialog';
import { ReassignLeadsDialog } from '@/components/team/ReassignLeadsDialog';
import { ChangeRoleDialog } from '@/components/team/ChangeRoleDialog';
import { TransferLeadershipDialog } from '@/components/team/TransferLeadershipDialog';
import { TeamMemberRole, TeamMemberStatus, WeeklySchedule } from '@/types';
import { mockLeads, mockTeamActivity, currentAgent } from '@/data/mockData';
import { toast } from 'sonner';

// Mock team agents data (same as Team.tsx)
const teamAgentsData = [
  {
    id: 'agent-001',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@inmobiliaria.mx',
    phone: '+52 55 1234 5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    role: 'lider' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 40,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
    leadsReceived: 12,
    responseRate: 95,
    appointmentsScheduled: 8,
    conversions: 2,
  },
  {
    id: 'agent-002',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@inmobiliaria.mx',
    phone: '+52 55 2345 6789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    role: 'agente' as TeamMemberRole,
    status: 'activo' as TeamMemberStatus,
    leadRoutingWeight: 35,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    leadsReceived: 8,
    responseRate: 88,
    appointmentsScheduled: 5,
    conversions: 1,
  },
  {
    id: 'agent-003',
    name: 'Miguel Rodríguez',
    email: 'miguel.rodriguez@inmobiliaria.mx',
    phone: '+52 55 3456 7890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    role: 'agente' as TeamMemberRole,
    status: 'pausado' as TeamMemberStatus,
    leadRoutingWeight: 25,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    leadsReceived: 0,
    responseRate: 72,
    appointmentsScheduled: 0,
    conversions: 0,
  },
];

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

export default function TeamMemberDetailV2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find member
  const member = teamAgentsData.find((a) => a.id === id);

  // Dialog states
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Local state for member data
  const [memberState, setMemberState] = useState(member);

  // Mock schedule
  const mockSchedules: Record<string, WeeklySchedule> = {
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
  };
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    mockSchedules[id || ''] || currentAgent.availability
  );

  if (!member || !memberState) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Miembro no encontrado</h2>
          <p className="text-muted-foreground mb-4">
            El miembro que buscas no existe o fue removido del equipo.
          </p>
          <Button onClick={() => navigate('/agents/team-v2')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Equipo
          </Button>
        </div>
      </div>
    );
  }

  const activeLeadsCount = mockLeads.filter(
    (l) => l.assignedAgentId === memberState.id && l.stage !== 'cerrado' && l.stage !== 'perdido'
  ).length;

  const uncontactedLeadsCount = mockLeads.filter(
    (l) => l.assignedAgentId === memberState.id && l.stage === 'nuevo'
  ).length;

  const otherActiveAgents = teamAgentsData.filter(
    (a) => a.id !== memberState.id && a.status === 'activo'
  );

  const currentLeader = teamAgentsData.find((a) => a.role === 'lider');

  const handlePause = (memberId: string, reassignTo?: string) => {
    setMemberState((prev) => prev ? { ...prev, status: 'pausado' as TeamMemberStatus } : prev);
    toast.success(`${memberState.name} ha sido pausado`);
    if (reassignTo) {
      const targetAgent = teamAgentsData.find((a) => a.id === reassignTo);
      toast.info(`${activeLeadsCount} leads reasignados a ${targetAgent?.name}`);
    }
  };

  const handleActivate = (memberId: string) => {
    setMemberState((prev) => prev ? { ...prev, status: 'activo' as TeamMemberStatus } : prev);
    toast.success(`${memberState.name} ha sido activado`);
  };

  const handleRemove = (memberId: string, reassignTo: string | null) => {
    if (reassignTo) {
      const targetAgent = teamAgentsData.find((a) => a.id === reassignTo);
      toast.success(
        `${memberState.name} fue removido. ${activeLeadsCount} leads reasignados a ${targetAgent?.name}`
      );
    } else {
      toast.success(`${memberState.name} fue removido del equipo`);
    }
    navigate('/agents/team-v2');
  };

  const handleReassignLeads = (fromAgentId: string, toAgentId: string, onlyUncontacted: boolean) => {
    const toAgent = teamAgentsData.find((a) => a.id === toAgentId);
    const count = onlyUncontacted ? uncontactedLeadsCount : activeLeadsCount;
    toast.success(`${count} leads reasignados a ${toAgent?.name}`);
  };

  const handleChangeRole = (memberId: string, newRole: TeamMemberRole) => {
    setMemberState((prev) => prev ? { ...prev, role: newRole } : prev);
    toast.success(`Rol cambiado a ${roleConfig[newRole].label}`);
  };

  const handleTransferLeadership = (newLeaderId: string) => {
    const newLeader = teamAgentsData.find((a) => a.id === newLeaderId);
    // Current leader (this member) becomes admin
    setMemberState((prev) => prev ? { ...prev, role: 'admin' as TeamMemberRole } : prev);
    toast.success(`Liderazgo transferido a ${newLeader?.name}`);
  };

  const handleWeightChange = (weight: number) => {
    setMemberState((prev) => prev ? { ...prev, leadRoutingWeight: weight } : prev);
  };

  const handlePauseToggle = (paused: boolean) => {
    if (paused) {
      setPauseDialogOpen(true);
    } else {
      setActivateDialogOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/agents/team-v2">Equipo</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{memberState.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agents/team-v2')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarImage src={memberState.avatar} />
            <AvatarFallback className="text-lg">
              {memberState.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{memberState.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 text-sm ${roleConfig[memberState.role].color}`}>
                {roleConfig[memberState.role].icon}
                <span>{roleConfig[memberState.role].label}</span>
              </div>
              <div className={`h-2 w-2 rounded-full ${statusConfig[memberState.status].color}`} />
              <span className="text-sm text-muted-foreground">
                {statusConfig[memberState.status].label}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreVertical className="mr-2 h-4 w-4" />
              Acciones
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setReassignDialogOpen(true)}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Reasignar leads
            </DropdownMenuItem>
            {memberState.role !== 'lider' && (
              <DropdownMenuItem onClick={() => setChangeRoleDialogOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar rol
              </DropdownMenuItem>
            )}
            {memberState.role === 'lider' && (
              <DropdownMenuItem onClick={() => setTransferDialogOpen(true)}>
                <Crown className="mr-2 h-4 w-4" />
                Transferir liderazgo
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {memberState.status === 'activo' ? (
              <DropdownMenuItem onClick={() => setPauseDialogOpen(true)}>
                <Pause className="mr-2 h-4 w-4" />
                Pausar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setActivateDialogOpen(true)}>
                <Play className="mr-2 h-4 w-4" />
                Activar
              </DropdownMenuItem>
            )}
            {memberState.role !== 'lider' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setRemoveDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover del equipo
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <MemberInfoCard
            email={memberState.email}
            phone={memberState.phone}
            joinedAt={memberState.joinedAt}
          />
          <MemberConfigCard
            weight={memberState.leadRoutingWeight}
            isPaused={memberState.status === 'pausado'}
            onWeightChange={handleWeightChange}
            onPauseToggle={handlePauseToggle}
          />
          <AgentScheduleGrid
            schedule={schedule}
            onScheduleChange={setSchedule}
            editable
          />
          <MemberNotesCard memberId={memberState.id} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MemberMetricsCard
            leadsReceived={memberState.leadsReceived}
            responseRate={memberState.responseRate}
            appointmentsScheduled={memberState.appointmentsScheduled}
            conversions={memberState.conversions}
          />
          <MemberActivityTimeline
            activities={mockTeamActivity}
            memberId={memberState.id}
            onViewAll={() => navigate('/agents/team-v2')}
          />
        </div>
      </div>

      {/* Dialogs */}
      <PauseMemberDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        member={memberState}
        activeLeadsCount={activeLeadsCount}
        otherActiveAgents={otherActiveAgents}
        onConfirm={handlePause}
      />

      <ActivateMemberDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        member={memberState}
        onConfirm={handleActivate}
      />

      <RemoveMemberDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        member={memberState}
        activeLeadsCount={activeLeadsCount}
        otherActiveAgents={otherActiveAgents}
        onConfirm={handleRemove}
      />

      <ReassignLeadsDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        sourceAgent={memberState}
        targetAgents={otherActiveAgents}
        activeLeadsCount={activeLeadsCount}
        uncontactedLeadsCount={uncontactedLeadsCount}
        onConfirm={handleReassignLeads}
      />

      <ChangeRoleDialog
        open={changeRoleDialogOpen}
        onOpenChange={setChangeRoleDialogOpen}
        member={memberState}
        onConfirm={handleChangeRole}
      />

      {currentLeader && memberState.role === 'lider' && (
        <TransferLeadershipDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          currentLeader={memberState}
          eligibleMembers={teamAgentsData.filter(
            (a) => a.id !== memberState.id && a.status === 'activo'
          )}
          onConfirm={handleTransferLeadership}
        />
      )}
    </div>
  );
}
