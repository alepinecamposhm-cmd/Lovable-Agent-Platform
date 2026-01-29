import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
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
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLeads } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import type { Lead, LeadStage } from '@/types/agents';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const stageConfig: Record<LeadStage, { label: string; color: string }> = {
  new: { label: 'Nuevos', color: 'bg-blue-500' },
  contacted: { label: 'Contactados', color: 'bg-purple-500' },
  engaged: { label: 'En Charla', color: 'bg-amber-500' },
  appointment_set: { label: 'Cita Agendada', color: 'bg-teal-500' },
  met: { label: 'Reunidos', color: 'bg-indigo-500' },
  negotiating: { label: 'Negociando', color: 'bg-orange-500' },
  closed_won: { label: 'Cerrado ✓', color: 'bg-green-500' },
  closed_lost: { label: 'Perdido', color: 'bg-gray-500' },
  archived: { label: 'Archivado', color: 'bg-gray-400' },
};

const pipelineStages: LeadStage[] = ['new', 'contacted', 'engaged', 'appointment_set', 'met', 'negotiating', 'closed_won'];

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

function LeadCard({ lead, isDragging }: LeadCardProps) {
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-md hover:-translate-y-0.5 transition-all',
        (isDragging || isSorting) && 'opacity-50 shadow-lg scale-105'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {lead.firstName[0]}{lead.lastName?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm leading-tight">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {lead.interestedIn === 'buy' ? 'Comprar' : lead.interestedIn === 'sell' ? 'Vender' : 'Rentar'}
            </p>
          </div>
        </div>
        <Badge 
          variant="secondary"
          className={cn(
            'text-[10px] px-1.5',
            lead.temperature === 'hot' && 'badge-hot',
            lead.temperature === 'warm' && 'badge-warm',
            lead.temperature === 'cold' && 'badge-cold'
          )}
        >
          {lead.temperature === 'hot' ? '🔥' : lead.temperature === 'warm' ? '☀️' : '❄️'}
        </Badge>
      </div>
      
      {lead.budgetMax && (
        <p className="text-xs text-muted-foreground mb-2">
          ${(lead.budgetMin || 0).toLocaleString()} - ${lead.budgetMax.toLocaleString()}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {lead.phone && (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Phone className="h-3 w-3" />
            </Button>
          )}
          {lead.email && (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Mail className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Link to={`/agents/leads/${lead.id}`}>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

interface StageColumnProps {
  stage: LeadStage;
  leads: Lead[];
}

function StageColumn({ stage, leads }: StageColumnProps) {
  const config = stageConfig[stage];
  
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('w-2 h-2 rounded-full', config.color)} />
        <h3 className="font-medium text-sm">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {leads.length}
        </Badge>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-2 min-h-[400px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            Sin leads
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentLeads() {
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState(mockLeads);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const leadsByStage = useMemo(() => {
    const filtered = leads.filter(lead =>
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return pipelineStages.reduce((acc, stage) => {
      acc[stage] = filtered.filter(lead => lead.stage === stage);
      return acc;
    }, {} as Record<LeadStage, Lead[]>);
  }, [leads, searchQuery]);

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Find the stage of the over element
    let targetStage: LeadStage | null = null;
    
    for (const stage of pipelineStages) {
      if (leadsByStage[stage].some(l => l.id === overId)) {
        targetStage = stage;
        break;
      }
    }

    if (!targetStage) return;

    const activeLead = leads.find(l => l.id === activeLeadId);
    if (!activeLead || activeLead.stage === targetStage) return;

    // Update lead stage
    setLeads(prev => prev.map(lead =>
      lead.id === activeLeadId
        ? { ...lead, stage: targetStage! }
        : lead
    ));

    // Celebrate if moved to closed_won
    if (targetStage === 'closed_won') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
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
          <p className="text-muted-foreground">
            Gestiona tu pipeline de clientes potenciales
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
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
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineStages.map((stage) => (
                <StageColumn
                  key={stage}
                  stage={stage}
                  leads={leadsByStage[stage] || []}
                />
              ))}
            </div>
            
            <DragOverlay>
              {activeLead && (
                <div className="bg-card border rounded-lg p-3 shadow-xl rotate-3 scale-105">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {activeLead.firstName[0]}{activeLead.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {activeLead.firstName} {activeLead.lastName}
                      </p>
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
              <div className="divide-y">
                {leads.filter(lead =>
                  lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  lead.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/agents/leads/${lead.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lead.firstName[0]}{lead.lastName?.[0] || ''}
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
                      {stageConfig[lead.stage].label}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        lead.temperature === 'hot' && 'badge-hot',
                        lead.temperature === 'warm' && 'badge-warm',
                        lead.temperature === 'cold' && 'badge-cold'
                      )}
                    >
                      {lead.temperature === 'hot' ? '🔥 Caliente' : lead.temperature === 'warm' ? '☀️ Tibio' : '❄️ Frío'}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
