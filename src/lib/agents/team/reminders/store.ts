import { useSyncExternalStore } from 'react';
import type { Lead, LeadStage } from '@/types/agents';

export type TeamReminderRule = {
  id: string;
  enabled: boolean;
  stage: LeadStage;
  minutes: number;
  createdAt: string;
  updatedAt: string;
};

type SentMap = Record<string, Record<string, string>>;

const RULES_KEY = 'agenthub_team_reminder_rules';
const SENT_KEY = 'agenthub_team_reminder_sent';
// Legacy single-rule key used by an earlier Team page implementation.
const LEGACY_KEY = 'agenthub_team_reminders';

const listeners = new Set<() => void>();
let snapshot: { rules: TeamReminderRule[]; sent: SentMap } | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

function safeJsonParse<T>(raw: string): T | undefined {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function migrateLegacyIfNeeded(): { rules: TeamReminderRule[]; sent: SentMap } {
  if (typeof window === 'undefined') return { rules: [], sent: {} };

  const existing = window.localStorage.getItem(RULES_KEY);
  if (existing) {
    return { rules: loadRules(), sent: loadSent() };
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) {
    return { rules: [], sent: loadSent() };
  }

  const legacy = safeJsonParse<{ enabled?: unknown; minutes?: unknown; stage?: unknown }>(legacyRaw);
  if (!legacy) return { rules: [], sent: loadSent() };

  const enabled = typeof legacy.enabled === 'boolean' ? legacy.enabled : false;
  const minutes = typeof legacy.minutes === 'number' ? legacy.minutes : 30;
  const stage = (legacy.stage === 'new' ||
    legacy.stage === 'contacted' ||
    legacy.stage === 'appointment_set' ||
    legacy.stage === 'toured' ||
    legacy.stage === 'closed' ||
    legacy.stage === 'closed_lost')
    ? legacy.stage
    : 'new';

  const now = new Date().toISOString();
  const rule: TeamReminderRule = {
    id: 'reminder-legacy',
    enabled,
    minutes,
    stage,
    createdAt: now,
    updatedAt: now,
  };

  window.localStorage.setItem(RULES_KEY, JSON.stringify([rule]));
  window.localStorage.removeItem(LEGACY_KEY);
  return { rules: [rule], sent: loadSent() };
}

function loadRules(): TeamReminderRule[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(RULES_KEY);
  if (!raw) return [];
  const parsed = safeJsonParse<unknown>(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((rRaw) => {
      const r = rRaw as Record<string, unknown>;
      const stage = r.stage;
      const isStage = stage === 'new' ||
        stage === 'contacted' ||
        stage === 'appointment_set' ||
        stage === 'toured' ||
        stage === 'closed' ||
        stage === 'closed_lost';
      if (!isStage) return null;
      return {
        id: typeof r.id === 'string' ? r.id : `reminder-${Date.now()}`,
        enabled: typeof r.enabled === 'boolean' ? r.enabled : true,
        stage,
        minutes: typeof r.minutes === 'number' ? r.minutes : 30,
        createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
        updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : new Date().toISOString(),
      } satisfies TeamReminderRule;
    })
    .filter((r): r is TeamReminderRule => Boolean(r));
}

function persistRules(next: TeamReminderRule[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RULES_KEY, JSON.stringify(next));
}

function loadSent(): SentMap {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(SENT_KEY);
  if (!raw) return {};
  const parsed = safeJsonParse<unknown>(raw);
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed as SentMap;
}

function persistSent(next: SentMap) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SENT_KEY, JSON.stringify(next));
}

let rules: TeamReminderRule[] = [];
let sent: SentMap = {};
let loaded = false;

function ensureLoaded() {
  if (loaded) return;
  const migrated = migrateLegacyIfNeeded();
  rules = migrated.rules;
  sent = migrated.sent;
  loaded = true;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listReminderRules() {
  ensureLoaded();
  return rules.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function addReminderRule(input: { enabled?: boolean; stage: LeadStage; minutes: number }) {
  ensureLoaded();
  const now = new Date().toISOString();
  const rule: TeamReminderRule = {
    id: `reminder-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    enabled: input.enabled ?? true,
    stage: input.stage,
    minutes: Math.max(1, Math.floor(input.minutes)),
    createdAt: now,
    updatedAt: now,
  };
  rules = [rule, ...rules];
  persistRules(rules);
  emit();
  return rule;
}

export function updateReminderRule(id: string, patch: Partial<Pick<TeamReminderRule, 'enabled' | 'stage' | 'minutes'>>) {
  ensureLoaded();
  const now = new Date().toISOString();
  rules = rules.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      ...patch,
      minutes: patch.minutes != null ? Math.max(1, Math.floor(patch.minutes)) : r.minutes,
      updatedAt: now,
    };
  });
  persistRules(rules);
  emit();
}

export function deleteReminderRule(id: string) {
  ensureLoaded();
  rules = rules.filter((r) => r.id !== id);
  const nextSent = { ...sent };
  delete nextSent[id];
  sent = nextSent;
  persistRules(rules);
  persistSent(sent);
  emit();
}

export function getSentMap(): SentMap {
  ensureLoaded();
  return sent;
}

export function markReminderSent(ruleId: string, leadId: string, at: Date = new Date()) {
  ensureLoaded();
  const prevRule = sent[ruleId] || {};
  sent = {
    ...sent,
    [ruleId]: {
      ...prevRule,
      [leadId]: at.toISOString(),
    },
  };
  persistSent(sent);
  emit();
}

export function canSendReminder(ruleId: string, leadId: string, nowMs: number, cadenceHours = 24) {
  ensureLoaded();
  const lastIso = sent[ruleId]?.[leadId];
  if (!lastIso) return true;
  const last = new Date(lastIso).getTime();
  const cadenceMs = cadenceHours * 60 * 60 * 1000;
  return nowMs - last >= cadenceMs;
}

export function getLeadStuckSinceMs(lead: Lead) {
  return (lead.stage === 'new' ? lead.createdAt : lead.updatedAt).getTime();
}

export function shouldTriggerReminder(rule: TeamReminderRule, lead: Lead, nowMs: number) {
  if (!rule.enabled) return false;
  if (lead.stage !== rule.stage) return false;
  const stuckSince = getLeadStuckSinceMs(lead);
  const ageMs = nowMs - stuckSince;
  return ageMs >= rule.minutes * 60 * 1000;
}

function getSnapshot() {
  ensureLoaded();
  if (!snapshot) snapshot = { rules: listReminderRules(), sent: getSentMap() };
  return snapshot;
}

export function useTeamReminderStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Test-only helper: keeps unit tests isolated without having to reload the module.
export function __resetForTests() {
  rules = [];
  sent = {};
  loaded = false;
  snapshot = null;
  listeners.clear();
}
