import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, UserPlus, Info, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'lead' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'lead', title: 'Nuevo Lead Asignado', description: 'Roberto Gómez está interesado en "Departamento Condesa".', time: 'Hace 5 min', read: false },
  { id: '2', type: 'message', title: 'Mensaje de Sarah', description: '¿Podemos reagendar la visita de mañana?', time: 'Hace 30 min', read: false },
  { id: '3', type: 'system', title: 'Meta Alcanzada', description: '¡Felicidades! Has completado 5 tareas hoy.', time: 'Hace 2 h', read: true },
  { id: '4', type: 'system', title: 'Mantenimiento Programado', description: 'La plataforma se actualizará el domingo a las 3 AM.', time: 'Hace 1 día', read: true },
];

export default function AgentNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.info("Todas las notificaciones marcadas como leídas");
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lead': return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-emerald-500" />;
      case 'system': return <Info className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
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
            <Badge variant="secondary" className="rounded-full">{notifications.filter(n => !n.read).length}</Badge>
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
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
                !n.read && "border-l-4 border-l-primary bg-primary/5"
              )}
              onClick={() => {
                if (!n.read) setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
              }}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div className={cn("p-2 rounded-full shrink-0", !n.read ? "bg-background shadow-sm" : "bg-muted")}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={cn("text-sm font-medium leading-none", !n.read && "font-bold")}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {n.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity"
                  onClick={(e) => deleteNotification(n.id, e)}
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
