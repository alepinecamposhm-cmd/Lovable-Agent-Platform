import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  X,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LeadRoutingRule } from '@/types';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  ctaLabel: string;
  onAction: () => void;
}

interface TeamOnboardingChecklistProps {
  agentCount: number;
  teamName: string;
  defaultTeamName: string;
  hasCustomWeights: boolean;
  routingRulesCount: number;
  hasVisitedPerformance: boolean;
  onInvite: () => void;
  onSettings: () => void;
  onGoToRouting: () => void;
  onGoToPerformance: () => void;
}

const DISMISS_KEY = 'team_onboarding_dismissed';

export function TeamOnboardingChecklist({
  agentCount,
  teamName,
  defaultTeamName,
  hasCustomWeights,
  routingRulesCount,
  hasVisitedPerformance,
  onInvite,
  onSettings,
  onGoToRouting,
  onGoToPerformance,
}: TeamOnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  });
  const [showComplete, setShowComplete] = useState(false);

  const steps: OnboardingStep[] = useMemo(
    () => [
      {
        id: 'invite',
        title: 'Invitar tu primer agente',
        description: 'Agrega al menos un miembro al equipo',
        completed: agentCount > 1,
        ctaLabel: 'Invitar',
        onAction: onInvite,
      },
      {
        id: 'name',
        title: 'Personalizar nombre del equipo',
        description: 'Dale un nombre único a tu equipo',
        completed: teamName !== defaultTeamName,
        ctaLabel: 'Configurar',
        onAction: onSettings,
      },
      {
        id: 'weights',
        title: 'Ajustar pesos de distribución',
        description: 'Define cuántos leads recibe cada agente',
        completed: hasCustomWeights,
        ctaLabel: 'Configurar',
        onAction: onGoToRouting,
      },
      {
        id: 'rules',
        title: 'Crear tu primera regla de ruteo',
        description: 'Asigna leads automáticamente por zona o tipo',
        completed: routingRulesCount > 0,
        ctaLabel: 'Crear regla',
        onAction: onGoToRouting,
      },
      {
        id: 'performance',
        title: 'Revisar métricas del equipo',
        description: 'Consulta el rendimiento de cada agente',
        completed: hasVisitedPerformance,
        ctaLabel: 'Ver métricas',
        onAction: onGoToPerformance,
      },
    ],
    [agentCount, teamName, defaultTeamName, hasCustomWeights, routingRulesCount, hasVisitedPerformance, onInvite, onSettings, onGoToRouting, onGoToPerformance]
  );

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const allCompleted = completedCount === totalSteps;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  useEffect(() => {
    if (allCompleted && !showComplete) {
      setShowComplete(true);
      const timer = setTimeout(() => {
        setIsDismissed(true);
        localStorage.setItem(DISMISS_KEY, 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, showComplete]);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (showComplete && allCompleted) {
    return (
      <Card className="border-l-4 border-l-primary animate-in fade-in slide-in-from-top-2 duration-300">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <PartyPopper className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">¡Equipo listo!</p>
              <p className="text-sm text-muted-foreground">
                Tu equipo está completamente configurado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary animate-in fade-in slide-in-from-top-2 duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Configura tu Equipo</span>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalSteps} pasos
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDismiss}
            aria-label="Cerrar guía de configuración"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress
          value={progressPercent}
          className="h-2 mt-2"
        />
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-3 py-2 px-2 rounded-md transition-colors',
              step.completed ? 'opacity-60' : 'hover:bg-muted/50'
            )}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.completed && 'line-through'
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.completed && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1 text-xs"
                onClick={step.onAction}
              >
                {step.ctaLabel}
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
