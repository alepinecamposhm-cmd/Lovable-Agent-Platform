import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WorkloadIndicatorProps {
  agentLeads: number;
  leadLimit: number;
  teamDefaultLeadLimit?: number;
  isPaused: boolean;
}

export function WorkloadIndicator({
  agentLeads,
  leadLimit,
  teamDefaultLeadLimit,
  isPaused,
}: WorkloadIndicatorProps) {
  if (isPaused) {
    return (
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-muted" />
        <p className="text-xs text-muted-foreground">Sin asignación</p>
      </div>
    );
  }

  const safeTeamDefault = teamDefaultLeadLimit && teamDefaultLeadLimit > 0
    ? teamDefaultLeadLimit
    : 10;
  const safeLimit = leadLimit > 0 ? leadLimit : safeTeamDefault;
  const ratio = agentLeads / safeLimit;
  const percentage = Math.round(ratio * 100);
  const progressValue = Math.max(0, Math.min(percentage, 100));

  const getColor = () => {
    if (agentLeads === 0) return 'bg-sky-500';
    if (ratio >= 1) return 'bg-amber-500';
    if (ratio >= 0.8) return 'bg-amber-400';
    if (ratio >= 0.4) return 'bg-green-500';
    return 'bg-green-400';
  };

  const getTrackColor = () => {
    if (agentLeads === 0) return 'bg-sky-100';
    if (ratio >= 0.8) return 'bg-amber-100';
    if (ratio >= 0.4) return 'bg-green-100';
    return 'bg-green-50';
  };

  const getLabel = () => {
    if (agentLeads === 0) return 'Sin asignación';
    if (ratio >= 1) return 'Sobrecarga';
    if (ratio >= 0.8) return 'Carga alta';
    if (ratio >= 0.4) return 'Carga normal';
    return 'Carga baja';
  };

  const getLabelColor = () => {
    if (agentLeads === 0) return 'text-sky-600';
    if (ratio >= 1) return 'text-amber-600';
    if (ratio >= 0.8) return 'text-amber-600';
    if (ratio >= 0.4) return 'text-green-600';
    return 'text-green-600';
  };

  const showDots = () => {
    if (agentLeads === 0) return 'bg-sky-400';
    if (ratio >= 0.8) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1">
            <div className={cn('relative h-1.5 w-full rounded-full overflow-hidden', getTrackColor())}>
              <div
                className={cn('h-full rounded-full transition-all duration-700 ease-out', getColor())}
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className={cn('text-xs', getLabelColor())}>{getLabel()}</p>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    index < Math.max(0, Math.min(6, Math.round(ratio * 6))) ? showDots() : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{agentLeads}/{safeLimit} leads activos</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
