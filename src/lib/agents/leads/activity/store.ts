import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';
import { mockLeadActivities } from '@/lib/agents/fixtures';
import type { LeadActivity, LeadActivityType } from '@/types/agents';

const STORAGE_KEY = 'agenthub_lead_activities';
const listeners = new Set<() => void>();

let loadError: string | null = null;

function hydrate(raw: any): LeadActivity {
  return {
    ...raw,
    createdAt: raw.createdAt ? parseISO(raw.createdAt) : new Date(),
  } as LeadActivity;
}

function load(): LeadActivity[] {
  if (typeof window === 'undefined') return mockLeadActivities;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockLeadActivities;
  try {
    return JSON.parse(raw).map(hydrate);
  } catch (e) {
    loadError = 'Failed to parse lead activities from storage';
    console.error(loadError, e);
    return mockLeadActivities;
  }
}

function save(data: LeadActivity[]) {
  if (typeof window === 'undefined') return;
  const serializable = data.map((act) => ({
    ...act,
    createdAt: formatISO(act.createdAt),
  }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let activities = load();

function emit() {
  cachedSnapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listLeadActivities(leadId?: string) {
  const scoped = leadId ? activities.filter((a) => a.leadId === leadId) : activities.slice();
  return scoped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

type LeadActivityInput = {
  leadId: string;
  type: LeadActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt?: Date;
};

export function addLeadActivity(input: LeadActivityInput) {
  const now = new Date();
  const act: LeadActivity = {
    id: `act-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    leadId: input.leadId,
    type: input.type,
    description: input.description,
    metadata: input.metadata,
    createdBy: input.createdBy,
    createdAt: input.createdAt ?? now,
  };
  activities = [act, ...activities];
  save(activities);
  emit();
  return act;
}

export function getLeadActivityError() {
  return loadError;
}

let cachedSnapshot: { activities: LeadActivity[]; error: string | null; _raw: LeadActivity[] } | null = null;

function getSnapshot() {
  if (!cachedSnapshot || cachedSnapshot._raw !== activities) {
    cachedSnapshot = {
      activities: listLeadActivities(),
      error: loadError,
      _raw: activities,
    } as any;
  }
  return cachedSnapshot as { activities: LeadActivity[]; error: string | null };
}

export function useLeadActivityStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

