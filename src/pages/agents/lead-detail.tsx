import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Tags,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  mockAppointments,
  mockLeadActivities,
} from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import type { Lead, LeadActivity, LeadStage } from '@/types/agents';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLeadStore, updateLeadNotes, updateLeadStage, updateLeadTags } from '@/lib/agents/leads/store';
import { add as addNotification } from '@/lib/agents/notifications/store';
import { addTask, completeTask, undoCompleteTask, useTaskStore } from '@/lib/agents/tasks/store';

const stageConfig: Record<LeadStage, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contactado', color: 'bg-purple-500' },
  appointment_set: { label: 'Appointment Set', color: 'bg-teal-500' },
  toured: { label: 'Toured', color: 'bg-indigo-500' },
  closed: { label: 'Closed', color: 'bg-green-500' },
  closed_lost: { label: 'Closed Lost', color: 'bg-gray-500' },
};

const activityIcon: Record<
  LeadActivity['type'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  message_received: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  message_sent: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  note_added: { icon: Tags, color: 'text-muted-foreground', bg: 'bg-muted/40' },
  call_made: { icon: Phone, color: 'text-warning', bg: 'bg-warning/10' },
  appointment_scheduled: { icon: CalendarIcon, color: 'text-success', bg: 'bg-success/10' },
  appointment_completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  assignment_changed: { icon: UserRound, color: 'text-info', bg: 'bg-info/10' },
  stage_change: { icon: CircleDot, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
  property_viewed: { icon: Eye, color: 'text-muted-foreground', bg: 'bg-muted/40' },
};

const temperatureLabel = {
  hot: { label: '🔥 Caliente', badge: 'badge-hot' },
  warm: { label: '☀️ Tibio', badge: 'badge-warm' },
  cold: { label: '❄️ Frío', badge: 'badge-cold' },
};

export default function AgentLeadDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const { leads } = useLeadStore();
  const { tasks } = useTaskStore();
  const lead = leads.find((l) => l.id === params.leadId);
  const [stage, setStage] = useState<LeadStage>(lead?.stage ?? 'new');
  const [noteDraft, setNoteDraft] = useState(lead?.notes || '');
  const [taskDraft, setTaskDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');

  useEffect(() => {
    if (lead) setStage(lead.stage);
  }, [lead?.stage]);

  useEffect(() => {
    if (lead) {
      setNoteDraft(lead.notes || '');
    }
  }, [lead?.id]);

  if (!lead) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Lead no encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const activities = useMemo(
    () =>
      mockLeadActivities
        .filter((a) => a.leadId === lead.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [lead.id]
  );

  const leadTasks = useMemo(
    () => tasks.filter((t) => t.leadId === lead.id),
    [tasks, lead.id]
  );

  const leadAppointments = useMemo(
    () => mockAppointments.filter((apt) => apt.leadId === lead.id),
    [lead.id]
  );

  const currentStageConfig = stageConfig[stage];

  const handleStageChange = (value: LeadStage) => {
    setStage(value);
    if (lead) {
      updateLeadStage(lead.id, value);
      addNotification({
        type: value === 'appointment_set' ? 'appointment' : 'lead',
        title: value === 'appointment_set' ? 'Cita programada' : 'Etapa de lead actualizada',
        body: `${lead.firstName} ahora está en ${stageConfig[value].label}`,
        actionUrl: `/agents/leads/${lead.id}`,
      });
    }
    toast({
      title: 'Etapa actualizada',
      description: `Moviste el lead a ${stageConfig[value].label}`,
    });
  };

  const handleAddNote = () => {
    if (!noteDraft.trim()) return;
    updateLeadNotes(lead.id, noteDraft.trim());
    toast({
      title: 'Nota agregada',
      description: 'Guardamos la nota en el lead.',
    });
  };

  const handleAddTask = () => {
    if (!taskDraft.trim()) return;
    addTask({
      title: taskDraft.trim(),
      leadId: lead.id,
      dueAt: new Date(),
      priority: 'medium',
      tags: ['Lead'],
    });
    toast({
      title: 'Tarea creada',
      description: 'Se agregó al backlog y verás el badge en Tareas.',
    });
    setTaskDraft('');
  };

  const handleAddTag = () => {
    if (!tagDraft.trim()) return;
    const nextTags = Array.from(new Set([...(lead.tags || []), tagDraft.trim()]));
    updateLeadTags(lead.id, nextTags);
    setTagDraft('');
    toast({ title: 'Etiqueta agregada', description: nextTags.join(', ') });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <motion.div variants={staggerItem} className="space-y-2">
          <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Volver a Leads
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {lead.firstName[0]}
                {lead.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {lead.firstName} {lead.lastName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="secondary"
                  className={cn('px-2 py-0.5 text-xs', temperatureLabel[lead.temperature].badge)}
                >
                  {temperatureLabel[lead.temperature].label}
                </Badge>
                <Separator orientation="vertical" className="h-4" />
                <span>{lead.interestedIn === 'buy' ? 'Comprar' : lead.interestedIn === 'sell' ? 'Vender' : 'Rentar'}</span>
                {lead.budgetMax && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span>
                      ${lead.budgetMin?.toLocaleString() || '—'} - ${lead.budgetMax.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/agents/inbox">
              <MessageSquare className="h-4 w-4" />
              Abrir chat
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/agents/calendar">
              <CalendarIcon className="h-4 w-4" />
              Agendar visita
            </Link>
          </Button>
          <Select value={stage} onValueChange={(v) => handleStageChange(v as LeadStage)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Mover etapa" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(stageConfig) as LeadStage[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {stageConfig[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Top summary */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Etapa</p>
                <p className="text-xl font-semibold">{currentStageConfig.label}</p>
              </div>
              <Badge className={currentStageConfig.color}></Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pipeline Kanban con drag & drop</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-xl font-semibold">{lead.score || 70}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <Progress value={Math.min(lead.score || 70, 100)} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último contacto</p>
                <p className="text-xl font-semibold">
                  {lead.lastContactedAt
                    ? formatDistanceToNow(lead.lastContactedAt, { addSuffix: true, locale: es })
                    : '—'}
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">SLA: responder &lt; 5 min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fuente</p>
                <p className="text-xl font-semibold capitalize">{lead.source}</p>
              </div>
              <BadgeCheck className="h-5 w-5 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Origen y permisos verificados</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="timeline">
            <TabsList className="mb-3">
              <TabsTrigger value="timeline">Actividad</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = activityIcon[activity.type]?.icon || CircleDot;
                      const iconStyles = activityIcon[activity.type] || {
                        color: 'text-muted-foreground',
                        bg: 'bg-muted/50',
                      };
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', iconStyles.bg)}>
                            <Icon className={cn('h-4 w-4', iconStyles.color)} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: es })}
                              </span>
                            </div>
                            {activity.type === 'stage_change' && activity.metadata && (
                              <p className="text-xs text-muted-foreground">
                                {activity.metadata.from} → {activity.metadata.to}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    {activities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Sin actividad reciente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Tareas</CardTitle>
                    <p className="text-sm text-muted-foreground">Seguimientos y recordatorios</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{leadTasks.length}</Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/agents/tasks" className="text-xs">Ir a Tareas</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leadTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border bg-card shadow-sm transition-all',
                        task.status === 'completed' && 'opacity-60 line-through'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={task.status === 'completed'}
                        onChange={() => {
                          if (task.status === 'completed') {
                            undoCompleteTask(task.id);
                          } else {
                            completeTask(task.id);
                          }
                        }}
                        aria-label="Completar tarea"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.dueAt
                            ? `Vence ${format(task.dueAt, "d MMM, HH:mm", { locale: es })}`
                            : 'Sin fecha'}
                        </p>
                        {task.tags?.length ? (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {task.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                  ))}
                  {leadTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No hay tareas asignadas
                    </p>
                  )}

                  <div className="rounded-lg border p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Nueva tarea rápida</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej. Llamar mañana 9am"
                        value={taskDraft}
                        onChange={(e) => setTaskDraft(e.target.value)}
                      />
                      <Button onClick={handleAddTask}>Agregar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notas internas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Añade un apunte breve. Solo visible para el equipo."
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      Autosave mock: guarda localmente y mantiene consistencia visual.
                    </div>
                    <Button onClick={handleAddNote}>Guardar nota</Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Etiquetas</p>
                    <div className="flex flex-wrap gap-2">
                      {(lead.tags || []).length > 0 ? (
                        lead.tags!.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[11px]">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin etiquetas</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Agregar etiqueta (ej. VIP)"
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        aria-label="Nueva etiqueta"
                      />
                      <Button variant="outline" onClick={handleAddTag}>Añadir</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Citas y visitas</CardTitle>
                <p className="text-sm text-muted-foreground">Próximos toques con el lead</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/agents/calendar" className="gap-1">
                  Ver calendario <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {leadAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-lg border flex items-center gap-3 hover:shadow-sm transition-shadow"
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      {format(apt.scheduledAt, 'd MMM', { locale: es })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(apt.scheduledAt, 'HH:mm')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {apt.type === 'showing' ? 'Visita' : 'Reunión'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {apt.location || 'Virtual'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {apt.status === 'confirmed'
                      ? 'Confirmada'
                      : apt.status === 'pending'
                        ? 'Pendiente'
                        : apt.status === 'completed'
                          ? 'Completada'
                          : 'Cancelada'}
                  </Badge>
                </div>
              ))}
              {leadAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin citas. Agenda una visita para generar retorno.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ficha del lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {lead.firstName[0]}
                  {lead.lastName?.[0] || ''}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email || 'Sin correo'}</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {lead.preferredZones?.join(', ') || 'Zona abierta'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">Interés: {lead.propertyType || 'N/D'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trigger de retorno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                Este lead vuelve por <span className="font-semibold">nuevo mensaje pendiente</span> y
                <span className="font-semibold"> cita próxima</span>. Notifica con push/SMS y badge en Inbox.
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">1 mensaje sin leer</span>
                </div>
                <Badge variant="outline" className="text-[10px]">SLA &lt; 5 min</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Cita en 24h</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">Recordatorio ON</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Siguiente acción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Envía propuesta y confirma hora de visita. Usa plantillas en Inbox para rapidez.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" asChild>
                  <Link to="/agents/inbox">Responder ahora</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/agents/calendar">Programar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
