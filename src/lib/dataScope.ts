import type { Role } from '@/lib/permissions/types';

export function scopeLeads<T extends { assignedTo?: string; assignedAgentId?: string }>(
  leads: T[],
  role: Role,
  effectiveAgentId: string,
): T[] {
  if (role !== 'agent') return leads;
  return leads.filter((l) => (l.assignedTo ?? l.assignedAgentId) === effectiveAgentId);
}

export function scopeInbox<T extends { agentId?: string; lead?: { assignedTo?: string } }>(
  items: T[],
  role: Role,
  effectiveAgentId: string,
): T[] {
  if (role !== 'agent') return items;
  return items.filter((i) => i.agentId === effectiveAgentId || i.lead?.assignedTo === effectiveAgentId);
}

export function scopeCalendar<T extends { agentId?: string }>(
  appointments: T[],
  role: Role,
  effectiveAgentId: string,
): T[] {
  if (role !== 'agent') return appointments;
  return appointments.filter((a) => a.agentId === effectiveAgentId);
}

export function scopeReports<T extends { assignedTo?: string; agentId?: string }>(
  rows: T[],
  role: Role,
  effectiveAgentId: string,
): T[] {
  if (role !== 'agent') return rows;
  return rows.filter((r) => (r.assignedTo ?? r.agentId) === effectiveAgentId);
}
