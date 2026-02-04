import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';

export type NotificationType =
  | 'lead'
  | 'message'
  | 'appointment'
  | 'task'
  | 'listing'
  | 'credit'
  | 'system';

export type NotificationStatus = 'unread' | 'read';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  costCredits?: number;
  actionUrl?: string;
  createdAt: Date;
  status: NotificationStatus;
}

export interface QuietHoursState {
  enabled: boolean;
  start: string; // HH:mm
  end: string;   // HH:mm
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

const STORAGE_KEY = 'agenthub_notifications';
const QUIET_KEY = 'agenthub_quiet_hours';

const listeners = new Set<() => void>();

const seed: Notification[] = [
  {
    id: 'notif-1',
    type: 'message',
    title: 'Nuevo mensaje',
    body: 'María García te envió un mensaje',
    actionUrl: '/agents/inbox/conv-1',
    createdAt: new Date('2026-01-28T14:00:00'),
    status: 'unread',
  },
  {
    id: 'notif-2',
    type: 'appointment',
    title: 'Cita confirmada',
    body: 'Ana López confirmó la visita de mañana 11am',
    actionUrl: '/agents/calendar',
    createdAt: new Date('2026-01-28T09:30:00'),
    status: 'unread',
  },
  {
    id: 'notif-3',
    type: 'listing',
    title: 'Listing trending',
    body: 'Depto Condesa tuvo 45 views hoy (+180%)',
    actionUrl: '/agents/listings/listing-1',
    createdAt: new Date('2026-01-27T18:00:00'),
    status: 'read',
  },
  {
    id: 'notif-4',
    type: 'lead',
    title: 'Nuevo lead asignado',
    body: 'Roberto Hernández está interesado en comprar',
    costCredits: 5,
    actionUrl: '/agents/leads/lead-2',
    createdAt: new Date('2026-01-27T08:00:00'),
    status: 'read',
  },
];

function load(): Notification[] {
  if (typeof window === 'undefined') return seed;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seed;
    return parsed.map((nRaw) => {
      const n = nRaw as Record<string, unknown>;
      return {
        ...(nRaw as Omit<Notification, 'createdAt'>),
        createdAt: typeof n.createdAt === 'string' ? parseISO(n.createdAt) : new Date(),
      };
    });
  } catch (e) {
    console.error('Failed to parse notifications', e);
    return seed;
  }
}

function save(notifs: Notification[]) {
  if (typeof window === 'undefined') return;
  const serializable = notifs.map((n) => ({ ...n, createdAt: formatISO(n.createdAt) }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let notifications = load();

const defaultQuiet: QuietHoursState = {
  enabled: false,
  start: '22:00',
  end: '07:00',
  channels: { push: true, email: true, sms: false },
};

function loadQuiet(): QuietHoursState {
  if (typeof window === 'undefined') return defaultQuiet;
  const raw = window.localStorage.getItem(QUIET_KEY);
  if (!raw) return defaultQuiet;
  try {
    return { ...defaultQuiet, ...JSON.parse(raw) };
  } catch {
    return defaultQuiet;
  }
}

let quietHours = loadQuiet();

function persistQuiet() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(QUIET_KEY, JSON.stringify(quietHours));
}

function emit() {
  cachedSnapshot = null; // Invalidate cache to force new snapshot on next read
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function list(): Notification[] {
  return notifications.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function add(input: Omit<Notification, 'id' | 'status' | 'createdAt'> & { createdAt?: Date }) {
  const notif: Notification = {
    id: `notif-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    status: 'unread',
    createdAt: input.createdAt ?? new Date(),
    ...input,
  };
  notifications = [notif, ...notifications];
  save(notifications);
  emit();
}

export function markRead(id: string) {
  notifications = notifications.map((n) => (n.id === id ? { ...n, status: 'read' } : n));
  save(notifications);
  emit();
}

export function markAllRead() {
  notifications = notifications.map((n) => ({ ...n, status: 'read' }));
  save(notifications);
  emit();
}

export function getUnreadCount() {
  return notifications.filter((n) => n.status === 'unread').length;
}

type QuietPartial = Partial<QuietHoursState> & { channels?: Partial<QuietHoursState['channels']> };

export function setQuietHours(state: QuietPartial) {
  const nextChannels = state.channels
    ? { ...quietHours.channels, ...state.channels }
    : quietHours.channels;
  quietHours = { ...quietHours, ...state, channels: nextChannels };
  persistQuiet();
  emit();
}

export function getQuietHoursState(): QuietHoursState {
  return quietHours;
}

export function isQuietHoursNow(date = new Date()): boolean {
  if (!quietHours.enabled) return false;
  const [startH, startM] = quietHours.start.split(':').map(Number);
  const [endH, endM] = quietHours.end.split(':').map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  const now = date.getHours() * 60 + date.getMinutes();
  if (start < end) {
    return now >= start && now < end;
  }
  // overnight window
  return now >= start || now < end;
}

// Cache to prevent infinite re-renders (useSyncExternalStore needs stable object references)
type NotificationSnapshot = {
  notifications: Notification[];
  unread: number;
  quietHours: QuietHoursState;
  _rawNotifications: Notification[];
  _rawQuietHours: QuietHoursState;
};

let cachedSnapshot: NotificationSnapshot | null = null;

function getSnapshot() {
  const newNotifications = list();
  const newUnread = getUnreadCount();
  const newQuietHours = getQuietHoursState();

  // Only create new object if data actually changed (check raw module-level state)
  if (
    !cachedSnapshot ||
    notifications !== cachedSnapshot._rawNotifications || // compare raw array reference
    cachedSnapshot.unread !== newUnread ||
    quietHours !== cachedSnapshot._rawQuietHours // compare raw object reference
  ) {
    cachedSnapshot = {
      notifications: newNotifications,
      unread: newUnread,
      quietHours: newQuietHours,
      _rawNotifications: notifications, // store raw references for comparison
      _rawQuietHours: quietHours,
    };
  }

  return cachedSnapshot;
}

export function useNotificationStore(): {
  notifications: Notification[];
  unread: number;
  quietHours: QuietHoursState;
} {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot // SSR snapshot (same logic)
  );
}
