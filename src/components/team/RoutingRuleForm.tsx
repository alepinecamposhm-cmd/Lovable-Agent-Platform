import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  UserCheck,
  Share2,
  Globe,
  Phone,
  MoreHorizontal,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ZoneMultiSelect } from './ZoneMultiSelect';
import { LeadRoutingRule, PropertyType, LeadSource } from '@/types';
import { mockZones } from '@/data/mockData';

const routingRuleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.priceMin && data.priceMax) {
    return data.priceMin < data.priceMax;
  }
  return true;
}, {
  message: 'El precio mínimo debe ser menor al máximo',
  path: ['priceMax'],
});

type FormData = z.infer<typeof routingRuleSchema>;

interface TeamAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'activo' | 'pausado' | 'invitado';
}

interface RoutingRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: LeadRoutingRule | null;
  teamAgents: TeamAgent[];
  onSave: (rule: Omit<LeadRoutingRule, 'id'> & { id?: string }) => void;
}

const leadSourceOptions: { value: LeadSource; label: string; icon: React.ReactNode }[] = [
  { value: 'portal', label: 'Portal', icon: <Building2 className="h-3.5 w-3.5" /> },
  { value: 'referido', label: 'Referido', icon: <UserCheck className="h-3.5 w-3.5" /> },
  { value: 'redes_sociales', label: 'Redes Sociales', icon: <Share2 className="h-3.5 w-3.5" /> },
  { value: 'sitio_web', label: 'Sitio Web', icon: <Globe className="h-3.5 w-3.5" /> },
  { value: 'llamada', label: 'Llamada', icon: <Phone className="h-3.5 w-3.5" /> },
  { value: 'otro', label: 'Otro', icon: <MoreHorizontal className="h-3.5 w-3.5" /> },
];

export function RoutingRuleForm({
  open,
  onOpenChange,
  rule,
  teamAgents,
  onSave,
}: RoutingRuleFormProps) {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>([]);
  const [selectedSources, setSelectedSources] = useState<LeadSource[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<'round_robin' | 'weighted' | 'random'>('round_robin');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(routingRuleSchema),
    defaultValues: {
      name: '',
      priceMin: undefined,
      priceMax: undefined,
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        priceMin: undefined,
        priceMax: undefined,
        isActive: rule.isActive,
      });
      setSelectedZones(rule.conditions.zone || []);
      setSelectedPropertyTypes(rule.conditions.propertyType || []);
      setSelectedSources(rule.conditions.source || []);
      setSelectedAgents(rule.assignTo);
      setDistribution(rule.distribution);
    } else {
      reset({
        name: '',
        priceMin: undefined,
        priceMax: undefined,
        isActive: true,
      });
      setSelectedZones([]);
      setSelectedPropertyTypes([]);
      setSelectedSources([]);
      setSelectedAgents([]);
      setDistribution('round_robin');
    }
  }, [rule, reset, open]);

  const onSubmit = (data: FormData) => {
    if (selectedZones.length === 0 && selectedPropertyTypes.length === 0 && selectedSources.length === 0) {
      return;
    }
    if (selectedAgents.length === 0) {
      return;
    }

    const ruleData: Omit<LeadRoutingRule, 'id'> & { id?: string } = {
      ...(rule?.id && { id: rule.id }),
      teamId: 'team-001',
      name: data.name,
      conditions: {
        zone: selectedZones.length > 0 ? selectedZones : undefined,
        propertyType: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
        source: selectedSources.length > 0 ? selectedSources : undefined,
      },
      assignTo: selectedAgents,
      distribution,
      isActive: data.isActive,
    };

    onSave(ruleData);
    onOpenChange(false);
  };

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const togglePropertyType = (type: PropertyType) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type]);
    }
  };

  const toggleSource = (source: LeadSource) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'casa', label: 'Casa' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'local', label: 'Local' },
    { value: 'bodega', label: 'Bodega' },
  ];

  const activeAgents = teamAgents.filter((a) => a.status === 'activo');
  const hasValidCriteria = selectedZones.length > 0 || selectedPropertyTypes.length > 0 || selectedSources.length > 0;
  const hasValidAgents = selectedAgents.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar Regla' : 'Crear Nueva Regla'}</DialogTitle>
          <DialogDescription>
            Define los criterios y agentes para esta regla de ruteo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la regla *</Label>
            <Input
              id="name"
              placeholder="Ej: Leads Polanco Premium"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Criteria Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Criterios (al menos uno requerido)</h4>
            
            {/* Zones */}
            <div className="space-y-2">
              <Label>Zonas</Label>
              <ZoneMultiSelect
                zones={mockZones}
                selectedZones={selectedZones}
                onSelectionChange={setSelectedZones}
                placeholder="Seleccionar zonas..."
              />
            </div>

            {/* Lead Sources */}
            <div className="space-y-2">
              <Label>Fuente del Lead</Label>
              <div className="flex flex-wrap gap-2">
                {leadSourceOptions.map((source) => (
                  <Button
                    key={source.value}
                    type="button"
                    variant={selectedSources.includes(source.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSource(source.value)}
                    className="gap-1.5"
                  >
                    {source.icon}
                    {source.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <Label>Tipos de Propiedad</Label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={selectedPropertyTypes.includes(type.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => togglePropertyType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {!hasValidCriteria && (
              <p className="text-sm text-muted-foreground">
                Selecciona al menos una zona, fuente o tipo de propiedad
              </p>
            )}
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Asignación *</h4>
            
            {/* Agents */}
            <div className="space-y-2">
              <Label>Agentes asignados</Label>
              <div className="flex flex-wrap gap-2">
                {activeAgents.map((agent) => (
                  <Button
                    key={agent.id}
                    type="button"
                    variant={selectedAgents.includes(agent.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleAgent(agent.id)}
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
              {!hasValidAgents && (
                <p className="text-sm text-muted-foreground">
                  Selecciona al menos un agente
                </p>
              )}
            </div>

            {/* Distribution */}
            <div className="space-y-2">
              <Label>Método de distribución</Label>
              <Select value={distribution} onValueChange={(v: 'round_robin' | 'weighted' | 'random') => setDistribution(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="weighted">Por peso</SelectItem>
                  <SelectItem value="random">Aleatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Regla activa</Label>
              <p className="text-sm text-muted-foreground">
                Solo las reglas activas se aplican al rutear leads
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!hasValidCriteria || !hasValidAgents}
            >
              {rule ? 'Guardar Cambios' : 'Crear Regla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
