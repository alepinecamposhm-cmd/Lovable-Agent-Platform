import { Bell, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  markAllRead,
  markRead,
  useNotificationStore,
  isQuietHoursNow,
} from '@/lib/agents/notifications/store';
import { useNavigate } from 'react-router-dom';

interface AgentTopbarProps {
  onOpenCommand: () => void;
}

export function AgentTopbar({ onOpenCommand }: AgentTopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unread, quietHours } = useNotificationStore();
  const quietLabel = useMemo(() => {
    if (!quietHours.enabled) return 'Notificaciones activas';
    return `Silenciado ${quietHours.start}–${quietHours.end}`;
  }, [quietHours]);

  useHotkeys(['mod+k', 'k'], (e) => {
    e.preventDefault();
    onOpenCommand();
  });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />
        
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground gap-2 h-9"
            onClick={onOpenCommand}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden md:inline-flex ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                      {unread > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1.05 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                          className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground"
                        >
                          {unread}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isQuietHoursNow() && (
                      <span className="absolute -bottom-1 right-0 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {quietLabel}
                </TooltipContent>
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-semibold">Notificaciones</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => markAllRead()}
                >
                  Marcar todas leídas
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3 p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors',
                      notification.status === 'unread' && 'bg-primary/5'
                    )}
                    onClick={() => {
                      markRead(notification.id);
                      if (notification.actionUrl) navigate(notification.actionUrl);
                    }}
                  >
                    <div className={cn(
                      'w-2 h-2 mt-2 rounded-full shrink-0',
                      notification.status === 'read' ? 'bg-muted' : 'bg-primary'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Ver todas las notificaciones
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
