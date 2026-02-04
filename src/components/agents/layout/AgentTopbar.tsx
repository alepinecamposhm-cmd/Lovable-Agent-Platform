import { Bell, Search, Command, CreditCard } from 'lucide-react';
import { AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  markAllRead,
  markRead,
  list as listNotifications,
  useNotificationStore,
  isQuietHoursNow,
} from '@/lib/agents/notifications/store';
import { useTaskStore } from '@/lib/agents/tasks/store';
import { useNavigate } from 'react-router-dom';
import { useCreditAccount } from '@/lib/credits/query';
import { cn as cnUtil } from '@/lib/utils';
import { triggerCreditLow } from '@/lib/agents/notifications/triggers';
import { useAnimatedNumber } from '@/lib/credits/useAnimatedNumber';

interface AgentTopbarProps {
  onOpenCommand: () => void;
}

export function AgentTopbar({ onOpenCommand }: AgentTopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unread, quietHours } = useNotificationStore();
  const { pending: pendingTasks } = useTaskStore();
  const { data: creditAccount, isLoading: creditLoading, isError: creditError } = useCreditAccount();
  const creditBalance = creditAccount?.balance;
  const creditThreshold = creditAccount?.lowBalanceThreshold;
  const lowBalance =
    typeof creditBalance === 'number' && typeof creditThreshold === 'number'
      ? creditBalance <= creditThreshold
      : false;
  const prevBalanceRef = useRef<number | null>(null);
  const prevBalanceAnimRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const animatedCreditBalance = useAnimatedNumber(
    creditError || creditLoading ? undefined : creditBalance,
    { durationMs: 650 }
  );
  const quietLabel = useMemo(() => {
    if (!quietHours.enabled) return 'Notificaciones activas';
    return `Silenciado ${quietHours.start}–${quietHours.end}`;
  }, [quietHours]);

  const track = (event: string, properties?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    }).catch(() => {});
  };

  useEffect(() => {
    if (typeof creditBalance !== 'number' || creditError) return;
    const next = creditBalance;
    const prev = prevBalanceAnimRef.current;
    prevBalanceAnimRef.current = next;
    if (prev != null && prev !== next && !reduceMotion) {
      track('credits_balance_animated', { from: prev, to: next, source: 'topbar' });
    }
  }, [creditBalance, creditError, reduceMotion]);

  useEffect(() => {
    if (typeof creditBalance !== 'number' || typeof creditThreshold !== 'number' || creditError) return;
    const balance = creditBalance;
    const threshold = creditThreshold;
    const prevBalance = prevBalanceRef.current;
    prevBalanceRef.current = balance;

    if (balance > threshold) return;

    const STORAGE_KEY = 'agenthub_credit_low_last_notified';
    const now = Date.now();
    let last: { at: string; balance: number; threshold: number } | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) last = JSON.parse(raw);
    } catch {
      last = null;
    }

    const within24h = last?.at ? now - new Date(last.at).getTime() < 24 * 60 * 60 * 1000 : false;
    const alreadyNotifiedSame =
      within24h &&
      typeof last?.balance === 'number' &&
      typeof last?.threshold === 'number' &&
      last.balance === balance &&
      last.threshold === threshold;

    if (alreadyNotifiedSame) {
      track('credits_low_balance_deduped', { balance, threshold });
      return;
    }

    const crossed = prevBalance != null && prevBalance > threshold;
    const firstKnownLow = prevBalance == null;
    const lowerThanLast = typeof last?.balance === 'number' ? balance < last.balance : false;
    const shouldNotify = crossed || firstKnownLow || lowerThanLast || !within24h;

    if (!shouldNotify) return;

    triggerCreditLow(balance);
    const created = listNotifications()[0];
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ at: new Date().toISOString(), balance, threshold })
      );
    } catch {
      // ignore storage errors (e.g. private mode)
    }
    track('credits_low_balance_triggered', { balance, threshold, source: 'account_fetch' });
    track('credits_low_balance_notification_created', { notificationId: created?.id, balance });
  }, [creditBalance, creditThreshold, creditError]);

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cnUtil(
                  'h-9 gap-2',
                  lowBalance && 'border-warning text-warning',
                  creditError && 'border-destructive text-destructive'
                )}
                onClick={() => navigate('/agents/credits')}
              >
                <CreditCard className="h-4 w-4" />
                {creditLoading ? '—' : creditError ? 'Error' : `${animatedCreditBalance ?? creditAccount?.balance ?? '—'}`}
                <span className="text-xs text-muted-foreground">cr</span>
                <span className="text-xs text-muted-foreground">
                  · ${creditAccount?.currencyRate ? (creditAccount.balance * (creditAccount.currencyRate || 1)).toFixed(0) : '--'}
                </span>
                {lowBalance && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-warning opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-warning" />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {creditError
                ? 'No se pudo cargar el saldo'
                : lowBalance
                ? 'Saldo bajo - recarga créditos'
                : 'Saldo disponible'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/agents/tasks')}
                aria-label="Ver tareas pendientes"
              >
                <AlarmClock className="h-5 w-5" />
                <AnimatePresence>
                  {pendingTasks > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                    >
                      {pendingTasks}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {pendingTasks > 0 ? `${pendingTasks} tareas pendientes` : 'Sin tareas pendientes'}
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={quietLabel}
                    aria-expanded={notificationsOpen}
                    aria-haspopup="true"
                  >
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
              <div className="max-h-80 overflow-y-auto" role="list" aria-label="Últimas notificaciones">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3 p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors',
                      notification.status === 'unread' && 'bg-primary/5'
                    )}
                    role="listitem"
                    onClick={() => {
                      markRead(notification.id);
                      if (notification.type === 'credit') {
                        track('credits_low_balance_notification_clicked', { notificationId: notification.id });
                      }
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
                      {notification.costCredits ? (
                        <p className="text-xs text-warning mt-1">Costo: {notification.costCredits} créditos</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/agents/notifications');
                  }}
                >
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
