import { useMemo } from 'react';
import {
  Mail,
  UserCheck,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  ArrowLeftRight,
  Crown,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TeamActivityEvent, TeamActivityEventType } from '@/types';
import { cn } from '@/lib/utils';

interface MemberActivityTimelineProps {
  activities: TeamActivityEvent[];
  memberId: string;
  onViewAll?: () => void;
  maxItems?: number;
}

const eventConfig: Record<
  TeamActivityEventType,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  invitation_sent: {
    icon: <Mail className="h-3.5 w-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  invitation_accepted: {
    icon: <UserCheck className="h-3.5 w-3.5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  role_changed: {
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  member_paused: {
    icon: <Pause className="h-3.5 w-3.5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  member_activated: {
    icon: <Play className="h-3.5 w-3.5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  member_removed: {
    icon: <Trash2 className="h-3.5 w-3.5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  leads_reassigned: {
    icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  leadership_transferred: {
    icon: <Crown className="h-3.5 w-3.5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
};

export function MemberActivityTimeline({
  activities,
  memberId,
  onViewAll,
  maxItems = 10,
}: MemberActivityTimelineProps) {
  const memberActivities = useMemo(() => {
    return activities
      .filter((a) => a.actorId === memberId || a.targetId === memberId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems);
  }, [activities, memberId, maxItems]);

  if (memberActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mx-auto mb-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No hay actividad registrada para este miembro
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
              Ver todo
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          <div className="absolute left-[13px] top-0 bottom-0 w-px bg-border" />

          {memberActivities.map((activity, index) => {
            const config = eventConfig[activity.type];
            return (
              <div
                key={activity.id}
                className={cn(
                  'relative flex gap-3 py-2.5 hover:bg-muted/50 rounded-md transition-colors px-1',
                  index < memberActivities.length - 1 && 'border-b border-border/30'
                )}
              >
                <div
                  className={cn(
                    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0',
                    config.bgColor,
                    config.color
                  )}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-tight">{activity.description}</p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
