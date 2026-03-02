import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ThermometerAgent = {
  id: string;
  activeLeads: number;
  leadLimit: number;
};

type Props = {
  agents: ThermometerAgent[];
  className?: string;
};

function resolveState(maxMemberRatio: number) {
  if (maxMemberRatio >= 1) {
    return {
      label: 'Sobrecarga detectada',
      badgeClassName: 'border-amber-300 bg-amber-100 text-amber-900',
      barClassName: 'bg-[#BFA46A]',
    };
  }

  if (maxMemberRatio >= 0.85) {
    return {
      label: 'Cerca del límite',
      badgeClassName: 'border-[#BFA46A]/50 bg-[#BFA46A]/15 text-[#7A6641]',
      barClassName: 'bg-[#BFA46A]',
    };
  }

  return {
    label: 'OK',
    badgeClassName: 'border-[#234B3B]/35 bg-[#234B3B]/10 text-[#234B3B]',
    barClassName: 'bg-[#234B3B]',
  };
}

export function TeamLoadThermometer({ agents, className }: Props) {
  const safeAgents = agents ?? [];
  const ratios = safeAgents.map((agent) => {
    const capacity = agent.leadLimit > 0 ? agent.leadLimit : 0;
    if (capacity === 0) return 0;
    return agent.activeLeads / capacity;
  });

  const maxMemberRatio = ratios.length > 0 ? Math.max(...ratios) : 0;
  const overloadedCount = ratios.filter((ratio) => ratio >= 1).length;
  const atRiskCount = ratios.filter((ratio) => ratio >= 0.85 && ratio < 1).length;
  const totalActiveLeads = safeAgents.reduce((sum, agent) => sum + agent.activeLeads, 0);
  const totalCapacity = safeAgents.reduce(
    (sum, agent) => sum + (agent.leadLimit > 0 ? agent.leadLimit : 0),
    0
  );
  const teamRatio = totalCapacity > 0 ? totalActiveLeads / totalCapacity : 0;

  const state = resolveState(maxMemberRatio);
  const teamRatioPct = Math.min(100, Math.max(0, Math.round(teamRatio * 100)));

  return (
    <Card
      className={className}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-[#1F2A25]">
            Termómetro de Carga del Equipo
          </CardTitle>
          <Badge className={state.badgeClassName}>{state.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Severidad global</span>
            <span>{teamRatioPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F2EEE5]">
            <div
              className={`h-full rounded-full transition-colors ${state.barClassName}`}
              style={{ width: `${teamRatioPct}%` }}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="text-[#2E3933]">
            Agentes sobrecargados: <span className="font-semibold">{overloadedCount}</span>
          </p>
          <p className="text-[#2E3933]">
            Agentes en riesgo: <span className="font-semibold">{atRiskCount}</span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {overloadedCount > 0
            ? 'Revisa Carga de Leads para reasignar.'
            : 'Equipo dentro de capacidad.'}
        </p>
      </CardContent>
    </Card>
  );
}

