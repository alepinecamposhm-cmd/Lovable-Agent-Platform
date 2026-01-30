import { useEffect, useMemo, useState } from 'react';
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
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
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
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { add as addNotification, useNotificationStore } from '@/lib/agents/notifications/store';
import { toast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

const stageConfig: Record<LeadStage, { label: string; color: string; helper?: string }> = {
  new: { label: 'New', color: 'bg-blue-500', helper: 'Ingreso reciente' },
  contacted: { label: 'Contactado', color: 'bg-purple-500', helper: 'Primer respuesta enviada' },
  appointment_set: { label: 'Appointment Set', color: 'bg-teal-500', helper: 'Cita programada' },
  toured: { label: 'Toured', color: 'bg-indigo-500', helper: 'Visita realizada' },
  closed: { label: 'Closed', color: 'bg-green-500', helper: 'Venta/arrendo cerrado' },
  closed_lost: { label: 'Closed Lost', color: 'bg-gray-500', helper: 'Perdido' },
};

const pipelineStages: LeadStage[] = ['new', 'contacted', 'appointment_set', 'toured', 'closed'];

interface LeadCardProps {
  lead: Lead;
  unread: boolean;
  isDragging?: boolean;
}

function LeadCard({ lead, unread, isDragging }: LeadCardProps) {
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
          {isNew && <Badge variant="secondary" className="text-[10px]">Nuevo</Badge>}
          {unread && <Badge variant="default" className="text-[10px]">Msg</Badge>}
        </div>
      </div>

      {lead.budgetMax && (
        <p className="text-xs text-muted-foreground mb-2">
          ${(lead.budgetMin || 0).toLocaleString()} - ${lead.budgetMax.toLocaleString()}
        </p>
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
        <Link to={`/agents/leads/${lead.id}`}>
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
}

function StageColumn({ stage, leads, unreadIds }: StageColumnProps) {
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
              <LeadCard key={lead.id} lead={lead} unread={unreadIds.has(lead.id)} />
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const { notifications } = useNotificationStore();
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage[] | 'all'>('all');
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const unreadLeadIds = useMemo(() => {
    return new Set(
      notifications
        .filter((n) => n.type === 'message' && n.status === 'unread' && n.actionUrl?.includes('/agents/leads/'))
        .map((n) => n.actionUrl?.split('/').pop() || '')
        .filter(Boolean)
    );
  }, [notifications]);

  const filteredLeads = useMemo(() => {
    const text = searchQuery.toLowerCase();
    return leads
      .filter((lead) =>
        [lead.firstName, lead.lastName, lead.email, lead.phone]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(text))
      )
      .filter((lead) => stageFilter === 'all' || stageFilter.includes(lead.stage))
      .filter((lead) => !onlyNew || differenceInHours(new Date(), lead.createdAt) <= 48 || lead.stage === 'new')
      .filter((lead) => !onlyUnread || unreadLeadIds.has(lead.id));
  }, [leads, searchQuery, stageFilter, onlyNew, onlyUnread, unreadLeadIds]);

  const leadsByStage = useMemo(() => {
    return pipelineStages.reduce((acc, stage) => {
      acc[stage] = filteredLeads.filter((lead) => lead.stage === stage);
      return acc;
    }, {} as Partial<Record<LeadStage, Lead[]>>);
  }, [filteredLeads]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

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
    
    // TODO: replace with API call
    setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, stage: targetStage! } : l));

    const stageLabel = stageConfig[targetStage].label;
    toast({
      title: `Lead movido a ${stageLabel}`,
      description: `${lead.firstName} ahora está en ${stageLabel}.`,
      duration: 5000,
      action: (
        <ToastAction altText="Deshacer" onClick={() => {
          // TODO: replace with API call
          setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, stage: previousStage } : l));
        }}>
          Deshacer
        </ToastAction>
      ),
    });

    addNotification({
      type: targetStage === 'appointment_set' ? 'appointment' : 'lead',
      title: targetStage === 'appointment_set' ? 'Cita programada' : `Lead movido a ${stageLabel}`,
      body: `${lead.firstName} ${lead.lastName || ''}`.trim(),
      actionUrl: `/agents/leads/${activeLeadId}`,
    });

    if (targetStage === 'closed') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }
  };

  const handleAddLead = () => {
    const random = Math.floor(Math.random() * 900) + 100;
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      agentId: 'agent-1',
      firstName: `Lead ${random}`,
      lastName: 'Demo',
      stage: 'new',
      interestedIn: 'buy',
      source: 'marketplace',
      temperature: 'warm',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: `conv-${Date.now()}`,
    };
    // TODO: replace with API call
    setLeads(prev => [newLead, ...prev]);

    toast({
      title: 'Lead creado',
      description: `${newLead.firstName} añadido al pipeline (New).`,
    });
    addNotification({
      type: 'lead',
      title: 'Nuevo lead asignado',
      body: `${newLead.firstName} acaba de ingresar`,
      actionUrl: `/agents/leads/${newLead.id}`,
    });
  };

  const toggleStageFilter = (stage: LeadStage) => {
    if (stageFilter === 'all') {
      setStageFilter([stage]);
    } else {
      const next = stageFilter.includes(stage)
        ? stageFilter.filter((s) => s !== stage)
        : [...stageFilter, stage];
      setStageFilter(next.length === pipelineStages.length ? 'all' : next);
    }
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
              variant={stageFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStageFilter('all')}
            >
              Todos
            </Badge>
            {pipelineStages.map((stage) => (
              <Badge
                key={stage}
                variant={stageFilter !== 'all' && stageFilter.includes(stage) ? 'default' : 'outline'}
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
        <div className="flex gap-2 self-start">
          <Button variant="outline" size="icon" aria-label="Abrir filtros avanzados">
            <Filter className="h-4 w-4" />
          </Button>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'pipeline' | 'list')}>
            <TabsList>
              <TabsTrigger value="pipeline">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

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

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y" role="list">
                {filteredLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/agents/leads/${lead.id}`}
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
    </motion.div>
  );
}
