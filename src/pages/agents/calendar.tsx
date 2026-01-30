import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Video,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockAppointments, mockLeads } from '@/lib/agents/fixtures';
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
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '@/types/agents';
import { add as addNotification } from '@/lib/agents/notifications/store';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning border-warning/20' },
  confirmed: { label: 'Confirmada', color: 'bg-success/10 text-success border-success/20' },
  completed: { label: 'Completada', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  no_show: { label: 'No asistió', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const status = statusConfig[appointment.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-shadow hover:shadow-md',
        appointment.status === 'confirmed' && 'border-l-4 border-l-success',
        appointment.status === 'pending' && 'border-l-4 border-l-warning'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="text-primary font-semibold text-sm">
            {format(appointment.scheduledAt, 'HH:mm')}
          </div>
          <span className="text-xs text-muted-foreground">
            {appointment.duration} min
          </span>
        </div>
        <Badge variant="outline" className={cn('text-[10px]', status.color)}>
          {status.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
            {appointment.lead?.firstName[0]}{appointment.lead?.lastName?.[0] || ''}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium truncate">
          {appointment.lead?.firstName} {appointment.lead?.lastName}
        </span>
      </div>
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {appointment.virtualLink ? (
          <Video className="h-3 w-3" />
        ) : (
          <MapPin className="h-3 w-3" />
        )}
        <span className="truncate">
          {appointment.virtualLink ? 'Videollamada' : appointment.location}
        </span>
      </div>
    </motion.div>
  );
}

export default function AgentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-01-29'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date('2026-01-29'));
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  
  const handleNewAppointment = () => {
    const base = selectedDate || currentDate;
    const scheduledAt = new Date(base);
    scheduledAt.setHours(12, 0, 0, 0);
    const lead = mockLeads.find((l) => l.stage !== 'closed') ?? mockLeads[0];
    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      leadId: lead.id,
      lead,
      agentId: 'agent-1',
      type: 'showing',
      status: 'confirmed',
      scheduledAt,
      duration: 60,
      location: 'Por definir',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAppointments((prev) => [apt, ...prev]);
    addNotification({
      type: 'appointment',
      title: 'Nueva cita creada',
      body: `${lead.firstName} · ${format(scheduledAt, 'd MMM, HH:mm', { locale: es })}`,
      actionUrl: '/agents/calendar',
    });
  };
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(apt.scheduledAt, date)
    );
  };

  const selectedDateAppointments = selectedDate 
    ? getAppointmentsForDate(selectedDate)
    : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y visitas
          </p>
        </div>
        <Button onClick={handleNewAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date('2026-01-29'))}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {format(day, 'EEE', { locale: es })}
                  </div>
                ))}
              </div>

              {/* Week Days */}
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
                        'relative aspect-square rounded-lg p-2 transition-colors',
                        'hover:bg-muted/50',
                        isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                        isCurrentDay && !isSelected && 'ring-2 ring-primary'
                      )}
                    >
                      <span className={cn(
                        'text-sm font-medium',
                        isCurrentDay && !isSelected && 'text-primary'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayAppointments.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayAppointments.slice(0, 3).map((apt, i) => (
                            <div
                              key={apt.id}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isSelected ? 'bg-primary-foreground' : 'bg-primary'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Day View - Time slots */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-4">
                  {selectedDate 
                    ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                    : 'Selecciona un día'
                  }
                </h4>
                
                {selectedDate && (
                  <div className="space-y-2">
                    {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => {
                      const hourAppointments = selectedDateAppointments.filter(
                        apt => apt.scheduledAt.getHours() === hour
                      );
                      
                      return (
                        <div key={hour} className="flex gap-3">
                          <span className="text-xs text-muted-foreground w-12 shrink-0 pt-2">
                            {hour}:00
                          </span>
                          <div className="flex-1 min-h-[3rem] border-l pl-3">
                            {hourAppointments.map((apt) => (
                              <AppointmentCard key={apt.id} appointment={apt} />
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

        {/* Upcoming Appointments */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximas Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments
                  .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
                  .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="text-center shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {format(appointment.scheduledAt, 'MMM', { locale: es })}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {format(appointment.scheduledAt, 'd')}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {appointment.lead?.firstName} {appointment.lead?.lastName}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn('text-[10px] shrink-0', statusConfig[appointment.status].color)}
                          >
                            {statusConfig[appointment.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(appointment.scheduledAt, 'HH:mm')}</span>
                          <span>•</span>
                          <span>{appointment.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          {appointment.virtualLink ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                          <span className="truncate">
                            {appointment.virtualLink ? 'Videollamada' : appointment.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
