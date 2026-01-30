import { useSyncExternalStore } from 'react';
import { mockTeamAgents } from '../fixtures';

export interface RoutingRule {
  id: string;
  zone: string;
  minPrice?: number;
  maxPrice?: number;
  assignToAgentId: string;
}

export interface RoutingAudit {
  id: string;
  zone?: string;
  price?: number;
  matchedAgentId: string;
  ruleId?: string;
  reason: 'assignment' | 'simulation';
  createdAt: Date;
}

const STORAGE_KEY = 'agenthub_routing_rules';
const PAUSED_KEY = 'agenthub_paused_agents';
const AUDIT_KEY = 'agenthub_routing_audit';
const listeners = new Set<() => void>();

function load(): RoutingRule[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RoutingRule[];
  } catch (e) {
    return [];
  }
}

function save(data: RoutingRule[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadAudit(): RoutingAudit[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(AUDIT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw).map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) })) as RoutingAudit[];
  } catch {
    return [];
  }
}

function saveAudit(data: RoutingAudit[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(data));
}

let rules = load();
let audit = loadAudit();
let snapshot: { rules: RoutingRule[]; paused: Set<string> } | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listRules() {
  return rules.slice();
}

export function addRule(input: Omit<RoutingRule, 'id'>) {
  const rule: RoutingRule = { id: `rule-${globalThis.crypto?.randomUUID?.() || Date.now()}`, ...input };
  rules = [rule, ...rules];
  save(rules);
  emit();
  return rule;
}

export function deleteRule(id: string) {
  rules = rules.filter((r) => r.id !== id);
  save(rules);
  emit();
}

export function getPausedAgents(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(PAUSED_KEY) || '[]'));
  } catch (e) {
    return new Set();
  }
}

export function togglePauseAgent(agentId: string, paused: boolean) {
  if (typeof window === 'undefined') return;
  const set = getPausedAgents();
  if (paused) set.add(agentId); else set.delete(agentId);
  window.localStorage.setItem(PAUSED_KEY, JSON.stringify(Array.from(set)));
  emit();
}

export function matchAgent({ zone, price }: { zone?: string; price?: number }) {
  const paused = getPausedAgents();
  const found = rules.find((r) => {
    if (zone && r.zone && r.zone.toLowerCase() !== zone.toLowerCase()) return false;
    if (typeof price === 'number') {
      if (r.minPrice && price < r.minPrice) return false;
      if (r.maxPrice && price > r.maxPrice) return false;
    }
    return true;
  });
  if (found && !paused.has(found.assignToAgentId)) return found.assignToAgentId;
  const fallback = mockTeamAgents.find((a) => !paused.has(a.id))?.id;
  return fallback || 'agent-1';
}

export function matchAgentWithAudit(params: { zone?: string; price?: number; reason?: 'assignment' | 'simulation' }) {
  const { zone, price, reason = 'assignment' } = params;
  const agentId = matchAgent({ zone, price });
  const rule = rules.find((r) => {
    if (zone && r.zone && r.zone.toLowerCase() !== zone.toLowerCase()) return false;
    if (typeof price === 'number') {
      if (r.minPrice && price < r.minPrice) return false;
      if (r.maxPrice && price > r.maxPrice) return false;
    }
    return true;
  });
  const entry: RoutingAudit = {
    id: `ra-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    zone,
    price,
    matchedAgentId: agentId,
    ruleId: rule?.id,
    reason,
    createdAt: new Date(),
  };
  audit = [entry, ...audit].slice(0, 200);
  saveAudit(audit);
  return { agentId, ruleId: rule?.id };
}

export function listRoutingAudit(): RoutingAudit[] {
  return audit.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function getSnapshot() {
  if (!snapshot) snapshot = { rules: listRules(), paused: getPausedAgents() };
  return snapshot;
}

export function useRoutingStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
