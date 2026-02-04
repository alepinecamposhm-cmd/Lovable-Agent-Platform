export interface AuditEvent {
  id: string;
  action: string;
  actor?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  domain?: 'team' | 'auth' | 'system';
}

const STORAGE_KEY = 'agent_audit_events_v1';

export function listAuditEvents(): AuditEvent[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEvent[];
  } catch (e) {
    console.warn('audit: read error', e);
    return [];
  }
}

export function addAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>) {
  if (typeof window === 'undefined') return null;
  const current = listAuditEvents();
  const full = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...event,
  } as AuditEvent;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([full, ...current]));
  } catch (e) {
    console.warn('audit: write error', e);
  }
  return full;
}

export function clearAuditEvents() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
