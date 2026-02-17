import { useState, useMemo } from 'react';
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
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TeamActivityEvent, TeamActivityEventType } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TeamActivityLogProps {
  activities: TeamActivityEvent[];
}

const eventConfig: Record<
  TeamActivityEventType,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  invitation_sent: {
    icon: <Mail className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  invitation_accepted: {
    icon: <UserCheck className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  role_changed: {
    icon: <RefreshCw className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  member_paused: {
    icon: <Pause className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  member_activated: {
    icon: <Play className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  member_removed: {
    icon: <Trash2 className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  leads_reassigned: {
    icon: <ArrowLeftRight className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  leadership_transferred: {
    icon: <Crown className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
};

type FilterValue = 'all' | 'invitations' | 'roles' | 'status' | 'removals' | 'reassignments' | 'leadership';

const filterOptions: { value: FilterValue; label: string; types: TeamActivityEventType[] }[] = [
  { value: 'all', label: 'Todos', types: [] },
  { value: 'invitations', label: 'Invitaciones', types: ['invitation_sent', 'invitation_accepted'] },
  { value: 'roles', label: 'Cambios de Rol', types: ['role_changed'] },
  { value: 'status', label: 'Pausas/Activaciones', types: ['member_paused', 'member_activated'] },
  { value: 'removals', label: 'Remociones', types: ['member_removed'] },
  { value: 'reassignments', label: 'Reasignaciones', types: ['leads_reassigned'] },
  { value: 'leadership', label: 'Liderazgo', types: ['leadership_transferred'] },
];

const eventTypeLabels: Record<TeamActivityEventType, string> = {
  invitation_sent: 'Invitación enviada',
  invitation_accepted: 'Invitación aceptada',
  role_changed: 'Cambio de rol',
  member_paused: 'Miembro pausado',
  member_activated: 'Miembro activado',
  member_removed: 'Miembro removido',
  leads_reassigned: 'Leads reasignados',
  leadership_transferred: 'Liderazgo transferido',
};

export function TeamActivityLog({ activities }: TeamActivityLogProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('all');

  const filteredActivities = useMemo(() => {
    const sorted = [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (selectedFilter === 'all') return sorted;
    const filterConfig = filterOptions.find((f) => f.value === selectedFilter);
    if (!filterConfig) return sorted;
    return sorted.filter((a) => filterConfig.types.includes(a.type));
  }, [activities, selectedFilter]);

  const handleExportCSV = () => {
    if (filteredActivities.length === 0) return;

    const headers = ['Fecha', 'Tipo', 'Descripción', 'Detalles', 'Realizado por'];
    const rows = filteredActivities.map((a) => [
      format(new Date(a.timestamp), 'dd/MM/yyyy HH:mm', { locale: es }),
      eventTypeLabels[a.type],
      a.description,
      a.details || '',
      a.actorName,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `actividad_equipo_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Historial exportado correctamente');
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No hay actividad registrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Las acciones del equipo aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Historial de Actividad
            </CardTitle>
            <CardDescription>
              {filteredActivities.length} evento{filteredActivities.length !== 1 ? 's' : ''}
              {selectedFilter !== 'all' && ' (filtrado)'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as FilterValue)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredActivities.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No hay eventos de tipo "{filterOptions.find((f) => f.value === selectedFilter)?.label}"
            </p>
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => setSelectedFilter('all')}
            >
              Ver todos
            </Button>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            {filteredActivities.map((activity, index) => {
              const config = eventConfig[activity.type];
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'relative flex gap-4 py-4 hover:bg-muted/50 rounded-lg transition-colors',
                    index < filteredActivities.length - 1 && 'border-b border-border/50'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                      config.bgColor,
                      config.color
                    )}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {activity.details}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>

                    {/* Actor */}
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.actorAvatar} />
                        <AvatarFallback className="text-[10px]">
                          {activity.actorName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.actorName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
