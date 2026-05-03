import { useState, useMemo } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeadRoutingRule, LeadSource, PropertyType } from '@/types';
import { mockZones } from '@/data/mockData';

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

  const hasInput = Boolean(selectedZone || selectedSource || selectedType);

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

  const activeAgents = useMemo(() => agents.filter((a) => a.status === 'activo'), [agents]);
  const primaryMatch = matches[0];
  const secondaryMatches = matches.slice(1);
  const primaryAgents = primaryMatch ? getAgentNames(primaryMatch.rule.assignTo) : [];
  const primaryAgentNames = primaryAgents.map((agent) => agent.name).join(' y ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Probar ruteo
          </DialogTitle>
          <DialogDescription>
            Elige datos de ejemplo y confirma qué agente recibiría el lead.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <section className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-4 space-y-1">
              <p className="text-sm font-semibold">Lead de ejemplo</p>
              <p className="text-xs text-muted-foreground">
                Selecciona tres datos básicos del lead. No se guardará ningún cambio.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zona</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona" />
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
                <Label>Fuente del lead</Label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar fuente" />
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
                <Label>Tipo de propiedad</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
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

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <Button className="flex-1" onClick={handleSimulate} disabled={!hasInput}>
                  <Play className="mr-2 h-4 w-4" />
                  Probar asignación
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={!hasInput && !hasSimulated}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-4">
            <div className="mb-4 space-y-1">
              <p className="text-sm font-semibold">Resultado</p>
              <p className="text-xs text-muted-foreground">
                La respuesta se basa en las reglas activas actuales.
              </p>
            </div>

            {!hasSimulated ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed bg-muted/10 p-6 text-center">
                <p className="max-w-[260px] text-sm text-muted-foreground">
                  El resultado aparecerá aquí después de probar la asignación.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-1 space-y-4 duration-200">
                {primaryMatch ? (
                  <>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <div className="min-w-0 flex-1 space-y-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                              Este lead iría a:
                            </p>
                            <p className="mt-1 text-base font-semibold text-foreground">
                              {primaryAgentNames || 'Agente activo disponible'}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-sm text-muted-foreground">
                              Regla aplicada:{' '}
                              <span className="font-medium text-foreground">{primaryMatch.rule.name}</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {primaryMatch.matchedCriteria.map((criteria) => (
                                <Badge key={criteria} variant="outline" className="bg-background text-xs">
                                  {criteria}
                                </Badge>
                              ))}
                              <Badge variant="outline" className="bg-background text-xs">
                                Prioridad 1
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-1.5 border-t pt-3">
                            <p className="text-xs text-muted-foreground">
                              Distribución: {distributionLabels[primaryMatch.rule.distribution]}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {primaryAgents.map((agent) => (
                                <div
                                  key={agent.id}
                                  className="flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs"
                                >
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={agent.avatar} />
                                    <AvatarFallback className="text-[8px]">
                                      {agent.name.split(' ').map((namePart) => namePart[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{agent.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {secondaryMatches.length > 0 && (
                      <div className="rounded-lg border bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground">
                          También existen otras reglas compatibles, pero esta tiene mayor prioridad.
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {secondaryMatches.map((match, index) => (
                            <div
                              key={match.rule.id}
                              className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-2 py-1.5 text-xs"
                            >
                              <span className="truncate font-medium">{match.rule.name}</span>
                              <Badge variant="secondary" className="shrink-0 text-[10px]">
                                Prioridad {index + 2}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            No hay una regla exacta para este caso.
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            El sistema usaría la distribución general entre agentes activos.
                          </p>
                        </div>

                        <div className="space-y-2 border-t pt-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            Agentes activos considerados
                          </p>
                          <div className="space-y-1.5">
                            {activeAgents.map((agent) => (
                              <div key={agent.id} className="flex items-center gap-2 rounded-md bg-background/70 px-2 py-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={agent.avatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {agent.name.split(' ').map((namePart) => namePart[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate text-xs">{agent.name}</span>
                                {typeof agent.leadRoutingWeight === 'number' && (
                                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                                    {agent.leadRoutingWeight}%
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
