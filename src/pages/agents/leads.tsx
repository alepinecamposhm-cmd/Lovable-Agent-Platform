import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Table2,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import type { Lead, LeadStage } from '@/types/agents';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { differenceInHours } from 'date-fns';
import { add as addNotification, useNotificationStore } from '@/lib/agents/notifications/store';
import { toast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { matchAgent } from '@/lib/agents/routing/store';
import { mockTeamAgents } from '@/lib/agents/fixtures';
import { addTask } from '@/lib/agents/tasks/store';
import { getCurrentUser, listMembers, subscribe as subscribeTeam } from '@/lib/agents/team/store';
import { useConsumeCredits } from '@/lib/credits/query';
import { InsufficientCreditsDialog } from '@/components/agents/credits/InsufficientCreditsDialog';
import { useCreditAccount } from '@/lib/credits/query';
import { LeadsCrmTable } from '@/components/agents/leads/LeadsCrmTable';
import { LeadsFiltersSheet } from '@/components/agents/leads/LeadsFiltersSheet';
import { getDefaultLeadsQueryState, parseLeadsQuery, serializeLeadsQuery, type LeadsQueryState, type LeadsViewMode } from '@/components/agents/leads/leadsFiltersQuery';
import { addLead, updateLeadStage, useLeadStore } from '@/lib/agents/leads/store';

const stageConfig: Record<LeadStage, { label: string; color: string; helper?: string }> = {
  new: { label: 'New', color: 'bg-blue-500', helper: 'Ingreso reciente' },
  contacted: { label: 'Contactado', color: 'bg-purple-500', helper: 'Primer respuesta enviada' },
  appointment_set: { label: 'Appointment Set', color: 'bg-teal-500', helper: 'Cita programada' },
  toured: { label: 'Toured', color: 'bg-indigo-500', helper: 'Visita realizada' },
  closed: { label: 'Closed', color: 'bg-green-500', helper: 'Venta/arrendo cerrado' },
  closed_lost: { label: 'Closed Lost', color: 'bg-gray-500', helper: 'Perdido' },
};

const pipelineStages: LeadStage[] = ['new', 'contacted', 'appointment_set', 'toured', 'closed'];
const LEAD_ACCEPT_COST = 2;

const track = (event: string, properties?: Record<string, unknown>) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
};

interface LeadCardProps {
  lead: Lead;
  unread: boolean;
  isDragging?: boolean;
  onAccept?: (lead: Lead) => void;
  accepting?: boolean;
  acceptCost?: number;
  assigneeName?: string;
  flash?: boolean;
}

function LeadCard({ lead, unread, isDragging, onAccept, accepting, acceptCost, assigneeName, flash }: LeadCardProps) {
  const location = useLocation();
  const backTo = `${location.pathname}${location.search}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isNew = lead.stage === 'new' || differenceInHours(new Date(), lead.createdAt) <= 48;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -2 }}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all shadow-sm',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        (isDragging || isSorting) && 'opacity-60 shadow-lg scale-[1.02]',
        isNew && 'ring-2 ring-primary/10'
      )}
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {lead.firstName[0]}
              {lead.lastName?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm leading-tight">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {lead.interestedIn === 'buy'
                ? 'Comprar'
                : lead.interestedIn === 'sell'
                  ? 'Vender'
                  : 'Rentar'}
            </p>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          {assigneeName && (
            <Badge variant="outline" className={cn('text-[10px]', flash && 'bg-primary/20 border-primary/30 animate-pulse')}>
              Asignado a {assigneeName}
            </Badge>
          )}
          {isNew && <Badge variant="secondary" className="text-[10px]">Nuevo</Badge>}
          {unread && <Badge variant="default" className="text-[10px]">Msg</Badge>}
        </div>
      </div>

      {lead.budgetMax && (
        <p className="text-xs text-muted-foreground mb-2">
          ${(lead.budgetMin || 0).toLocaleString()} - ${lead.budgetMax.toLocaleString()}
        </p>
      )}

      {lead.stage === 'new' && onAccept && (
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-muted-foreground">
            Aceptar lead: {acceptCost ?? 0} créditos
          </div>
          <Button
            size="sm"
            onClick={() => onAccept(lead)}
            disabled={accepting}
            className="h-7 text-xs"
          >
            {accepting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Aceptar lead'}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {lead.phone && (
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Llamar lead">
              <Phone className="h-3.5 w-3.5" />
            </Button>
          )}
          {lead.email && (
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Enviar email">
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <Link to={`/agents/lead/${lead.id}`} state={{ backTo }}>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Ver detalle">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

interface StageColumnProps {
  stage: LeadStage;
  leads: Lead[];
  unreadIds: Set<string>;
  memberLookup: Record<string, string>;
  flash: Set<string>;
}

function StageColumn({ stage, leads, unreadIds, memberLookup, flash }: StageColumnProps) {
  const config = stageConfig[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex-shrink-0 w-80" ref={setNodeRef} aria-label={`Columna ${config.label}`}>
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('w-2 h-2 rounded-full', config.color)} />
        <h3 className="font-medium text-sm">{config.label}</h3>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={leads.length}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="ml-auto"
          >
            <Badge variant="secondary" className="text-xs">
              {leads.length}
            </Badge>
          </motion.span>
        </AnimatePresence>
      </div>

      <div
        className={cn(
          'rounded-lg p-2 min-h-[420px] bg-muted/30 border border-dashed transition-colors',
          isOver && 'border-primary/60 bg-primary/5 shadow-inner'
        )}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2" role="list">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                unread={unreadIds.has(lead.id)}
                assigneeName={memberLookup[lead.assignedTo || '']}
                flash={flash.has(lead.id)}
                onAccept={handleAcceptLead}
                accepting={acceptingId === lead.id}
                acceptCost={getCostForAction(lead.source === 'marketplace' ? 'lead_premium' : 'lead_basic')}
              />
            ))}
          </div>
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground" role="status">
            Sin leads
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentLeads() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { leads, error: leadsError } = useLeadStore();
  const { notifications } = useNotificationStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [insufficientOpen, setInsufficientOpen] = useState(false);
  const [insufficientVariant, setInsufficientVariant] = useState<'balance' | 'daily_limit' | 'rule_disabled'>('balance');
  const [insufficientMeta, setInsufficientMeta] = useState<{ dailyLimit?: number; spentToday?: number } | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const [teamMembers, setTeamMembers] = useState(listMembers());
  const [assignmentFlash, setAssignmentFlash] = useState<Set<string>>(new Set());
  const assignmentRef = useRef<Record<string, string>>({});
  const currentUser = getCurrentUser();
  const canViewTeam = currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'broker';
  const { mutateAsync: consumeCredits } = useConsumeCredits();
  const { data: creditAccount } = useCreditAccount();
  const invalidToastShown = useRef(false);

  const parsedQuery = useMemo(() => parseLeadsQuery(searchParams), [searchParams]);
  const queryState: LeadsQueryState = useMemo(() => {
    if (canViewTeam) return parsedQuery.state;
    if (parsedQuery.state.filters.assignment.scope !== 'mine') {
      return { ...parsedQuery.state, filters: { ...parsedQuery.state.filters, assignment: { scope: 'mine' } } };
    }
    return parsedQuery.state;
  }, [parsedQuery.state, canViewTeam]);

  const viewMode: LeadsViewMode = queryState.view;
  const filters = queryState.filters;
  const backTo = `${location.pathname}${location.search}`;
  const isLoading = !hydrated;

  const commitQuery = (next: LeadsQueryState, opts?: { replace?: boolean }) => {
    const nextParams = serializeLeadsQuery(next, searchParams);
    setSearchParams(nextParams, { replace: opts?.replace ?? true });
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const hadInvalid = parsedQuery.hadInvalid || (!canViewTeam && parsedQuery.state.filters.assignment.scope !== 'mine');
    if (!hadInvalid) return;
    if (!invalidToastShown.current) {
      invalidToastShown.current = true;
      toast({ title: 'Filtros inválidos', description: 'Restauramos filtros por defecto.' });
    }
    commitQuery(queryState, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQuery.hadInvalid, canViewTeam]);

  useEffect(() => {
    if (viewMode === 'crm') {
      track('leads.crm_view_opened', { view: 'crm', source: 'leads_page' });
    }
  }, [viewMode]);

  const staleCount = useMemo(
    () => leads.filter((l) => l.stage === 'new' && differenceInHours(new Date(), l.createdAt) >= 2).length,
    [leads]
  );
  const memberLookup = useMemo(() => {
    const map: Record<string, string> = {};
    teamMembers.forEach((m) => { map[m.id] = m.firstName; });
    return map;
  }, [teamMembers]);

  useEffect(() => {
    const unsub = subscribeTeam(() => setTeamMembers(listMembers()));
    return () => unsub();
  }, []);

  useEffect(() => {
    const prev = assignmentRef.current;
    const nextMap: Record<string, string> = {};
    const changed = new Set<string>();
    leads.forEach((l) => {
      nextMap[l.id] = l.assignedTo || '';
      if (prev[l.id] && prev[l.id] !== l.assignedTo) {
        changed.add(l.id);
      }
    });
    assignmentRef.current = nextMap;
    if (changed.size) {
      setAssignmentFlash(new Set(changed));
      const id = setTimeout(() => setAssignmentFlash(new Set()), 900);
      return () => clearTimeout(id);
    }
  }, [leads]);

  useEffect(() => {
    const stale = leads.filter(
      (lead) =>
        lead.stage === 'new' &&
        differenceInHours(new Date(), lead.createdAt) >= 2
    );
    if (stale.length > 0) {
      const already = localStorage.getItem('agenthub_sla_notified') === '1';
      if (!already) {
        const lead = stale[0];
        addTask({
          title: `Responder a ${lead.firstName}`,
          leadId: lead.id,
          dueAt: new Date(),
          priority: 'high',
          origin: 'auto',
          originKey: `sla-${lead.id}`,
          tags: ['SLA'],
        });
        addNotification({
          type: 'task',
          title: 'Nudge SLA: Lead sin respuesta',
          body: `${lead.firstName} lleva >2h en New`,
          actionUrl: `/agents/lead/${lead.id}`,
        });
        toast({
          title: 'Nudge SLA',
          description: `${lead.firstName} espera respuesta. Creamos una tarea.`,
          action: <ToastAction altText="Abrir lead" onClick={() => navigate(`/agents/lead/${lead.id}`, { state: { backTo } })}>Ver lead</ToastAction>,
        });
        window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'sla.nudge_shown', leadId: lead.id } }));
        localStorage.setItem('agenthub_sla_notified', '1');
      }
    }
  }, [leads, navigate, backTo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const unreadLeadIds = useMemo(() => {
    return new Set(
      notifications
        .filter((n) => n.type === 'message' && n.status === 'unread' && (n.actionUrl?.includes('/agents/leads/') || n.actionUrl?.includes('/agents/lead/')))
        .map((n) => n.actionUrl?.split('/').pop() || '')
        .filter(Boolean)
    );
  }, [notifications]);

  const assignmentAgentId = filters.assignment.scope === 'agent' ? filters.assignment.agentId : '';

  const filteredLeads = useMemo(() => {
    const text = searchQuery.toLowerCase();
    const scoped = filters.assignment.scope === 'mine'
      ? leads.filter((l) => l.assignedTo === currentUser.id)
      : filters.assignment.scope === 'team'
        ? leads
        : leads.filter((l) => l.assignedTo === filters.assignment.agentId);

    return scoped
      .filter((lead) =>
        [lead.firstName, lead.lastName, lead.email, lead.phone]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(text))
      )
      .filter((lead) => filters.stages === 'all' || filters.stages.includes(lead.stage))
      .filter((lead) => filters.timeframe === 'all' || lead.timeframe === filters.timeframe)
      .filter((lead) => {
        if (filters.preApproved === 'all') return true;
        return filters.preApproved === 'yes' ? lead.preApproved === true : lead.preApproved === false;
      })
      .filter((lead) => !onlyNew || differenceInHours(new Date(), lead.createdAt) <= 48 || lead.stage === 'new')
      .filter((lead) => !onlyUnread || unreadLeadIds.has(lead.id));
  }, [leads, searchQuery, filters.assignment.scope, assignmentAgentId, filters.preApproved, filters.stages, filters.timeframe, onlyNew, onlyUnread, unreadLeadIds, currentUser.id]);

  const leadsByStage = useMemo(() => {
    return pipelineStages.reduce((acc, stage) => {
      acc[stage] = filteredLeads.filter((lead) => lead.stage === stage);
      return acc;
    }, {} as Partial<Record<LeadStage, Lead[]>>);
  }, [filteredLeads]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const getCostForAction = (action: 'lead_basic' | 'lead_premium') => {
    const rule = creditAccount?.rules.find((r) => r.action === action);
    if (!rule) return LEAD_ACCEPT_COST;
    return rule.cost;
  };

  const handleAcceptLead = async (lead: Lead) => {
    setAcceptingId(lead.id);
    const action: 'lead_basic' | 'lead_premium' = lead.source === 'marketplace' ? 'lead_premium' : 'lead_basic';
    const cost = getCostForAction(action);
    try {
      const ruleEnabled = creditAccount?.rules.find((r) => r.action === action)?.isEnabled ?? true;
      if (!ruleEnabled) {
        setInsufficientVariant('rule_disabled');
        setInsufficientOpen(true);
        track('credits_rule_disabled_block', { source: 'lead', action });
        return;
      }
      track('credits_consume_start', { source: 'lead', leadId: lead.id, amount: cost });
      await consumeCredits({
        accountId: 'credit-1',
        amount: cost,
        action,
        referenceType: 'lead',
        referenceId: lead.id,
      });
      updateLeadStage(lead.id, 'contacted');
      toast({
        title: 'Lead aceptado',
        description: `Se descontaron ${cost} créditos.`,
      });
      track('credits_consume_complete', { source: 'lead', leadId: lead.id, amount: cost });
      track('lead_accept_confirm', { leadId: lead.id, amount: cost });
    } catch (e) {
      const err = e as Error & { meta?: { dailyLimit?: number; spentToday?: number } };
      const message = err.message || String(err);
      if (message === 'Error: INSUFFICIENT_BALANCE' || message === 'INSUFFICIENT_BALANCE') {
        setInsufficientVariant('balance');
        setInsufficientOpen(true);
        track('credits_insufficient_modal_shown', { source: 'lead', leadId: lead.id });
      } else if (message === 'Error: DAILY_LIMIT' || message === 'DAILY_LIMIT') {
        setInsufficientVariant('daily_limit');
        setInsufficientMeta(err.meta);
        setInsufficientOpen(true);
        track('credits_daily_limit_blocked', { source: 'lead', leadId: lead.id });
      } else if (message === 'Error: RULE_DISABLED' || message === 'RULE_DISABLED') {
        setInsufficientVariant('rule_disabled');
        setInsufficientOpen(true);
        track('credits_rule_disabled_block', { source: 'lead', leadId: lead.id });
      } else {
        toast({ title: 'No se pudo aceptar el lead', variant: 'destructive' });
        track('credits_consume_error', { source: 'lead', leadId: lead.id, message });
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    let targetStage: LeadStage | null = null;
    if (pipelineStages.includes(overId as LeadStage)) {
      targetStage = overId as LeadStage;
    } else {
      targetStage = pipelineStages.find((stage) => leadsByStage[stage]?.some((l) => l.id === overId)) || null;
    }

    if (!targetStage) return;

    const lead = leads.find(l => l.id === activeLeadId);
    if (!lead || lead.stage === targetStage) return;

    const previousStage = lead.stage;
    updateLeadStage(activeLeadId, targetStage);

    const stageLabel = stageConfig[targetStage].label;
    toast({
      title: `Lead movido a ${stageLabel}`,
      description: `${lead.firstName} ahora está en ${stageLabel}.`,
      duration: 5000,
      action: (
        <ToastAction altText="Deshacer" onClick={() => {
          updateLeadStage(activeLeadId, previousStage);
        }}>
          Deshacer
        </ToastAction>
      ),
    });

    addNotification({
      type: targetStage === 'appointment_set' ? 'appointment' : 'lead',
      title: targetStage === 'appointment_set' ? 'Cita programada' : `Lead movido a ${stageLabel}`,
      body: `${lead.firstName} ${lead.lastName || ''}`.trim(),
      actionUrl: `/agents/lead/${activeLeadId}`,
    });

    if (targetStage === 'closed') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }
  };

  const handleAddLead = () => {
    const random = Math.floor(Math.random() * 900) + 100;
    const assignedTo = matchAgent({ zone: 'Polanco', price: 5000000 }) || currentUser.id;
    const newLead = addLead({
      firstName: `Lead ${random}`,
      lastName: 'Demo',
      stage: 'new',
      interestedIn: 'buy',
      source: 'marketplace',
      temperature: 'warm',
      assignedTo,
    });

    toast({
      title: 'Lead creado',
      description: `${newLead.firstName} asignado a ${mockTeamAgents.find(a => a.id === assignedTo)?.firstName || 'agente'}.`,
    });
    addNotification({
      type: 'lead',
      title: 'Nuevo lead asignado',
      body: `${newLead.firstName} acaba de ingresar`,
      actionUrl: `/agents/lead/${newLead.id}`,
    });
  };

  const openLead = (lead: Lead, source: 'crm' | 'list' | 'pipeline' = 'crm') => {
    if (source === 'crm') {
      track('leads.crm_row_opened', { leadId: lead.id, stage: lead.stage, source: lead.source });
    }
    navigate(`/agents/lead/${lead.id}`, { state: { backTo } });
  };

  const toggleStageFilter = (stage: LeadStage) => {
    const current = filters.stages === 'all' ? [] : filters.stages;
    const next = current.includes(stage) ? current.filter((s) => s !== stage) : [...current, stage];
    const normalized = next.length === 0 ? 'all' : next;
    commitQuery({ ...queryState, filters: { ...filters, stages: normalized } }, { replace: false });
  };

  const hasAdvancedFilters =
    filters.stages !== 'all' ||
    filters.timeframe !== 'all' ||
    filters.preApproved !== 'all' ||
    filters.assignment.scope !== 'mine';

  const clearAdvancedFilters = () => {
    const defaults = getDefaultLeadsQueryState();
    commitQuery({ ...queryState, filters: defaults.filters }, { replace: false });
    track('leads.filters_cleared', { view: viewMode });
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Pipeline Kanban (New → Closed)</p>
        </div>
        <Button onClick={handleAddLead} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Lead
        </Button>
      </motion.div>

      {staleCount > 0 && (
        <motion.div variants={staggerItem} className="p-4 rounded-lg border bg-warning/10 text-sm flex items-center justify-between">
          <div>
            <p className="font-medium">Nudge SLA: {staleCount} lead(s) sin respuesta &gt; 2h</p>
            <p className="text-muted-foreground text-xs">Se creó tarea automática y notificación.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => window.location.assign('/agents/tasks')}>Ir a Tareas</Button>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Buscar leads"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.stages === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => commitQuery({ ...queryState, filters: { ...filters, stages: 'all' } }, { replace: false })}
            >
              Todos
            </Badge>
            {[...pipelineStages, 'closed_lost' as const].map((stage) => (
              <Badge
                key={stage}
                variant={filters.stages !== 'all' && filters.stages.includes(stage) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleStageFilter(stage)}
              >
                {stageConfig[stage].label}
              </Badge>
            ))}
            <Badge
              variant={onlyNew ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setOnlyNew((v) => !v)}
            >
              <Sparkles className="h-3 w-3 mr-1" /> Nuevos 48h
            </Badge>
            <Badge
              variant={onlyUnread ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setOnlyUnread((v) => !v)}
            >
              Mensajes sin leer
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 self-start items-center">
          {canViewTeam && (
            <Button
              variant={filters.assignment.scope === 'mine' ? 'outline' : 'default'}
              size="sm"
              onClick={() =>
                commitQuery(
                  {
                    ...queryState,
                    filters: {
                      ...filters,
                      assignment:
                        filters.assignment.scope === 'mine' ? { scope: 'team' } : { scope: 'mine' },
                    },
                  },
                  { replace: false }
                )}
            >
              Ver {filters.assignment.scope === 'mine' ? 'leads del equipo' : 'mis leads'}
            </Button>
          )}
          <Button variant="outline" size="icon" aria-label="Abrir filtros avanzados" onClick={() => setFiltersOpen(true)}>
            <Filter className="h-4 w-4" />
          </Button>
          <Tabs value={viewMode} onValueChange={(v) => commitQuery({ ...queryState, view: v as LeadsViewMode }, { replace: false })}>
            <TabsList>
              <TabsTrigger value="pipeline">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="crm">
                <Table2 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
      {!canViewTeam && (
        <div className="mb-2">
          <div className="flex items-center gap-2 rounded-md border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Solo brokers/admin pueden ver todo el equipo. Pide acceso al owner.
          </div>
        </div>
      )}
      {canViewTeam && filters.assignment.scope === 'team' && (
        <div className="mb-2">
          <div className="flex items-center gap-2 rounded-md border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Estás viendo todos los leads del equipo. Usa filtros para acotar.
          </div>
        </div>
      )}
      {canViewTeam && filters.assignment.scope === 'agent' && (
        <div className="mb-2">
          <div className="flex items-center gap-2 rounded-md border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Estás viendo los leads asignados a {memberLookup[filters.assignment.agentId] || filters.assignment.agentId}.
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {hasAdvancedFilters && (
          <motion.div
            key="advanced-filter-chips"
            variants={staggerItem}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex flex-wrap items-center gap-2"
            aria-label="Filtros activos"
          >
            {filters.stages !== 'all' &&
              filters.stages.map((stage) => (
                <Badge key={`stage:${stage}`} variant="secondary" className="gap-1">
                  {stageConfig[stage].label}
                  <button
                    type="button"
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-label={`Quitar filtro ${stageConfig[stage].label}`}
                    onClick={() => toggleStageFilter(stage)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            {filters.timeframe !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Timeframe: {filters.timeframe.replace(' months', ' meses')}
                <button
                  type="button"
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Quitar filtro timeframe"
                  onClick={() => commitQuery({ ...queryState, filters: { ...filters, timeframe: 'all' } }, { replace: false })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.preApproved !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Pre-aprobado: {filters.preApproved === 'yes' ? 'Sí' : 'No'}
                <button
                  type="button"
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Quitar filtro pre-aprobación"
                  onClick={() => commitQuery({ ...queryState, filters: { ...filters, preApproved: 'all' } }, { replace: false })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.assignment.scope !== 'mine' && (
              <Badge variant="secondary" className="gap-1">
                {filters.assignment.scope === 'team'
                  ? 'Equipo'
                  : `Asignado a: ${memberLookup[filters.assignment.agentId] || filters.assignment.agentId}`}
                <button
                  type="button"
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Quitar filtro de asignación"
                  onClick={() => commitQuery({ ...queryState, filters: { ...filters, assignment: { scope: 'mine' } } }, { replace: false })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="h-7 px-2 text-xs">
              Limpiar filtros
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <motion.div variants={staggerItem}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            autoScroll
          >
            <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Pipeline Kanban">
              {pipelineStages.map((stage) => (
                <StageColumn
                  key={stage}
                  stage={stage}
                  leads={leadsByStage[stage] || []}
                  unreadIds={unreadLeadIds}
                  memberLookup={memberLookup}
                  flash={assignmentFlash}
                />
              ))}
            </div>

            <DragOverlay>
              {activeLead && (
                <div className="bg-card border rounded-lg p-3 shadow-xl rotate-3 scale-105 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {activeLead.firstName[0]}
                        {activeLead.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {activeLead.firstName} {activeLead.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{stageConfig[activeLead.stage].label}</p>
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </motion.div>
      )}

      {/* CRM View */}
      {viewMode === 'crm' && (
        <motion.div variants={staggerItem}>
          <LeadsCrmTable
            leads={filteredLeads}
            loading={isLoading}
            error={leadsError}
            memberLookup={memberLookup}
            onOpenLead={(lead) => openLead(lead, 'crm')}
            onTrack={(event, properties) => track(event, properties)}
          />
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y" role="list">
                {filteredLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/agents/lead/${lead.id}`}
                    state={{ backTo }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    role="listitem"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lead.firstName[0]}
                        {lead.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.email || lead.phone || 'Sin contacto'}
                      </p>
                    </div>
                    {memberLookup[lead.assignedTo || ''] && (
                      <Badge
                        variant="outline"
                        className={cn('text-[11px] hidden sm:inline-flex', assignmentFlash.has(lead.id) && 'bg-primary/20 border-primary/30 animate-pulse')}
                      >
                        {memberLookup[lead.assignedTo || '']}
                      </Badge>
                    )}
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {stageConfig[lead.stage]?.label || lead.stage}
                    </Badge>
                    {unreadLeadIds.has(lead.id) && <Badge variant="default">Msg</Badge>}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
                {filteredLeads.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground text-sm">
                    No hay leads con estos filtros
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <LeadsFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={(nextFilters) => commitQuery({ ...queryState, filters: nextFilters }, { replace: false })}
        onClear={() => {
          const defaults = getDefaultLeadsQueryState();
          commitQuery({ ...queryState, filters: defaults.filters }, { replace: false });
        }}
        canViewTeam={canViewTeam}
        members={teamMembers}
        resultsCount={filteredLeads.length}
        onTrack={(event, properties) => track(event, properties)}
      />
      <InsufficientCreditsDialog
        open={insufficientOpen}
        onClose={() => setInsufficientOpen(false)}
        onRecharge={() => {
          setInsufficientOpen(false);
          window.location.assign('/agents/credits');
        }}
        variant={insufficientVariant}
        meta={insufficientMeta}
      />
    </motion.div>
  );
}
