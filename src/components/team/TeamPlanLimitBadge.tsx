import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TeamPlanLimitBadgeProps {
  currentCount: number;
  maxCount: number;
}

export function TeamPlanLimitBadge({ currentCount, maxCount }: TeamPlanLimitBadgeProps) {
  const percentage = Math.round((currentCount / maxCount) * 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="space-y-1.5 mt-2">
            <Progress
              value={percentage}
              className={cn(
                'h-1.5 transition-all duration-700',
                isAtLimit && '[&>div]:bg-destructive',
                isWarning && '[&>div]:bg-yellow-500'
              )}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentCount} de {maxCount} miembros
              </span>
              {isAtLimit && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                  <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                  Límite
                </Badge>
              )}
            </div>
            {isAtLimit && (
              <Link
                to="/agents/credits"
                className="text-[10px] text-primary hover:underline"
              >
                Mejorar plan →
              </Link>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {isAtLimit
              ? 'Has alcanzado el límite de miembros de tu plan. Mejora tu plan para invitar más agentes.'
              : isWarning
                ? `Estás cerca del límite (${currentCount}/${maxCount}). Considera mejorar tu plan.`
                : `Puedes invitar hasta ${maxCount - currentCount} miembros más.`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
