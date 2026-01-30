import { motion } from 'framer-motion';
import { Bell, MessageSquare, UserPlus, Info, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNotificationStore, markAllRead, markRead, removeNotification, isQuietHoursNow } from '@/lib/agents/notifications/store';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { track } from '@/lib/analytics';

export default function AgentNotifications() {
  const { notifications, unread, quietHours } = useNotificationStore();
  const quietActive = isQuietHoursNow();

  const handleMarkAll = () => {
    markAllRead();
    track('notifications.prefs_saved', { properties: { action: 'mark_all_read' } });
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl mx-auto"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Notificaciones
            <Badge variant="secondary" className="rounded-full">{unread}</Badge>
          </h1>
          {quietHours.enabled && (
            <p className="text-xs text-muted-foreground">
              Quiet hours {quietHours.start}–{quietHours.end} {quietActive ? '(activas)' : ''}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAll} className="gap-2">
          <Check className="h-4 w-4" /> Marcar leídas
        </Button>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No tienes notificaciones nuevas.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "transition-all hover:bg-muted/50 cursor-pointer relative group",
                n.status === 'unread' && "border-l-4 border-l-primary bg-primary/5",
                n.silenced && "opacity-80"
              )}
              onClick={() => {
                if (n.status === 'unread') {
                  markRead(n.id);
                }
              }}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div className={cn("p-2 rounded-full shrink-0", n.status === 'unread' ? "bg-background shadow-sm" : "bg-muted")}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={cn("text-sm font-medium leading-none", n.status === 'unread' && "font-bold")}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {n.body}
                  </p>
                  <div className="flex gap-2">
                    {n.silenced && <Badge variant="outline">Silenciado</Badge>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'lead': return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'message': return <MessageSquare className="h-5 w-5 text-emerald-500" />;
    case 'system': return <Info className="h-5 w-5 text-amber-500" />;
    default: return <Bell className="h-5 w-5" />;
  }
}
