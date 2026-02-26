import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, CalendarCheck, Target, ExternalLink } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AgentPreviewData {
  id: string;
  name: string;
  avatar?: string;
  role: 'lider' | 'admin' | 'agente';
  status: 'activo' | 'pausado' | 'invitado';
  metrics?: {
    leadsReceived: number;
    responseRate: number;
    appointments: number;
    score: number;
  };
}

const roleLabels: Record<string, { label: string; color: string }> = {
  lider: { label: 'Líder', color: 'bg-yellow-100 text-yellow-800' },
  admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800' },
  agente: { label: 'Agente', color: 'bg-secondary text-secondary-foreground' },
};

const statusLabels: Record<string, { label: string; dotColor: string }> = {
  activo: { label: 'Activo', dotColor: 'bg-green-500' },
  pausado: { label: 'Pausado', dotColor: 'bg-yellow-500' },
  invitado: { label: 'Invitado', dotColor: 'bg-blue-500' },
};

interface AgentHoverPreviewProps {
  agent: AgentPreviewData;
  children: React.ReactNode;
}

export function AgentHoverPreview({ agent, children }: AgentHoverPreviewProps) {
  const navigate = useNavigate();
  const role = roleLabels[agent.role];
  const status = statusLabels[agent.status];

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-[280px] p-4" side="top" align="start">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={agent.avatar} />
            <AvatarFallback>
              {agent.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{agent.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={cn('text-xs', role.color)}>
                {role.label}
              </Badge>
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    status.dotColor,
                    agent.status === 'activo' && 'animate-pulse'
                  )}
                />
                <span className="text-xs text-muted-foreground">{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {agent.metrics && (
          <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{agent.metrics.leadsReceived}</p>
                <p className="text-[10px] text-muted-foreground">Leads</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{agent.metrics.responseRate}%</p>
                <p className="text-[10px] text-muted-foreground">Resp. rápida</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{agent.metrics.appointments}</p>
                <p className="text-[10px] text-muted-foreground">Citas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{agent.metrics.score}</p>
                <p className="text-[10px] text-muted-foreground">Score</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-2 text-xs"
          onClick={() => navigate(`/agents/team/member/${agent.id}`)}
        >
          Ver perfil completo
          <ExternalLink className="h-3 w-3" />
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
}
