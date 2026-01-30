import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Filter, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  list,
  markAllRead,
  markRead,
  NotificationType,
  useNotificationStore,
} from '@/lib/agents/notifications/store';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const typeLabels: Record<NotificationType, string> = {
  lead: 'Leads',
  message: 'Mensajes',
  appointment: 'Citas',
  task: 'Tareas',
  listing: 'Listings',
  credit: 'Créditos',
  system: 'Sistema',
};

export default function AgentNotifications() {
  const { notifications, unread } = useNotificationStore();
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  const feed = useMemo(() => {
    return list().filter((n) => {
      const typeOk = typeFilter === 'all' || n.type === typeFilter;
      const statusOk = statusFilter === 'all' || n.status === statusFilter;
      return typeOk && statusOk;
    });
  }, [typeFilter, statusFilter]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
            <p className="text-muted-foreground text-sm">Centro de alertas (leads, mensajes, citas, listings, créditos).</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllRead()} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Marcar todas
          </Button>
          <Badge variant="secondary" className="text-xs">{unread} sin leer</Badge>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filtros
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTypeFilter('all')}
            >
              Todos
            </Badge>
            {Object.entries(typeLabels).map(([key, label]) => (
              <Badge
                key={key}
                variant={typeFilter === key ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTypeFilter(key as NotificationType)}
              >
                {label}
              </Badge>
            ))}
            <Separator orientation="vertical" className="h-6" />
            <Badge
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStatusFilter('all')}
            >
              Todos
            </Badge>
            <Badge
              variant={statusFilter === 'unread' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStatusFilter('unread')}
            >
              Sin leer
            </Badge>
            <Badge
              variant={statusFilter === 'read' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStatusFilter('read')}
            >
              Leídas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {feed.length === 0 && (
            <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <p>No hay notificaciones para estos filtros.</p>
            </div>
          )}
          {feed.map((n) => (
            <motion.div
              key={n.id}
              variants={staggerItem}
              className={cn(
                'flex items-start gap-3 py-3 cursor-pointer group',
                n.status === 'unread' && 'bg-primary/5 rounded-lg px-3 -mx-3'
              )}
              onClick={() => markRead(n.id)}
            >
              <Badge variant="secondary" className="mt-1 capitalize">
                {typeLabels[n.type] || n.type}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm leading-tight">{n.title}</p>
                  {n.status === 'unread' && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: es })}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                Marcar leída
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
