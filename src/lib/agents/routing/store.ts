import { useSyncExternalStore } from 'react';
import { mockTeamAgents } from '../fixtures';
import { addAuditEvent } from '@/lib/audit/store';

export interface RoutingRule {
  id: string;
  // Zones and/or ZIPs that should trigger this rule (case-insensitive exact match).
  locations: string[];
  minPrice?: number;
  maxPrice?: number;
  leadType: 'any' | 'buy' | 'sell' | 'rent';
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
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    let didMigrate = false;
    const normalized = parsed.map((ruleRaw, idx) => {
      const rule = ruleRaw as Record<string, unknown>;
      const legacyZone = typeof rule.zone === 'string' ? rule.zone.trim() : undefined;
      const locations = Array.isArray(rule.locations)
        ? (rule.locations.filter((l): l is string => typeof l === 'string' && l.trim().length > 0).map((l) => l.trim()))
        : legacyZone
          ? [legacyZone]
          : [];
      if (!Array.isArray(rule.locations) && legacyZone) didMigrate = true;

      const leadTypeRaw = typeof rule.leadType === 'string' ? rule.leadType : 'any';
      const leadType: RoutingRule['leadType'] =
        leadTypeRaw === 'buy' || leadTypeRaw === 'sell' || leadTypeRaw === 'rent' || leadTypeRaw === 'any'
          ? leadTypeRaw
          : 'any';
      if (typeof rule.leadType !== 'string') didMigrate = true;

      const legacyAssignIds = (rule as { assignAgentIds?: unknown }).assignAgentIds;
      const legacyFirstAssignee =
        Array.isArray(legacyAssignIds) && typeof legacyAssignIds[0] === 'string'
          ? legacyAssignIds[0]
          : undefined;
      const assignToAgentId =
        typeof rule.assignToAgentId === 'string' ? rule.assignToAgentId : legacyFirstAssignee || 'agent-1';
      const assignees = Array.isArray(rule.assignees)
        ? rule.assignees.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
        : assignToAgentId
          ? [assignToAgentId]
          : [];

      const minPrice = typeof rule.minPrice === 'number' ? rule.minPrice : undefined;
      const maxPrice = typeof rule.maxPrice === 'number' ? rule.maxPrice : undefined;
      const active = typeof rule.active === 'boolean' ? rule.active : true;
      const order = typeof rule.order === 'number' ? rule.order : idx + 1;
      const cursor = typeof rule.cursor === 'number' ? rule.cursor : 0;
      const strategy = rule.strategy === 'round_robin' ? 'round_robin' : 'single';
      const id = typeof rule.id === 'string' ? rule.id : `rule-${globalThis.crypto?.randomUUID?.() || Date.now()}`;

      return {
        id,
        locations,
        minPrice,
        maxPrice,
        leadType,
        assignToAgentId,
        assignees,
        strategy,
        cursor,
        active,
        order,
      } satisfies RoutingRule;
    });
    if (didMigrate) {
      save(normalized);
    }
    return normalized.map((rule, idx) => ({
      ...rule,
      strategy: rule.strategy || 'single',
      assignees: rule.assignees || (rule.assignToAgentId ? [rule.assignToAgentId] : []),
      cursor: rule.cursor ?? 0,
      order: rule.order ?? idx + 1,
      active: rule.active ?? true,
      leadType: rule.leadType ?? 'any',
      locations: rule.locations || [],
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

export function addRule(
  input: Omit<RoutingRule, 'id' | 'order' | 'active' | 'leadType'> & { leadType?: RoutingRule['leadType'] }
) {
  const nextOrder = rules.length + 1;
  const rule: RoutingRule = {
    id: `rule-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    active: true,
    order: nextOrder,
    cursor: 0,
    ...input,
    strategy: input.strategy || 'single',
    leadType: input.leadType ?? 'any',
    assignees: input.assignees && input.assignees.length > 0 ? input.assignees : [input.assignToAgentId],
  };
  rules = [...rules, rule];
  save(rules);
  emit();
  addAuditEvent({ action: 'routing_rule_added', actor: 'agent-1', domain: 'team', payload: { locations: rule.locations, leadType: rule.leadType, strategy: rule.strategy } });
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

export function matchAgent({
  zone,
  zip,
  preferredZones,
  price,
  interestedIn,
}: {
  zone?: string;
  zip?: string;
  preferredZones?: string[];
  price?: number;
  interestedIn?: 'buy' | 'sell' | 'rent';
}) {
  const paused = getPausedAgents();
  const inputLocations = [
    zone,
    zip,
    ...(Array.isArray(preferredZones) ? preferredZones : []),
  ]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim().toLowerCase());

  const found = listRules().find((r) => {
    if (!r.active) return false;
    if (r.leadType !== 'any' && interestedIn && r.leadType !== interestedIn) return false;
    if (r.leadType !== 'any' && !interestedIn) return false;
    if (r.locations.length > 0) {
      if (inputLocations.length === 0) return false;
      const normalized = r.locations.map((l) => l.toLowerCase());
      const hit = inputLocations.some((loc) => normalized.includes(loc));
      if (!hit) return false;
    }
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
