import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ListFilter,
  Building2,
  UserCheck,
  Share2,
  Globe,
  Phone,
  MoreHorizontal,
  AlertTriangle,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RoutingRuleForm } from './RoutingRuleForm';
import { RoutingSimulator } from './RoutingSimulator';
import { LeadRoutingRule, LeadSource } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const leadSourceLabels: Record<LeadSource, { label: string; icon: React.ReactNode }> = {
  portal: { label: 'Portal', icon: <Building2 className="h-3 w-3" /> },
  referido: { label: 'Referido', icon: <UserCheck className="h-3 w-3" /> },
  redes_sociales: { label: 'Redes', icon: <Share2 className="h-3 w-3" /> },
  sitio_web: { label: 'Web', icon: <Globe className="h-3 w-3" /> },
  llamada: { label: 'Llamada', icon: <Phone className="h-3 w-3" /> },
  otro: { label: 'Otro', icon: <MoreHorizontal className="h-3 w-3" /> },
};

interface TeamAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'activo' | 'pausado' | 'invitado';
  leadRoutingWeight?: number;
}

// ---- Conflict detection ----
type ConflictsMap = Map<string, { conflictsWith: string[]; details: string[] }>;

function detectConflicts(rules: LeadRoutingRule[]): ConflictsMap {
  const activeRules = rules.filter((r) => r.isActive);
  const conflicts: ConflictsMap = new Map();

  for (let i = 0; i < activeRules.length; i++) {
    for (let j = i + 1; j < activeRules.length; j++) {
      const a = activeRules[i];
      const b = activeRules[j];
      const overlaps: string[] = [];

      // Check zone overlap
      const sharedZones = (a.conditions.zone || []).filter((z) =>
        (b.conditions.zone || []).includes(z)
      );
      if (sharedZones.length > 0) {
        overlaps.push(`Zona: ${sharedZones.join(', ')}`);
      }

      // Check source overlap
      const sharedSources = (a.conditions.source || []).filter((s) =>
        (b.conditions.source || []).includes(s)
      );
      if (sharedSources.length > 0) {
        overlaps.push(
          `Fuente: ${sharedSources.map((s) => leadSourceLabels[s]?.label || s).join(', ')}`
        );
      }

      // Check propertyType overlap
      const sharedTypes = (a.conditions.propertyType || []).filter((t) =>
        (b.conditions.propertyType || []).includes(t)
      );
      if (sharedTypes.length > 0) {
        overlaps.push(`Tipo: ${sharedTypes.join(', ')}`);
      }

      if (overlaps.length > 0) {
        // Add conflict for rule a
        const existingA = conflicts.get(a.id) || { conflictsWith: [], details: [] };
        existingA.conflictsWith.push(b.id);
        existingA.details.push(`Se solapa con "${b.name}": ${overlaps.join('; ')}`);
        conflicts.set(a.id, existingA);

        // Add conflict for rule b
        const existingB = conflicts.get(b.id) || { conflictsWith: [], details: [] };
        existingB.conflictsWith.push(a.id);
        existingB.details.push(`Se solapa con "${a.name}": ${overlaps.join('; ')}`);
        conflicts.set(b.id, existingB);
      }
    }
  }

  return conflicts;
}

// ---- Sortable Row ----
interface SortableRowProps {
  rule: LeadRoutingRule;
  index: number;
  agents: TeamAgent[];
  conflict?: { conflictsWith: string[]; details: string[] };
  highlightedRuleId: string | null;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (rule: LeadRoutingRule) => void;
  onDelete: (id: string) => void;
  onHighlight: (id: string) => void;
}

function SortableRow({
  rule,
  index,
  agents,
  conflict,
  highlightedRuleId,
  onToggle,
  onEdit,
  onDelete,
  onHighlight,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getAgentNames = (agentIds: string[]) => {
    return agentIds
      .map((id) => agents.find((a) => a.id === id)?.name || 'Desconocido')
      .join(', ');
  };

  const isHighlighted = highlightedRuleId === rule.id;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'bg-muted',
        isHighlighted && 'animate-pulse bg-yellow-50'
      )}
    >
      <TableCell className="w-[50px]">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell className="font-medium">{rule.name}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1 items-center">
          {rule.conditions.zone?.map((zone) => (
            <Badge key={zone} variant="secondary" className="text-xs">
              {zone}
            </Badge>
          ))}
          {rule.conditions.source?.map((source) => (
            <Badge key={source} variant="default" className="text-xs gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
              {leadSourceLabels[source]?.icon}
              {leadSourceLabels[source]?.label || source}
            </Badge>
          ))}
          {rule.conditions.propertyType?.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
          {conflict && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-300 bg-yellow-50 cursor-pointer text-xs gap-1"
                    onClick={() => {
                      if (conflict.conflictsWith[0]) {
                        onHighlight(conflict.conflictsWith[0]);
                      }
                    }}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Conflicto
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    {conflict.details.map((d, i) => (
                      <p key={i} className="text-xs">{d}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-[150px] truncate">
        {getAgentNames(rule.assignTo)}
      </TableCell>
      <TableCell>
        <Switch
          checked={rule.isActive}
          onCheckedChange={(checked) => onToggle(rule.id, checked)}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(rule)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(rule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---- Main Table ----
interface RoutingRulesTableProps {
  rules: LeadRoutingRule[];
  agents: TeamAgent[];
  onRulesChange: (rules: LeadRoutingRule[]) => void;
}

export function RoutingRulesTable({ rules, agents, onRulesChange }: RoutingRulesTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeadRoutingRule | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);

  const conflictsMap = useMemo(() => detectConflicts(rules), [rules]);
  const hasConflicts = conflictsMap.size > 0;
  const conflictCount = new Set(
    Array.from(conflictsMap.values()).flatMap((c) => c.conflictsWith)
  ).size;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleHighlight = (ruleId: string) => {
    setHighlightedRuleId(ruleId);
    setTimeout(() => setHighlightedRuleId(null), 1500);
    // Scroll into view
    const el = document.querySelector(`[data-rule-id="${ruleId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rules.findIndex((r) => r.id === active.id);
      const newIndex = rules.findIndex((r) => r.id === over.id);
      const newRules = arrayMove(rules, oldIndex, newIndex);
      onRulesChange(newRules);
      toast.success('Prioridad actualizada');
    }
  };

  const handleToggle = (id: string, active: boolean) => {
    const newRules = rules.map((r) =>
      r.id === id ? { ...r, isActive: active } : r
    );
    onRulesChange(newRules);
    toast.success(active ? 'Regla activada' : 'Regla desactivada');
  };

  const handleEdit = (rule: LeadRoutingRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteRuleId) {
      const newRules = rules.filter((r) => r.id !== deleteRuleId);
      onRulesChange(newRules);
      setDeleteRuleId(null);
      toast.success('Regla eliminada');
    }
  };

  const handleSave = (ruleData: Omit<LeadRoutingRule, 'id'> & { id?: string }) => {
    if (ruleData.id) {
      const newRules = rules.map((r) =>
        r.id === ruleData.id ? { ...r, ...ruleData, id: r.id } : r
      );
      onRulesChange(newRules);
      toast.success('Regla actualizada');
    } else {
      const newRule: LeadRoutingRule = {
        ...ruleData,
        id: `rule-${Date.now()}`,
      };
      onRulesChange([...rules, newRule]);
      toast.success('Regla creada');
    }
    setEditingRule(null);
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setIsFormOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListFilter className="h-5 w-5" />
                Reglas de Ruteo Automático
              </CardTitle>
              <CardDescription>
                Los leads se asignan según estas reglas en orden de prioridad
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSimulatorOpen(true)}>
                <FlaskConical className="mr-2 h-4 w-4" />
                Probar Ruteo
              </Button>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Regla
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Conflict banner */}
          {hasConflicts && (
            <Alert className="mb-4 border-yellow-300 bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                {conflictsMap.size} regla{conflictsMap.size > 1 ? 's' : ''} tiene{conflictsMap.size > 1 ? 'n' : ''} criterios
                solapados. El orden de prioridad define cuál se aplica primero.
              </AlertDescription>
            </Alert>
          )}

          {rules.length === 0 ? (
            <div className="text-center py-12">
              <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aún no hay reglas</h3>
              <p className="text-muted-foreground mb-4">
                Los leads se distribuirán por peso porcentual hasta que crees reglas.
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primera regla
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Criterios</TableHead>
                    <TableHead>Asignar a</TableHead>
                    <TableHead className="w-[80px]">Activa</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={rules.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rules.map((rule, index) => (
                      <SortableRow
                        key={rule.id}
                        rule={rule}
                        index={index}
                        agents={agents}
                        conflict={conflictsMap.get(rule.id)}
                        highlightedRuleId={highlightedRuleId}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={setDeleteRuleId}
                        onHighlight={handleHighlight}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <RoutingRuleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rule={editingRule}
        teamAgents={agents}
        onSave={handleSave}
      />

      <RoutingSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        rules={rules}
        agents={agents}
      />

      <AlertDialog open={!!deleteRuleId} onOpenChange={() => setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar regla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los leads que coincidan con estos
              criterios se distribuirán según las demás reglas o por peso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
