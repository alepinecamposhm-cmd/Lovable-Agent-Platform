import { useState, useMemo } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeadRoutingRule, LeadSource, PropertyType } from '@/types';
import { mockZones } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface TeamAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'activo' | 'pausado' | 'invitado';
  leadRoutingWeight?: number;
}

interface RoutingSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: LeadRoutingRule[];
  agents: TeamAgent[];
}

interface SimulationMatch {
  rule: LeadRoutingRule;
  matchedCriteria: string[];
}

const leadSourceOptions: { value: LeadSource; label: string }[] = [
  { value: 'portal', label: 'Portal' },
  { value: 'referido', label: 'Referido' },
  { value: 'redes_sociales', label: 'Redes Sociales' },
  { value: 'sitio_web', label: 'Sitio Web' },
  { value: 'llamada', label: 'Llamada' },
  { value: 'otro', label: 'Otro' },
];

const propertyTypeOptions: { value: PropertyType; label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'local', label: 'Local' },
  { value: 'bodega', label: 'Bodega' },
];

const distributionLabels: Record<string, string> = {
  round_robin: 'Round Robin',
  weighted: 'Por peso',
  random: 'Aleatorio',
};

function simulateRouting(
  zone: string | undefined,
  source: LeadSource | undefined,
  propertyType: PropertyType | undefined,
  rules: LeadRoutingRule[]
): SimulationMatch[] {
  const activeRules = rules.filter((r) => r.isActive);
  const matches: SimulationMatch[] = [];

  for (const rule of activeRules) {
    const matched: string[] = [];

    const zoneMatch =
      !rule.conditions.zone || rule.conditions.zone.length === 0 || (zone && rule.conditions.zone.includes(zone));
    const sourceMatch =
      !rule.conditions.source || rule.conditions.source.length === 0 || (source && rule.conditions.source.includes(source));
    const typeMatch =
      !rule.conditions.propertyType || rule.conditions.propertyType.length === 0 || (propertyType && rule.conditions.propertyType.includes(propertyType));

    // Rule matches if ALL defined conditions match
    const hasAnyCriteria =
      (rule.conditions.zone && rule.conditions.zone.length > 0) ||
      (rule.conditions.source && rule.conditions.source.length > 0) ||
      (rule.conditions.propertyType && rule.conditions.propertyType.length > 0);

    if (!hasAnyCriteria) continue;

    if (zoneMatch && sourceMatch && typeMatch) {
      if (zone && rule.conditions.zone?.includes(zone)) matched.push(`Zona: ${zone}`);
      if (source && rule.conditions.source?.includes(source))
        matched.push(`Fuente: ${leadSourceOptions.find((s) => s.value === source)?.label}`);
      if (propertyType && rule.conditions.propertyType?.includes(propertyType))
        matched.push(`Tipo: ${propertyTypeOptions.find((t) => t.value === propertyType)?.label}`);

      matches.push({ rule, matchedCriteria: matched.length > 0 ? matched : ['Criterios coinciden'] });
    }
  }

  return matches;
}

export function RoutingSimulator({ open, onOpenChange, rules, agents }: RoutingSimulatorProps) {
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [hasSimulated, setHasSimulated] = useState(false);
  const [matches, setMatches] = useState<SimulationMatch[]>([]);

  const hasInput = selectedZone || selectedSource || selectedType;

  const handleSimulate = () => {
    const result = simulateRouting(
      selectedZone || undefined,
      (selectedSource as LeadSource) || undefined,
      (selectedType as PropertyType) || undefined,
      rules
    );
    setMatches(result);
    setHasSimulated(true);
  };

  const handleClear = () => {
    setSelectedZone('');
    setSelectedSource('');
    setSelectedType('');
    setMatches([]);
    setHasSimulated(false);
  };

  const getAgentNames = (agentIds: string[]) => {
    return agentIds
      .map((id) => agents.find((a) => a.id === id))
      .filter(Boolean) as TeamAgent[];
  };

  const activeAgents = agents.filter((a) => a.status === 'activo');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Simular Ruteo de Lead
          </SheetTitle>
          <SheetDescription>
            Prueba tus reglas con un lead simulado para validar la asignación.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zona</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona..." />
                </SelectTrigger>
                <SelectContent>
                  {mockZones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fuente del Lead</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente..." />
                </SelectTrigger>
                <SelectContent>
                  {leadSourceOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Propiedad</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleSimulate}
              disabled={!hasInput}
            >
              <Play className="mr-2 h-4 w-4" />
              Simular
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={!hasInput && !hasSimulated}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {/* Results */}
          {hasSimulated && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {matches.length === 0 ? (
                /* No match - fallback to weights */
                <Card className="border-yellow-300 bg-yellow-50/50">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-yellow-800">
                          Ninguna regla aplica
                        </p>
                        <p className="text-xs text-yellow-700">
                          Se usará distribución por peso porcentual:
                        </p>
                        <div className="space-y-1.5 mt-2">
                          {activeAgents.map((agent) => (
                            <div key={agent.id} className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={agent.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {agent.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{agent.name}</span>
                              <span className="text-xs font-bold ml-auto">
                                {agent.leadRoutingWeight || 0}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {matches.map((match, index) => {
                    const matchAgents = getAgentNames(match.rule.assignTo);
                    const isPrimary = index === 0;

                    return (
                      <Card
                        key={match.rule.id}
                        className={cn(
                          'transition-all duration-300',
                          isPrimary
                            ? 'border-green-300 bg-green-50/50'
                            : 'border-muted bg-muted/30 opacity-70'
                        )}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-start gap-3">
                            {isPrimary ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  {match.rule.name}
                                </span>
                                <Badge
                                  variant={isPrimary ? 'default' : 'secondary'}
                                  className="text-[10px]"
                                >
                                  {isPrimary
                                    ? `Prioridad ${index + 1}`
                                    : 'También coincide'}
                                </Badge>
                              </div>

                              {/* Matched criteria */}
                              <div className="flex flex-wrap gap-1">
                                {match.matchedCriteria.map((c) => (
                                  <Badge
                                    key={c}
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {c}
                                  </Badge>
                                ))}
                              </div>

                              {/* Assigned agents */}
                              <div className="space-y-1.5 pt-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Asignado a ({distributionLabels[match.rule.distribution]})
                                </p>
                                {matchAgents.map((agent) => (
                                  <div key={agent.id} className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={agent.avatar} />
                                      <AvatarFallback className="text-[8px]">
                                        {agent.name.split(' ').map((n) => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{agent.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
