import { useSyncExternalStore } from 'react';
import { mockTeamAgents } from '../fixtures';
import { addAuditEvent } from '@/lib/audit/store';

export interface RoutingRule {
  id: string;
  zone: string;
  minPrice?: number;
  maxPrice?: number;
  assignToAgentId: string; // legacy single assignee
  assignees?: string[]; // multi-assign for round-robin
  strategy?: 'single' | 'round_robin';
  cursor?: number;
  active: boolean;
  order: number;
}

export type RoutingFallback = 'owner' | 'unassigned';

const STORAGE_KEY = 'agenthub_routing_rules';
const PAUSED_KEY = 'agenthub_paused_agents';
const FALLBACK_KEY = 'agenthub_routing_fallback';
const ALERT_KEY = 'agenthub_routing_alert';
const listeners = new Set<() => void>();

function load(): RoutingRule[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: RoutingRule[] = JSON.parse(raw);
    return parsed.map((rule, idx) => ({
      active: true,
      order: idx + 1,
      strategy: rule.strategy || 'single',
      assignees: rule.assignees || (rule.assignToAgentId ? [rule.assignToAgentId] : []),
      cursor: rule.cursor ?? 0,
      ...rule,
    }));
  } catch (e) {
    return [];
  }
}

function save(data: RoutingRule[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let rules = load();
let snapshot: { rules: RoutingRule[]; paused: Set<string> } | null = null;
let fallback: RoutingFallback = (() => {
  if (typeof window === 'undefined') return 'owner';
  return (window.localStorage.getItem(FALLBACK_KEY) as RoutingFallback) || 'owner';
})();

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listRules() {
  return rules.slice().sort((a, b) => a.order - b.order);
}

export function addRule(input: Omit<RoutingRule, 'id' | 'order' | 'active'>) {
  const nextOrder = rules.length + 1;
  const rule: RoutingRule = {
    id: `rule-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    active: true,
    order: nextOrder,
    strategy: input.strategy || 'single',
    assignees: input.assignees && input.assignees.length > 0 ? input.assignees : [input.assignToAgentId],
    cursor: 0,
    ...input,
  };
  rules = [...rules, rule];
  save(rules);
  emit();
  addAuditEvent({ action: 'routing_rule_added', actor: 'agent-1', domain: 'team', payload: { zone: rule.zone, strategy: rule.strategy } });
  return rule;
}

export function deleteRule(id: string) {
  rules = rules.filter((r) => r.id !== id);
  rules = rules.map((r, idx) => ({ ...r, order: idx + 1 }));
  save(rules);
  emit();
  addAuditEvent({ action: 'routing_rule_deleted', actor: 'agent-1', domain: 'team', payload: { id } });
}

export function updateRule(id: string, patch: Partial<Omit<RoutingRule, 'id'>>) {
  rules = rules.map((r) => (r.id === id ? { ...r, ...patch } : r));
  save(rules);
  emit();
  addAuditEvent({ action: 'routing_rule_updated', actor: 'agent-1', domain: 'team', payload: { id, patch } });
}

export function moveRule(id: string, direction: 'up' | 'down') {
  const ordered = listRules();
  const idx = ordered.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapWith = direction === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= ordered.length) return;
  const temp = ordered[idx];
  ordered[idx] = ordered[swapWith];
  ordered[swapWith] = temp;
  rules = ordered.map((r, i) => ({ ...r, order: i + 1 }));
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
  addAuditEvent({ action: paused ? 'agent_paused' : 'agent_resumed', actor: agentId, domain: 'team' });
}

export function matchAgent({ zone, price }: { zone?: string; price?: number }) {
  const paused = getPausedAgents();
  const found = listRules().find((r) => {
    if (!r.active) return false;
    if (zone && r.zone && r.zone.toLowerCase() !== zone.toLowerCase()) return false;
    if (typeof price === 'number') {
      if (r.minPrice && price < r.minPrice) return false;
      if (r.maxPrice && price > r.maxPrice) return false;
    }
    return true;
  });
  if (found) {
    const targets = found.assignees && found.assignees.length > 0 ? found.assignees : [found.assignToAgentId];
    const available = targets.filter((t) => !paused.has(t));
    if (found.strategy === 'round_robin' && available.length > 0) {
      const nextCursor = (found.cursor ?? 0) % available.length;
      const chosen = available[nextCursor];
      updateRule(found.id, { cursor: (nextCursor + 1) % available.length });
      setRoutingAlert(false);
      return chosen;
    }
    const chosen = available[0];
    if (chosen) {
      setRoutingAlert(false);
      return chosen;
    }
  }
  // fallback logic
  const fallbackId =
    fallback === 'owner'
      ? mockTeamAgents.find((a) => a.role === 'owner')?.id || 'agent-1'
      : undefined;
  if (fallbackId && !paused.has(fallbackId)) {
    setRoutingAlert(false);
    return fallbackId;
  }
  // no available agent -> raise alert and return first non-paused or default
  setRoutingAlert(true);
  addAuditEvent({ action: 'routing_fallback_triggered', actor: 'system', domain: 'team', payload: { zone, price } });
  const first = mockTeamAgents.find((a) => !paused.has(a.id))?.id;
  return first || 'agent-1';
}

function getSnapshot() {
  if (!snapshot) snapshot = { rules: listRules(), paused: getPausedAgents() };
  return snapshot;
}

export function useRoutingStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function resetRoutingStore() {
  rules = [];
  save(rules);
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(PAUSED_KEY);
    window.localStorage.setItem(FALLBACK_KEY, 'owner');
  }
  emit();
}

export function setFallback(strategy: RoutingFallback) {
  fallback = strategy;
  if (typeof window !== 'undefined') window.localStorage.setItem(FALLBACK_KEY, strategy);
  emit();
}

export function getFallback(): RoutingFallback {
  return fallback;
}

export function setRoutingAlert(flag: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ALERT_KEY, flag ? '1' : '0');
}

export function getRoutingAlert(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ALERT_KEY) === '1';
}
