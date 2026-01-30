import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  ShieldHalf,
  PauseCircle,
  MapPin,
  UserPlus,
  Users2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockAgent } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useRoutingStore, addRule, deleteRule, togglePauseAgent, getPausedAgents, RoutingRule } from '@/lib/agents/routing/store';

const teamMembers = [
  { name: `${mockAgent.firstName} ${mockAgent.lastName}`, role: 'Propietario', email: mockAgent.email, id: mockAgent.id },
  { name: 'Lucía Torres', role: 'Admin', email: 'lucia@realty.com', id: 'agent-2' },
  { name: 'Javier Soto', role: 'Agente', email: 'javier@realty.com', id: 'agent-3' },
];

const invites = [
  { email: 'ana@realty.com', role: 'Agente', status: 'Pendiente' },
];

export default function AgentTeam() {
  const [inviteEmail, setInviteEmail] = useState('');
  const routingRules = useRoutingStore();
  const pausedAgents = useMemo(() => getPausedAgents(), []);
  const [newZone, setNewZone] = useState('');
  const [newAssignee, setNewAssignee] = useState(teamMembers[0].id);

  const teamMembersList = teamMembers.map(m => ({ email: m.email, name: m.name }));

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipo</h1>
          <p className="text-muted-foreground">
            Gestiona miembros, roles y accesos al portal de agentes.
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invitar
        </Button>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Miembros</CardTitle>
              <p className="text-sm text-muted-foreground">Roles y permisos</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users2 className="h-4 w-4" /> {teamMembers.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <Badge variant={member.role === 'Propietario' ? 'default' : 'outline'}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invitar miembro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="email@equipo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button className="w-full" disabled={!inviteEmail}>
              Enviar invitación
            </Button>
            <p className="text-xs text-muted-foreground">
              Se enviará un email con rol “Agente” y acceso limitado a leads asignados.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Invitaciones pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.email}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
              >
                <div>
                  <p className="font-medium text-sm">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">{invite.role}</p>
                </div>
                <Badge variant="secondary">{invite.status}</Badge>
              </div>
            ))}
            {invites.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay invitaciones abiertas.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permisos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><ShieldCheck className="h-4 w-4 inline mr-2 text-success" /> Propietario: todo acceso.</p>
              <p><ShieldHalf className="h-4 w-4 inline mr-2 text-warning" /> Admin: equipos, leads, listings.</p>
              <p><Mail className="h-4 w-4 inline mr-2 text-primary" /> Agente: leads asignados, inbox, calendario.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PauseCircle className="h-4 w-4 text-warning" />
                Pausar agente (vacaciones)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Evita asignaciones nuevas mientras el agente está ausente.</p>
              <div className="space-y-2">
                {teamMembers.map((member) => {
                  const isPaused = pausedAgents.has(member.id);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/40">
                      <span>{member.name.split(' ')[0]}</span>
                      <Button
                        variant={isPaused ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePauseAgent(member.id, !isPaused)}
                      >
                        {isPaused ? 'Reanudar' : 'Pausar'}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Trigger: evita nuevos leads; histórico intacto.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Ruteo por zona/precio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2 text-xs">
                {routingRules.map(rule => (
                  <Badge key={rule.id} variant="secondary">
                    Zona: {rule.zone} → {teamMembers.find(m => m.id === rule.assignToAgentId)?.name.split(' ')[0] || 'Agente'}
                  </Badge>
                ))}
                {routingRules.length === 0 && <span className="text-muted-foreground italic">Sin reglas activas</span>}
              </div>
              <p className="text-muted-foreground">
                Motor de reglas para asignar leads automáticamente según área o rango de precio.
              </p>
              <div className="grid sm:grid-cols-3 gap-2">
                <Input placeholder="Zona (ej. Polanco)" value={newZone} onChange={(e) => setNewZone(e.target.value)} />
                <select className="rounded-md border px-3 py-2 text-sm" value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <Button onClick={() => { if (!newZone) return; addRule({ zone: newZone, assignToAgentId: newAssignee }); setNewZone(''); }}>
                  Agregar
                </Button>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {routingRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-2 rounded border">
                    <span>{rule.zone} → {teamMembers.find(m => m.id === rule.assignToAgentId)?.name || 'Agente'}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>Eliminar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
