import { Link } from "react-router-dom";
import { BarChart3, Plus } from "lucide-react";

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
};

type Props = {
  teamName?: string;
  agents: TeamWorkloadAgent[];
  onMoreClick?: () => void;
  className?: string;
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

function toneByRank(rank: number) {
  if (rank === 0) return { fg: "bg-amber-500", bg: "bg-amber-500/15" };
  if (rank === 1) return { fg: "bg-green-500", bg: "bg-green-500/10" };
  return { fg: "bg-emerald-500/40", bg: "bg-emerald-500/10" };
}

export function TeamWorkloadSummary({
  teamName = "Equipo Polanco",
  agents,
  onMoreClick,
  className,
}: Props) {
  const eligible = (agents ?? []).slice().sort((a, b) => b.activeLeads - a.activeLeads);
  if (eligible.length === 0) return null;

  const visible = eligible.slice(0, Math.min(3, eligible.length));
  const hasMore = eligible.length > 3;

  const totalLeads = eligible.reduce((sum, a) => sum + (a.activeLeads ?? 0), 0);
  const maxLeads = Math.max(...eligible.map((a) => a.activeLeads ?? 0), 1);

  return (
    <Card className={cn("mt-4", className)}>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Carga del {teamName}
          <span className="text-sm font-normal text-muted-foreground">
            ({totalLeads} leads totales)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <TooltipProvider>
          <div className="space-y-3">
            {visible.map((agent, idx) => {
              const leads = agent.activeLeads ?? 0;
              const widthRaw = (leads / maxLeads) * 90;
              const widthPct = Math.max(8, Math.min(90, widthRaw));
              const t = toneByRank(idx);

              return (
                <Tooltip key={agent.id}>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/agents/team-v2/member/${agent.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar className="h-6 w-6 shrink-0 group-hover:scale-110 transition-transform">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback className="text-[10px]">{initials(agent.name)}</AvatarFallback>
                      </Avatar>

                      <span className="text-sm w-24 truncate shrink-0">{firstName(agent.name)}</span>

                      <div className={`flex-1 h-7 rounded-md ${t.bg} overflow-hidden`}>
                        <div
                          className={`h-full rounded-md ${t.fg} flex items-center justify-end pr-2 transition-all duration-500 ease-out`}
                          style={{ width: `${widthPct}%` }}
                        >
                          <span className="text-xs font-medium text-white">{leads}</span>
                        </div>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {agent.name}: {leads} leads
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {hasMore && (
              <div className="flex justify-center pt-1">
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
                        +{eligible.length - visible.length}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver tabla de performance</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
