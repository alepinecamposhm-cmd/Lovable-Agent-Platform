import { useState } from 'react';
import { ArrowLeftRight, GitCompareArrows, Trophy } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AgentMetrics {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leadsReceived: number;
  respondedUnder5Min: number;
  appointmentsScheduled: number;
  conversions: number;
  score: number;
}

interface AgentComparisonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AgentMetrics[];
}

interface MetricRow {
  label: string;
  keyA: keyof AgentMetrics;
  suffix?: string;
}

const METRICS: MetricRow[] = [
  { label: 'Leads Recibidos', keyA: 'leadsReceived' },
  { label: 'Resp. <5min', keyA: 'respondedUnder5Min' },
  { label: 'Citas', keyA: 'appointmentsScheduled' },
  { label: 'Conversiones', keyA: 'conversions' },
  { label: 'Score', keyA: 'score' },
];

export function AgentComparisonSheet({ open, onOpenChange, agents }: AgentComparisonSheetProps) {
  const [agentAId, setAgentAId] = useState<string>('');
  const [agentBId, setAgentBId] = useState<string>('');

  const agentA = agents.find((a) => a.id === agentAId);
  const agentB = agents.find((a) => a.id === agentBId);

  const swap = () => {
    setAgentAId(agentBId);
    setAgentBId(agentAId);
  };

  const getMax = (key: keyof AgentMetrics) => {
    if (!agentA || !agentB) return 1;
    const a = agentA[key] as number;
    const b = agentB[key] as number;
    return Math.max(a, b, 1);
  };

  const getWinner = (key: keyof AgentMetrics): 'a' | 'b' | 'tie' => {
    if (!agentA || !agentB) return 'tie';
    const a = agentA[key] as number;
    const b = agentB[key] as number;
    if (a > b) return 'a';
    if (b > a) return 'b';
    return 'tie';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5" />
            Comparar Agentes
          </SheetTitle>
          <SheetDescription>
            Selecciona dos agentes para comparar sus métricas lado a lado
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Selectors */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Agente A</label>
              <Select value={agentAId} onValueChange={setAgentAId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((a) => a.id !== agentBId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={swap}
              disabled={!agentAId || !agentBId}
              className="mb-0.5"
              aria-label="Invertir agentes"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Agente B</label>
              <Select value={agentBId} onValueChange={setAgentBId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((a) => a.id !== agentAId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agent Headers */}
          {(agentA || agentB) && (
            <div className="grid grid-cols-2 gap-4">
              {agentA ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={agentA.avatar} />
                    <AvatarFallback>{agentA.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{agentA.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{agentA.email}</p>
                  </div>
                </div>
              ) : (
                <div className="h-10 flex items-center text-sm text-muted-foreground">Selecciona agente</div>
              )}
              {agentB ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={agentB.avatar} />
                    <AvatarFallback>{agentB.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{agentB.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{agentB.email}</p>
                  </div>
                </div>
              ) : (
                <div className="h-10 flex items-center text-sm text-muted-foreground">Selecciona agente</div>
              )}
            </div>
          )}

          {/* Metrics comparison */}
          {agentA && agentB && (
            <div className="space-y-4">
              {METRICS.map((metric) => {
                const valA = agentA[metric.keyA] as number;
                const valB = agentB[metric.keyA] as number;
                const max = getMax(metric.keyA);
                const winner = getWinner(metric.keyA);

                return (
                  <div key={metric.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-sm font-medium tabular-nums',
                          winner === 'a' ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {valA}
                        {winner === 'a' && <Trophy className="inline ml-1 h-3 w-3" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                      <span
                        className={cn(
                          'text-sm font-medium tabular-nums',
                          winner === 'b' ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {winner === 'b' && <Trophy className="inline mr-1 h-3 w-3" />}
                        {valB}
                      </span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="flex-1 flex justify-end">
                        <div
                          className={cn(
                            'h-full rounded-l-full transition-all duration-500',
                            winner === 'a' ? 'bg-primary' : 'bg-muted-foreground/30'
                          )}
                          style={{ width: `${(valA / max) * 100}%` }}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={cn(
                            'h-full rounded-r-full transition-all duration-500',
                            winner === 'b' ? 'bg-primary' : 'bg-muted-foreground/30'
                          )}
                          style={{ width: `${(valB / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {METRICS.filter((m) => getWinner(m.keyA) === 'a').length} métricas ganadas
                  </span>
                  <span>
                    {METRICS.filter((m) => getWinner(m.keyA) === 'b').length} métricas ganadas
                  </span>
                </div>
              </div>
            </div>
          )}

          {!agentA && !agentB && (
            <div className="text-center py-8 text-muted-foreground">
              <GitCompareArrows className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Selecciona dos agentes para comparar sus métricas</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
