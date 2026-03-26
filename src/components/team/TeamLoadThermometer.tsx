import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  buildTeamWorkloadMetrics,
  getTeamWorkloadToneClasses,
} from '@/lib/team/buildTeamWorkloadMetrics';

type ThermometerAgent = {
  id: string;
  activeLeads: number;
  leadLimit: number;
};

type Props = {
  agents: ThermometerAgent[];
  className?: string;
};

export function TeamLoadThermometer({ agents, className }: Props) {
  const metrics = buildTeamWorkloadMetrics(agents);
  const tone = getTeamWorkloadToneClasses(metrics.tone);

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
          <Badge className={tone.badgeClassName}>{metrics.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Severidad global</span>
            <span>{metrics.teamCapacityPct}%</span>
          </div>
          <div className={`h-2.5 w-full overflow-hidden rounded-full ${tone.trackClassName}`}>
            <div
              className={`h-full rounded-full transition-colors ${tone.barClassName}`}
              style={{ width: `${metrics.teamCapacityFillPct}%` }}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="text-[#2E3933]">
            Estado del equipo: <span className={`font-semibold ${tone.textClassName}`}>{metrics.status}</span>
          </p>
          <p className="text-[#2E3933]">
            Agentes sobrecargados: <span className="font-semibold">{metrics.overloadedAgentsCount}</span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {metrics.overloadedAgentsCount > 0
            ? 'Revisa Carga de Leads para reasignar.'
            : 'Equipo dentro de capacidad.'}
        </p>
      </CardContent>
    </Card>
  );
}
