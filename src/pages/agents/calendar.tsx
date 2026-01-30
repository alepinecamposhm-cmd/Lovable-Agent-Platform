import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  Check,
  X,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { addAppointment, setAppointmentStatus, updateAppointment, useAppointmentStore } from '@/lib/agents/appointments/store';
import { mockLeads } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '@/types/agents';
import { add as addNotification } from '@/lib/agents/notifications/store';
import { toast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning border-warning/20' },
  confirmed: { label: 'Confirmada', color: 'bg-success/10 text-success border-success/20' },
  completed: { label: 'Completada', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  no_show: { label: 'No asistió', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

interface RescheduleState {
  open: boolean;
  appointment?: Appointment;
  date: string;
  time: string;
}

function formatDateInput(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function formatTimeInput(date: Date) {
  return format(date, 'HH:mm');
}

function AppointmentCard({
  appointment,
  onConfirm,
  onReschedule,
  onCancel,
}: {
  appointment: Appointment;
  onConfirm: (id: string) => void;
  onReschedule: (apt: Appointment) => void;
  onCancel: (apt: Appointment) => void;
}) {
  const status = statusConfig[appointment.status];
  const actionsVisible = appointment.status !== 'cancelled' && appointment.status !== 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'group p-3 rounded-lg border transition-shadow focus-within:ring-2 focus-within:ring-primary/40',
        'hover:shadow-md bg-card',
        appointment.status === 'confirmed' && 'border-l-4 border-l-success',
        appointment.status === 'pending' && 'border-l-4 border-l-warning',
        appointment.status === 'cancelled' && 'opacity-70 line-through'
      )}
      role="article"
      aria-label={`Cita con ${appointment.lead?.firstName || 'Lead'} el ${format(appointment.scheduledAt, 'd MMM, HH:mm', { locale: es })}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="text-primary font-semibold text-sm">
            {format(appointment.scheduledAt, 'HH:mm')}
          </div>
          <span className="text-xs text-muted-foreground">{appointment.duration} min</span>
        </div>
        <Badge variant="outline" className={cn('text-[10px]', status.color)}>
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
            {appointment.lead?.firstName?.[0]}
            {appointment.lead?.lastName?.[0] || ''}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {appointment.lead?.firstName} {appointment.lead?.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {format(appointment.scheduledAt, "d MMM, HH:mm", { locale: es })}
          </p>
        </div>
        {actionsVisible && (
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Confirmar cita" onClick={() => onConfirm(appointment.id)}>
                  <Check className="h-4 w-4 text-success" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Confirmar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Reprogramar cita" onClick={() => onReschedule(appointment)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reprogramar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Cancelar cita" onClick={() => onCancel(appointment)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Cancelar</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {appointment.virtualLink ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
        <span className="truncate">
          {appointment.virtualLink ? 'Videollamada' : appointment.location || 'Ubicación por definir'}
        </span>
      </div>

      {actionsVisible && (
        <div className="sm:hidden flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onConfirm(appointment.id)} aria-label="Confirmar cita mobile">Confirmar</Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onReschedule(appointment)} aria-label="Reprogramar cita mobile">Reprogramar</Button>
          <Button size="sm" variant="ghost" className="flex-1 text-destructive" onClick={() => onCancel(appointment)} aria-label="Cancelar cita mobile">Cancelar</Button>
        </div>
      )}
    </motion.div>
  );
}

export default function AgentCalendar() {
  const { appointments } = useAppointmentStore();
  const [currentDate, setCurrentDate] = useState(new Date('2026-01-29'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date('2026-01-29'));
  const [reschedule, setReschedule] = useState<RescheduleState>({ open: false, date: '', time: '' });
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDate = (date: Date) =>
    appointments.filter((apt) => isSameDay(apt.scheduledAt, date));

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const upcoming = useMemo(
    () => appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed'),
    [appointments]
  );

  const handleConfirm = (id: string) => {
    const prev = setAppointmentStatus(id, 'confirmed');
    if (!prev) return;
    toast({ title: 'Cita confirmada', description: `${prev.lead?.firstName || 'Lead'} confirmó la visita.` });
    addNotification({
      type: 'appointment',
      title: 'Cita confirmada',
      body: `${prev.lead?.firstName || 'Lead'} · ${format(prev.scheduledAt, 'd MMM, HH:mm', { locale: es })}`,
      actionUrl: '/agents/calendar',
    });
  };

  const openReschedule = (apt: Appointment) => {
    setReschedule({
      open: true,
      appointment: apt,
      date: formatDateInput(apt.scheduledAt),
      time: formatTimeInput(apt.scheduledAt),
    });
  };

  const handleRescheduleSubmit = () => {
    if (!reschedule.appointment) return;
    const { appointment, date, time } = reschedule;
    if (!date || !time) return;
    const [hour, minute] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hour || 0, minute || 0, 0, 0);

    updateAppointment(appointment.id, { scheduledAt: newDate, status: 'confirmed' });
    toast({ title: 'Cita reprogramada', description: `${appointment.lead?.firstName} · ${format(newDate, 'd MMM, HH:mm', { locale: es })}` });
    addNotification({
      type: 'appointment',
      title: 'Cita reprogramada',
      body: `${appointment.lead?.firstName || 'Lead'} · ${format(newDate, 'd MMM, HH:mm', { locale: es })}`,
      actionUrl: '/agents/calendar',
    });
    setReschedule({ open: false, date: '', time: '' });
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    setAppointmentStatus(cancelTarget.id, 'cancelled');
    toast({ title: 'Cita cancelada', description: `${cancelTarget.lead?.firstName || 'Lead'} fue notificado.` });
    addNotification({
      type: 'appointment',
      title: 'Cita cancelada',
      body: `${cancelTarget.lead?.firstName || 'Lead'} · ${format(cancelTarget.scheduledAt, 'd MMM, HH:mm', { locale: es })}`,
      actionUrl: '/agents/calendar',
    });
    setCancelTarget(null);
  };

  const handleNewAppointment = () => {
    const base = selectedDate || currentDate;
    const scheduledAt = new Date(base);
    scheduledAt.setHours(12, 0, 0, 0);
    const lead = mockLeads.find((l) => l.stage !== 'closed') ?? mockLeads[0];
    const apt = addAppointment({
      scheduledAt,
      leadId: lead.id,
      lead,
      agentId: 'agent-1',
      type: 'showing',
      status: 'pending',
      duration: 60,
      location: 'Por definir',
    });
    toast({ title: 'Nueva cita creada', description: `${lead.firstName} · ${format(scheduledAt, 'd MMM, HH:mm', { locale: es })}` });
    addNotification({
      type: 'appointment',
      title: 'Nueva cita creada',
      body: `${lead.firstName} · ${format(scheduledAt, 'd MMM, HH:mm', { locale: es })}`,
      actionUrl: '/agents/calendar',
    });
    setSelectedDate(scheduledAt);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">Gestiona tus citas y visitas</p>
        </div>
        <Button onClick={handleNewAppointment} aria-label="Crear nueva cita">
          <Plus className="h-4 w-4 mr-2" /> Nueva Cita
        </Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, 'MMMM yyyy', { locale: es })}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="Semana anterior" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Ir a hoy" onClick={() => setCurrentDate(new Date('2026-01-29'))}>
                    Hoy
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Semana siguiente" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {format(day, 'EEE', { locale: es })}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isSameDay(day, new Date('2026-01-29'));

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'relative aspect-square rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                        'hover:bg-muted/50',
                        isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                        isCurrentDay && !isSelected && 'ring-2 ring-primary'
                      )}
                      aria-label={`Ver día ${format(day, 'd MMM', { locale: es })}`}
                    >
                      <span className={cn('text-sm font-medium', isCurrentDay && !isSelected && 'text-primary')}>
                        {format(day, 'd')}
                      </span>
                      {dayAppointments.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayAppointments.slice(0, 3).map((apt) => (
                            <div key={apt.id} className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-primary-foreground' : 'bg-primary')} />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-4">
                  {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
                </h4>

                {selectedDate && (
                  <div className="space-y-2">
                    {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => {
                      const hourAppointments = selectedDateAppointments.filter((apt) => apt.scheduledAt.getHours() === hour);
                      return (
                        <div key={hour} className="flex gap-3">
                          <span className="text-xs text-muted-foreground w-12 shrink-0 pt-2">{hour}:00</span>
                          <div className="flex-1 min-h-[3rem] border-l pl-3 space-y-2">
                            {hourAppointments.map((apt) => (
                              <AppointmentCard
                                key={apt.id}
                                appointment={apt}
                                onConfirm={handleConfirm}
                                onReschedule={openReschedule}
                                onCancel={setCancelTarget}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Próximas Citas</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Crear cita rápida" onClick={handleNewAppointment}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Crear cita rápida</TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  className="p-3 rounded-lg border bg-muted/30 group"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.lead?.firstName} {appointment.lead?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(appointment.scheduledAt, 'd MMM, HH:mm', { locale: es })}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px]', statusConfig[appointment.status].color)}>
                      {statusConfig[appointment.status].label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleConfirm(appointment.id)}
                      aria-label="Confirmar cita lista"
                    >
                      <Check className="h-4 w-4 mr-1" /> Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => openReschedule(appointment)}
                      aria-label="Reprogramar cita lista"
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Reprogramar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-destructive"
                      onClick={() => setCancelTarget(appointment)}
                      aria-label="Cancelar cita lista"
                    >
                      <X className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </motion.div>
              ))}
              {upcoming.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Sin citas próximas</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={reschedule.open} onOpenChange={(open) => setReschedule((prev) => ({ ...prev, open }))}>
        <DialogContent aria-label="Reprogramar cita">
          <DialogHeader>
            <DialogTitle>Reprogramar cita</DialogTitle>
            <DialogDescription>Actualiza fecha y hora de la visita.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={reschedule.date}
                onChange={(e) => setReschedule((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={reschedule.time}
                onChange={(e) => setReschedule((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReschedule({ open: false, date: '', time: '' })}>Cancelar</Button>
            <Button onClick={handleRescheduleSubmit} aria-label="Guardar reprogramación">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar cita</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmas cancelar la visita? Se notificará al lead y podrás reprogramar luego.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
