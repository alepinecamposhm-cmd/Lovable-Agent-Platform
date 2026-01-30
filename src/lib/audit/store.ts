export interface AuditEvent {
  id: string;
  action: string;
  actor?: string;
  payload?: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = 'agent_audit_events_v1';

export function listAuditEvents(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEvent[];
  } catch (e) {
    console.warn('audit: read error', e);
    return [];
  }
}

export function addAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>) {
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
  localStorage.removeItem(STORAGE_KEY);
}
