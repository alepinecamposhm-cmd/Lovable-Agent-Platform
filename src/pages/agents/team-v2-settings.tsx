import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, FlaskConical, Settings2, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PendingInvitations } from '@/components/team/PendingInvitations';
import { TeamPlanLimitBadge } from '@/components/team/TeamPlanLimitBadge';
import { RoutingSimulator } from '@/components/team/RoutingSimulator';
import { TeamSettingsForm } from '@/components/team/TeamSettingsForm';
import { useTeamV2Workspace } from '@/lib/team/teamV2Workspace';
import { ROLE_CAPS } from '@/lib/permissions/rbac';
import type { Capability } from '@/lib/permissions/capabilities';
import type { Role } from '@/lib/permissions/types';
import { useAccess } from '@/lib/permissions/useAccess';

const capabilityLabels: Partial<Record<Capability, string>> = {
  view_team: 'Vista de equipo',
  manage_team_settings: 'Ajustes de equipo',
  manage_team_invites: 'Invitar miembros',
  manage_team_roles: 'Cambiar roles',
  reassign_leads: 'Reasignar leads',
  reset_agent_password: 'Restablecer contraseñas',
  view_reports_team: 'Reportes de equipo',
  view_settings: 'Configuración',
};

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  leader: 'Líder',
  agent: 'Agente',
};

const capabilityReference: Capability[] = [
  'view_team',
  'manage_team_settings',
  'manage_team_invites',
  'manage_team_roles',
  'reassign_leads',
  'reset_agent_password',
  'view_reports_team',
  'view_settings',
];

export default function TeamV2SettingsPage() {
  const navigate = useNavigate();
  const access = useAccess();
  const {
    TEAM_PLAN_LIMIT,
    agents,
    activeAgents,
    routingRules,
    pendingInvitations,
    handleInvite,
    handleCancelInvitation,
    handleResendInvitation,
    teamSettings,
    handleSaveSettings,
  } = useTeamV2Workspace();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'agente' | 'admin'>('agente');
  const [defaultLeadLimit, setDefaultLeadLimit] = useState(String(teamSettings.defaultLeadLimit));
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const teamShareUrl = `${window.location.origin}/agents/team-v2`;

  useEffect(() => {
    setDefaultLeadLimit(String(teamSettings.defaultLeadLimit));
  }, [teamSettings.defaultLeadLimit]);

  useEffect(() => {
    if (window.location.hash !== '#invitations') return;

    requestAnimationFrame(() => {
      const invitationsSection = document.getElementById('invitations');
      invitationsSection?.scrollIntoView({ block: 'start' });
      invitationsSection?.focus({ preventScroll: true });
    });
  }, []);

  const roleReference = useMemo(
    () =>
      (['admin', 'leader', 'agent'] as Role[]).map((role) => ({
        role,
        labels: capabilityReference
          .filter((capability) => ROLE_CAPS[role].has(capability))
          .map((capability) => capabilityLabels[capability] ?? capability),
      })),
    []
  );

  const saveDefaultLeadLimit = () => {
    const nextLimit = Number(defaultLeadLimit);
    if (!Number.isFinite(nextLimit) || nextLimit < 1) {
      toast.error('El límite por defecto debe ser mayor a 0');
      return;
    }
    handleSaveSettings({ defaultLeadLimit: Math.round(nextLimit) });
    toast.success('Capacidad por defecto actualizada');
  };

  const sendInvite = () => {
    const success = handleInvite(inviteEmail, inviteRole);
    if (!success) {
      toast.error('Ingresa un email válido para enviar la invitación');
      return;
    }
    toast.success(`Invitación enviada a ${inviteEmail.trim()}`);
    setInviteEmail('');
    setInviteRole('agente');
  };

  const copyTeamLink = async () => {
    try {
      await navigator.clipboard.writeText(teamShareUrl);
      toast.success('Link del equipo copiado');
    } catch {
      toast.error('No se pudo copiar el link');
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="h-4 w-4" />
            Configuración administrativa de equipo
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Ajustes de Team V2</h1>
          <p className="text-sm text-muted-foreground">
            Configuración secundaria para cambios administrativos que no forman parte de la operación diaria.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/agents/team-v2')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a operaciones
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Ajustes generales</CardTitle>
            <CardDescription>
              Mantén aquí la configuración base del equipo; la operación diaria se queda en el dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamSettingsForm
              settings={teamSettings}
              onSave={(settings) => {
                handleSaveSettings(settings);
                toast.success('Configuración del equipo actualizada');
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacidad y plan</CardTitle>
            <CardDescription>
              Controles que afectan límites globales, no el monitoreo diario.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-medium">Miembros del equipo</p>
              <p className="text-sm text-muted-foreground">
                {agents.length} miembros registrados, {activeAgents.length} activos.
              </p>
              <TeamPlanLimitBadge currentCount={agents.length} maxCount={TEAM_PLAN_LIMIT} />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="default-lead-limit">Capacidad base por agente</Label>
              <Input
                id="default-lead-limit"
                type="number"
                min={1}
                step={1}
                value={defaultLeadLimit}
                onChange={(event) => setDefaultLeadLimit(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se usa cuando un agente no tiene un límite individual definido.
              </p>
              <Button
                variant="outline"
                onClick={saveDefaultLeadLimit}
                disabled={defaultLeadLimit === String(teamSettings.defaultLeadLimit)}
              >
                Guardar capacidad base
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {access.can('manage_team_invites') && (
        <Card id="invitations" tabIndex={-1} className="scroll-mt-20 focus:outline-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Invitaciones
            </CardTitle>
            <CardDescription>
              Alta puntual de miembros. La gestión operativa permanece en el tablero principal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_auto] md:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="agente@email.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Rol</Label>
                <select
                  id="invite-role"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as 'agente' | 'admin')}
                >
                  <option value="agente">Agente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button onClick={sendInvite}>Enviar</Button>
            </div>

            {pendingInvitations.length > 0 ? (
              <PendingInvitations
                variant="compact"
                invitations={pendingInvitations}
                onCancel={handleCancelInvitation}
                onResend={handleResendInvitation}
              />
            ) : (
              <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                No hay invitaciones pendientes.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Probar ruteo</CardTitle>
            <CardDescription>
              Simula un lead para confirmar qué agente lo recibiría según tus reglas actuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setSimulatorOpen(true)}>
              <FlaskConical className="mr-2 h-4 w-4" />
              Probar ruteo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Roles y permisos
            </CardTitle>
            <CardDescription>
              Referencia compacta basada en las capacidades ya definidas en el repo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {roleReference.map((entry) => (
              <div key={entry.role} className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-semibold">{roleLabels[entry.role]}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.labels.length > 0 ? (
                    entry.labels.map((label) => (
                      <Badge key={label} variant="secondary" className="font-normal">
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin privilegios administrativos de equipo.</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Utilidades administrativas</CardTitle>
          <CardDescription>
            Acciones puntuales sin métricas ni monitoreo operativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium">Link del espacio de equipo</p>
            <p className="truncate text-xs text-muted-foreground">{teamShareUrl}</p>
          </div>
          <Button variant="outline" onClick={copyTeamLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar link
          </Button>
        </CardContent>
      </Card>

      <RoutingSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        rules={routingRules}
        agents={agents}
      />
    </div>
  );
}
