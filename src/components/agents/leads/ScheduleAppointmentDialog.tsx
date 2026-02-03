import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { addAppointment } from '@/lib/agents/appointments/store';
import { addLeadActivity } from '@/lib/agents/leads/activity/store';
import { updateLeadStage } from '@/lib/agents/leads/store';
import type { Appointment, Lead, LeadStage } from '@/types/agents';

type AppointmentMode = 'in_person' | 'virtual';

const stageOrder: Record<LeadStage, number> = {
  new: 0,
  contacted: 1,
  appointment_set: 2,
  toured: 3,
  closed: 4,
  closed_lost: 4,
};

const track = (event: string, properties?: Record<string, unknown>) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
};

export type ScheduleAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  agentId: string;
};

export function ScheduleAppointmentDialog({ open, onOpenChange, lead, agentId }: ScheduleAppointmentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('11:00');
  const [mode, setMode] = useState<AppointmentMode>('in_person');
  const [location, setLocation] = useState('');
  const [virtualLink, setVirtualLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Reset to sensible defaults when opening
    setDate(undefined);
    setTime('11:00');
    setMode('in_person');
    setLocation('');
    setVirtualLink('');
    setNotes('');
  }, [open]);

  const validationError = useMemo(() => {
    if (!date) return 'Selecciona fecha';
    if (!time) return 'Ingresa hora';
    if (mode === 'in_person' && !location.trim()) return 'Ubicación requerida si presencial';
    if (mode === 'virtual' && !virtualLink.trim()) return 'Link requerido si virtual';
    return null;
  }, [date, time, mode, location, virtualLink]);

  const buildScheduledAt = () => {
    if (!date) return null;
    const [hh, mm] = time.split(':').map((v) => Number(v));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hh, mm, 0, 0);
    return scheduledAt;
  };

  const handleSubmit = async () => {
    const scheduledAt = buildScheduledAt();
    if (!scheduledAt || validationError) return;
    setSubmitting(true);
    track('lead.appointment_create_started', { leadId: lead.id });
    try {
      const appointment: Appointment = addAppointment({
        scheduledAt,
        leadId: lead.id,
        agentId,
        listingId: lead.listingId,
        type: 'showing',
        status: 'confirmed',
        duration: 60,
        location: mode === 'in_person' ? location.trim() : undefined,
        virtualLink: mode === 'virtual' ? virtualLink.trim() : undefined,
        notes: notes.trim() || undefined,
      } as any);

      addLeadActivity({
        leadId: lead.id,
        type: 'appointment_scheduled',
        description: `Cita programada para ${format(scheduledAt, "d MMM, HH:mm", { locale: es })}`,
        metadata: { appointmentId: appointment.id, listingId: lead.listingId, mode },
        createdBy: agentId,
      });

      // Auto-advance stage if it is behind "Appointment Set"
      if (stageOrder[lead.stage] < stageOrder.appointment_set) {
        const prev = updateLeadStage(lead.id, 'appointment_set');
        track('lead.stage_auto_updated', { leadId: lead.id, from: prev?.stage, to: 'appointment_set', reason: 'appointment_created' });
      }

      track('lead.appointment_created', {
        leadId: lead.id,
        appointmentId: appointment.id,
        mode,
        scheduledAt: scheduledAt.toISOString(),
      });
      toast({ title: 'Cita programada', description: format(scheduledAt, "EEEE d MMM, HH:mm", { locale: es }) });
      onOpenChange(false);
    } catch (e) {
      track('lead.appointment_create_failed', { leadId: lead.id, error: (e as Error).message || String(e) });
      toast({ title: 'No se pudo programar', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar visita</DialogTitle>
          <DialogDescription>Agenda una cita sin salir del lead.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Fecha</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: es }) : 'Selecciona fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => setDate(d ?? undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Hora</p>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Método</p>
            <Select value={mode} onValueChange={(v) => setMode(v as AppointmentMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'in_person' ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Ubicación</p>
              <Input
                placeholder="Ej. Calle Tamaulipas 87, Condesa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Link virtual</p>
              <Input
                placeholder="Ej. https://meet.google.com/..."
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Notas (opcional)</p>
            <Textarea
              placeholder="Añade un contexto para la visita..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[90px]"
            />
          </div>

          {validationError && (
            <div className="rounded-md border bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {validationError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!!validationError || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

