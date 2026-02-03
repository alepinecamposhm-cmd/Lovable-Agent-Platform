import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Agent, LeadStage, LeadTimeframe } from '@/types/agents';
import { formatTimeframeLabel, type LeadsFilters, type PreApprovedFilter, type StageFilter, type TimeframeFilter } from './leadsFiltersQuery';

const ALL_STAGES: LeadStage[] = ['new', 'contacted', 'appointment_set', 'toured', 'closed', 'closed_lost'];
const STAGE_LABEL: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contactado',
  appointment_set: 'Appointment Set',
  toured: 'Toured',
  closed: 'Closed',
  closed_lost: 'Closed Lost',
};

const ALL_TIMEFRAMES: LeadTimeframe[] = ['0-3 months', '3-6 months', '6-12 months', '12+ months'];

export type LeadsFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: LeadsFilters;
  onApply: (next: LeadsFilters) => void;
  onClear: () => void;
  canViewTeam: boolean;
  members: Agent[];
  resultsCount?: number;
  onTrack?: (event: string, properties?: Record<string, unknown>) => void;
};

export function LeadsFiltersSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
  canViewTeam,
  members,
  resultsCount,
  onTrack,
}: LeadsFiltersSheetProps) {
  const [draft, setDraft] = useState<LeadsFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const selectedStages = useMemo(() => (draft.stages === 'all' ? ALL_STAGES : draft.stages), [draft.stages]);
  const isAllStages = draft.stages === 'all' || selectedStages.length === ALL_STAGES.length;

  const toggleStage = (stage: LeadStage) => {
    const base = isAllStages ? [] : selectedStages.slice();
    const next = base.includes(stage) ? base.filter((s) => s !== stage) : [...base, stage];
    const normalized: StageFilter = next.length === 0 || next.length === ALL_STAGES.length ? 'all' : next;
    setDraft((prev) => ({ ...prev, stages: normalized }));
  };

  const assignmentOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: 'mine', label: 'Mis leads' }];
    if (canViewTeam) {
      opts.push({ value: 'team', label: 'Equipo (todos)' });
      members.forEach((m) => {
        opts.push({ value: `agent:${m.id}`, label: `${m.firstName} ${m.lastName || ''}`.trim() });
      });
    }
    return opts;
  }, [canViewTeam, members]);

  const assignmentValue =
    draft.assignment.scope === 'mine'
      ? 'mine'
      : draft.assignment.scope === 'team'
        ? 'team'
        : `agent:${draft.assignment.agentId}`;

  const setAssignmentFromValue = (value: string) => {
    if (value === 'mine') setDraft((p) => ({ ...p, assignment: { scope: 'mine' } }));
    else if (value === 'team') setDraft((p) => ({ ...p, assignment: { scope: 'team' } }));
    else if (value.startsWith('agent:')) {
      const id = value.slice('agent:'.length);
      setDraft((p) => ({ ...p, assignment: { scope: 'agent', agentId: id } }));
    }
  };

  const handleApply = () => {
    onTrack?.('leads.filters_applied', {
      stages: draft.stages === 'all' ? 'all' : draft.stages,
      timeframe: draft.timeframe,
      preApproved: draft.preApproved,
      assignment: draft.assignment,
    });
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) onTrack?.('leads.filters_opened', { from: 'leads_page' });
        onOpenChange(next);
      }}
    >
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros avanzados
          </SheetTitle>
          <SheetDescription>Filtra por estado, timeframe, pre-aprobación y asignación.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Etapas</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setDraft((p) => ({ ...p, stages: 'all' }))}
              >
                Seleccionar todo
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STAGES.map((stage) => {
                const checked = selectedStages.includes(stage);
                return (
                  <button
                    key={stage}
                    type="button"
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      checked ? 'bg-primary/5 border-primary/30' : 'bg-card hover:bg-muted/30'
                    )}
                    onClick={() => toggleStage(stage)}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleStage(stage)} />
                    <span className="text-sm">{STAGE_LABEL[stage]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Timeframe</p>
            <Select
              value={draft.timeframe === 'all' ? 'all' : draft.timeframe}
              onValueChange={(v) => setDraft((p) => ({ ...p, timeframe: (v === 'all' ? 'all' : (v as LeadTimeframe)) as TimeframeFilter }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ALL_TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf} value={tf}>
                    {formatTimeframeLabel(tf)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Pre-aprobación</p>
            <Select
              value={draft.preApproved}
              onValueChange={(v) => setDraft((p) => ({ ...p, preApproved: v as PreApprovedFilter }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Sí</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Asignación</p>
            <Select
              value={assignmentValue}
              onValueChange={(v) => setAssignmentFromValue(v)}
              disabled={!canViewTeam}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mis leads" />
              </SelectTrigger>
              <SelectContent>
                {assignmentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canViewTeam && (
              <p className="text-xs text-muted-foreground">Solo brokers/admin pueden ver filtros por equipo.</p>
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Resultados</p>
            <motion.p
              key={resultsCount ?? 'na'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold"
            >
              {typeof resultsCount === 'number' ? resultsCount : '—'}
            </motion.p>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              onTrack?.('leads.filters_cleared', { from: 'leads_page' });
              onClear();
              onOpenChange(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
          <Button className="gap-2" onClick={handleApply}>
            <CheckCircle2 className="h-4 w-4" />
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
