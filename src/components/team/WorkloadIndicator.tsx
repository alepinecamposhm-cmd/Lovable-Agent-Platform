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
  teamAverage: number;
  isPaused: boolean;
}

export function WorkloadIndicator({ agentLeads, teamAverage, isPaused }: WorkloadIndicatorProps) {
  if (isPaused) {
    return (
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-muted" />
        <p className="text-xs text-muted-foreground">Sin asignación</p>
      </div>
    );
  }

  const safeDivisor = teamAverage > 0 ? teamAverage : 1;
  const percentage = Math.round((agentLeads / safeDivisor) * 100);
  const capped = Math.min(percentage, 200);
  const progressValue = Math.min(capped, 100);

  const getColor = () => {
    if (percentage > 150) return 'bg-destructive';
    if (percentage > 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (percentage > 150) return 'Sobrecarga';
    if (percentage > 100) return 'Carga alta';
    if (percentage >= 50) return 'Carga normal';
    return 'Carga baja';
  };

  const getLabelColor = () => {
    if (percentage > 150) return 'text-destructive';
    if (percentage > 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1">
            <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700 ease-out', getColor())}
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className={cn('text-xs', getLabelColor())}>{getLabel()}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{agentLeads} leads activos (promedio equipo: {Math.round(teamAverage)})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
