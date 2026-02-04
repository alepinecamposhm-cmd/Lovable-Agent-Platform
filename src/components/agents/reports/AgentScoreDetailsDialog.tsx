import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { track } from '@/lib/agents/reports/analytics';
import type { AgentScoreResult } from '@/lib/agents/reports/agentScore';
import type { ReportsPeriod } from '@/lib/agents/reports/period';
import { useMemo, type ReactNode } from 'react';

export function AgentScoreDetailsDialog({
  result,
  period,
  trigger,
}: {
  result: AgentScoreResult;
  period: ReportsPeriod;
  trigger: ReactNode;
}) {
  const tips = useMemo(() => {
    const out: string[] = [];
    if (result.breakdown.response < 80) out.push('Responde lo antes posible: objetivo <5m para mejorar tu answer rate.');
    if (result.breakdown.performance < 30) out.push('Refuerza seguimiento para convertir leads en citas.');
    if (result.breakdown.operational < 80) out.push('Completa tu perfil: aumenta confianza y ayuda a mejorar conversión.');
    if (out.length === 0) out.push('Mantén consistencia: pequeñas mejoras semana a semana sostienen el score.');
    return out.slice(0, 3);
  }, [result.breakdown.operational, result.breakdown.performance, result.breakdown.response]);

  return (
    <Dialog
      onOpenChange={(open) => {
        track(open ? 'reports.score_detail_opened' : 'reports.score_detail_closed', {
          period,
          score: result.score,
        });
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>Agent Health Score</span>
            <Badge variant="secondary" className="gap-2">
              <span className="text-base font-semibold">{result.score}</span>
              <span className="text-xs text-muted-foreground">{result.label}</span>
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Basado en señales internas (sin encuestas externas por ahora). Es una guía para mejorar, no una calificación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <ScoreRow label="Respuesta (40%)" value={result.breakdown.response} />
            <ScoreRow label="Performance (30%)" value={result.breakdown.performance} />
            <ScoreRow label="Operacional (30%)" value={result.breakdown.operational} />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium">Cómo mejorar</p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {tips.map((t) => (
                <p key={t}>• {t}</p>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Definición en este MVP: el score combina answer rate &lt;5m, conversión a cita y perfil completado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
