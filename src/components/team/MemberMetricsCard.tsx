import { TrendingUp, Users, CalendarCheck, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MemberMetricsCardProps {
  leadsReceived: number;
  responseRate: number;
  appointmentsScheduled: number;
  conversions: number;
}

export function MemberMetricsCard({
  leadsReceived,
  responseRate,
  appointmentsScheduled,
  conversions,
}: MemberMetricsCardProps) {
  const getResponseRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const metrics = [
    {
      label: 'Leads Recibidos',
      value: leadsReceived,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Resp. < 5 min',
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: getResponseRateColor(responseRate),
      bgColor: responseRate >= 90 ? 'bg-green-50' : responseRate >= 70 ? 'bg-yellow-50' : 'bg-red-50',
    },
    {
      label: 'Citas Agendadas',
      value: appointmentsScheduled,
      icon: CalendarCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Conversiones',
      value: conversions,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Métricas del Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center p-4 rounded-lg bg-muted/50">
              <div
                className={cn(
                  'mx-auto h-10 w-10 rounded-full flex items-center justify-center mb-2',
                  metric.bgColor
                )}
              >
                <metric.icon className={cn('h-5 w-5', metric.color)} />
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
