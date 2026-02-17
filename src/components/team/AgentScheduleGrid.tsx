import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WeeklySchedule, TimeSlot } from '@/types';

interface AgentScheduleGridProps {
  schedule: WeeklySchedule;
  onScheduleChange?: (schedule: WeeklySchedule) => void;
  editable?: boolean;
}

const DAYS: { key: keyof WeeklySchedule; label: string; short: string }[] = [
  { key: 'monday', label: 'Lunes', short: 'L' },
  { key: 'tuesday', label: 'Martes', short: 'M' },
  { key: 'wednesday', label: 'Miércoles', short: 'Mi' },
  { key: 'thursday', label: 'Jueves', short: 'J' },
  { key: 'friday', label: 'Viernes', short: 'V' },
  { key: 'saturday', label: 'Sábado', short: 'S' },
  { key: 'sunday', label: 'Domingo', short: 'D' },
];

function ScheduleDayPopover({
  dayLabel,
  slots,
  onSave,
}: {
  dayLabel: string;
  slots: TimeSlot[];
  onSave: (slots: TimeSlot[]) => void;
}) {
  const hasSlots = slots.length > 0;
  const [start, setStart] = useState(hasSlots ? slots[0].start : '09:00');
  const [end, setEnd] = useState(hasSlots ? slots[0].end : '18:00');
  const [allDay, setAllDay] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (allDay) {
      onSave([{ start: '00:00', end: '23:59' }]);
    } else {
      onSave([{ start, end }]);
    }
    setOpen(false);
    toast.success(`Horario de ${dayLabel} actualizado`);
  };

  const handleClear = () => {
    onSave([]);
    setOpen(false);
    toast.success(`${dayLabel} marcado como no disponible`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex flex-col items-center justify-center rounded-md border p-2 h-[60px] w-full transition-colors cursor-pointer',
            hasSlots
              ? 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-800'
              : 'bg-muted border-dashed hover:bg-muted/80'
          )}
        >
          <span className="text-xs font-medium">{dayLabel}</span>
          {hasSlots ? (
            <span className="text-[10px] text-green-700 dark:text-green-400">
              {slots[0].start}-{slots[0].end}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] space-y-3" align="center">
        <p className="text-sm font-medium">{dayLabel}</p>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Todo el día</Label>
          <Switch checked={allDay} onCheckedChange={setAllDay} />
        </div>
        {!allDay && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Inicio</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fin</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleSave}>
            Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear}>
            Quitar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AgentScheduleGrid({ schedule, onScheduleChange, editable = true }: AgentScheduleGridProps) {
  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>(schedule);

  const handleDaySave = (dayKey: keyof WeeklySchedule, slots: TimeSlot[]) => {
    const updated = { ...localSchedule, [dayKey]: slots };
    setLocalSchedule(updated);
    onScheduleChange?.(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Disponibilidad Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) =>
            editable ? (
              <ScheduleDayPopover
                key={day.key}
                dayLabel={day.label}
                slots={localSchedule[day.key]}
                onSave={(slots) => handleDaySave(day.key, slots)}
              />
            ) : (
              <TooltipProvider key={day.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center rounded-md border p-2 h-[60px]',
                        localSchedule[day.key].length > 0
                          ? 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-800'
                          : 'bg-muted border-dashed'
                      )}
                    >
                      <span className="text-xs font-medium">{day.label}</span>
                      {localSchedule[day.key].length > 0 ? (
                        <span className="text-[10px] text-green-700 dark:text-green-400">
                          {localSchedule[day.key][0].start}-{localSchedule[day.key][0].end}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {localSchedule[day.key].length > 0
                      ? `${day.label}: ${localSchedule[day.key][0].start} - ${localSchedule[day.key][0].end}`
                      : `${day.label}: No disponible`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Compact dots for member cards */
export function ScheduleCompactDots({ schedule }: { schedule: WeeklySchedule }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {DAYS.map((day) => (
              <div
                key={day.key}
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  schedule[day.key].length > 0 ? 'bg-green-500' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-0.5">
            {DAYS.map((day) => (
              <div key={day.key} className="flex items-center gap-2">
                <span className="w-6">{day.short}</span>
                <span>
                  {schedule[day.key].length > 0
                    ? `${schedule[day.key][0].start}-${schedule[day.key][0].end}`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
