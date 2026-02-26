import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type TeamWorkloadAgent = {
  id: string;
  name: string;
  avatar?: string;
  activeLeads: number;
  leadLimit: number;
};

type Props = {
  teamName?: string;
  agents: TeamWorkloadAgent[];
  onMoreClick?: () => void;
  className?: string;
  mode?: "top" | "full";
  showTitle?: boolean;
  teamDefaultLeadLimit?: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

function firstName(name: string) {
  const [first] = name.trim().split(/\s+/);
  return first || name;
}

function toneByCapacity(pct: number) {
  if (pct >= 0.8) return { fg: "bg-amber-500", bg: "bg-amber-500/12" };
  if (pct >= 0.4) return { fg: "bg-green-500", bg: "bg-green-500/12" };
  return { fg: "bg-emerald-400/80", bg: "bg-emerald-500/10" };
}

export function TeamWorkloadSummary({
  teamName = "Equipo Polanco",
  agents,
  onMoreClick,
  className,
  mode = "top",
  showTitle = true,
  teamDefaultLeadLimit = 10,
}: Props) {
  const eligible = (agents ?? []).slice().sort((a, b) => b.activeLeads - a.activeLeads);
  if (eligible.length === 0) return null;

  const visible = mode === "full" ? eligible : eligible.slice(0, Math.min(3, eligible.length));
  const hasMore = mode === "top" && eligible.length > 3;
  const extraCount = Math.max(eligible.length - visible.length, 0);

  const totalLeads = eligible.reduce((sum, a) => sum + (a.activeLeads ?? 0), 0);

  return (
    <Card className={cn("mt-4", className)}>
      {showTitle && (
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Carga del {teamName}
            <span className="text-sm font-normal text-muted-foreground">
              ({totalLeads} leads totales)
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Leads activos en pipeline • Capacidad por agente (límite configurable)
          </p>
        </CardHeader>
      )}

      <CardContent className="pt-0 pb-4">
        <TooltipProvider>
          <div className="space-y-3">
            {visible.map((agent) => {
              const leads = agent.activeLeads ?? 0;
              const safeTeamDefault = teamDefaultLeadLimit > 0 ? teamDefaultLeadLimit : 10;
              const limit = Math.max(agent.leadLimit > 0 ? agent.leadLimit : safeTeamDefault, 1);
              const pct = Math.min(leads / limit, 1);
              const fillPct = Math.max(0, Math.min(100, pct * 100));
              const t = toneByCapacity(pct);
              const text = `${leads}/${limit}`;
              const showTextOnTrack = fillPct < 28;

              return (
                <Tooltip key={agent.id}>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/agents/team-v2/member/${agent.id}`}
                      className="grid grid-cols-[24px_96px_minmax(0,1fr)] items-center gap-3 group"
                    >
                      <Avatar className="h-6 w-6 shrink-0 group-hover:scale-110 transition-transform">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback className="text-[10px]">{initials(agent.name)}</AvatarFallback>
                      </Avatar>

                      <span className="text-sm w-24 truncate shrink-0">{firstName(agent.name)}</span>

                      <div className={`relative h-7 rounded-md ${t.bg} overflow-hidden`}>
                        <div
                          className={`h-full rounded-md ${t.fg} transition-all duration-500 ease-out`}
                          style={{ width: `${fillPct}%` }}
                        >
                          {!showTextOnTrack && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                              {text}
                            </span>
                          )}
                        </div>
                        {showTextOnTrack && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/80">
                            {text}
                          </span>
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {agent.name}: {leads} de {limit} leads
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {hasMore && (
              <div className="grid grid-cols-[24px_96px_minmax(0,1fr)] items-center gap-3 pt-1">
                <div className="h-6 w-6" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border text-[11px] font-semibold"
                      aria-label="Ver tabla de performance"
                      onClick={onMoreClick}
                    >
                      <span className="leading-none">
                        +{extraCount}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver tabla de performance</p>
                  </TooltipContent>
                </Tooltip>
                <div />
              </div>
            )}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
