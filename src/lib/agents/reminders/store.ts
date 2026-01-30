import { useSyncExternalStore } from 'react';
import type { Lead, LeadStage } from '@/types/agents';

export interface ReminderRule {
  id: string;
  stage: LeadStage;
  thresholdHours: number;
  enabled: boolean;
  label: string;
}

const RULES_KEY = 'agenthub_reminder_rules';
const FIRED_KEY = 'agenthub_reminder_fired';
const listeners = new Set<() => void>();

const defaultRules: ReminderRule[] = [
  { id: 'rr-1', stage: 'new', thresholdHours: 0.5, enabled: true, label: 'New >30min sin respuesta' },
  { id: 'rr-2', stage: 'contacted', thresholdHours: 48, enabled: true, label: 'Contacted >48h sin avance' },
];

function loadRules(): ReminderRule[] {
  if (typeof window === 'undefined') return defaultRules;
  const raw = window.localStorage.getItem(RULES_KEY);
  if (!raw) return defaultRules;
  try {
    return JSON.parse(raw) as ReminderRule[];
  } catch (e) {
    return defaultRules;
  }
}

function saveRules(data: ReminderRule[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RULES_KEY, JSON.stringify(data));
}

function loadFired(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(FIRED_KEY) || '[]'));
  } catch (e) {
    return new Set();
  }
}

function saveFired(set: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set)));
}

let rules = loadRules();
let fired = loadFired();
let snapshot: ReminderRule[] | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listReminderRules() {
  return rules.slice();
}

export function addReminderRule(input: Omit<ReminderRule, 'id'>) {
  const rule: ReminderRule = { id: `rr-${globalThis.crypto?.randomUUID?.() || Date.now()}`, ...input };
  rules = [rule, ...rules];
  saveRules(rules);
  emit();
  return rule;
}

export function deleteReminderRule(id: string) {
  rules = rules.filter((r) => r.id !== id);
  saveRules(rules);
  emit();
}

export function toggleReminderRule(id: string, enabled: boolean) {
  rules = rules.map((r) => (r.id === id ? { ...r, enabled } : r));
  saveRules(rules);
  emit();
}

export interface ReminderHit {
  ruleId: string;
  leadId: string;
  stage: LeadStage;
}

export function evaluateReminders(leads: Lead[]): ReminderHit[] {
  const now = Date.now();
  const hits: ReminderHit[] = [];
  leads.forEach((lead) => {
    rules.forEach((rule) => {
      if (!rule.enabled) return;
      if (lead.stage !== rule.stage) return;
      const hours = (now - lead.createdAt.getTime()) / 36e5;
      if (hours >= rule.thresholdHours) {
        const key = `${rule.id}|${lead.id}`;
        if (!fired.has(key)) {
          hits.push({ ruleId: rule.id, leadId: lead.id, stage: lead.stage });
          fired.add(key);
        }
      }
    });
  });
  if (hits.length > 0) saveFired(fired);
  return hits;
}

function getSnapshot() {
  if (!snapshot) snapshot = listReminderRules();
  return snapshot;
}

export function useReminderStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
