import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addRule, matchAgent, moveRule, updateRule, deleteRule, resetRoutingStore } from './store';
import { mockTeamAgents } from '../fixtures';

// reset helpers by clearing storage and reloading module state
const clearState = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
  }
};

describe('routing store', () => {
  beforeEach(() => {
    clearState();
    resetRoutingStore();
  });

  it('applies first active rule that matches zone/price', () => {
    addRule({ locations: ['Polanco'], minPrice: 4000000, maxPrice: 8000000, assignToAgentId: 'agent-2' });
    addRule({ locations: ['Roma'], assignToAgentId: 'agent-3' });

    const found = matchAgent({ zone: 'Polanco', price: 5000000 });
    expect(found).toBe('agent-2');
  });

  it('respects priority order when moved', () => {
    const first = addRule({ locations: ['Roma'], assignToAgentId: 'agent-3' });
    const second = addRule({ locations: ['Roma'], assignToAgentId: 'agent-2' });
    moveRule(second.id, 'up');
    const found = matchAgent({ zone: 'Roma' });
    expect(found).toBe('agent-2');
    moveRule(second.id, 'down');
    const found2 = matchAgent({ zone: 'Roma' });
    expect(found2).toBe('agent-3');
  });

  it('skips inactive rules', () => {
    const r = addRule({ locations: ['Centro'], assignToAgentId: 'agent-3' });
    updateRule(r.id, { active: false });
    const fallback = matchAgent({ zone: 'Centro' });
    expect(mockTeamAgents.some((a) => a.id === fallback)).toBe(true);
  });

  it('supports round robin across assignees and skips paused', () => {
    const r = addRule({
      locations: ['RR'],
      assignToAgentId: 'agent-1',
      assignees: ['agent-1', 'agent-2', 'agent-3'],
      strategy: 'round_robin',
    });
    const first = matchAgent({ zone: 'RR' });
    const second = matchAgent({ zone: 'RR' });
    expect(first).not.toBe(second);
  });

  it('ignores rule when price outside range', () => {
    addRule({ locations: ['Norte'], minPrice: 1000000, maxPrice: 2000000, assignToAgentId: 'agent-2' });
    const found = matchAgent({ zone: 'Norte', price: 500000 });
    expect(found).not.toBe('agent-2');
  });

  it('reindexes order after delete', () => {
    const a = addRule({ locations: ['X'], assignToAgentId: 'agent-1' });
    const b = addRule({ locations: ['Y'], assignToAgentId: 'agent-2' });
    deleteRule(a.id);
    const found = matchAgent({ zone: 'Y' });
    expect(found).toBe('agent-2');
  });

  it('matches rule locations against zip and preferredZones', () => {
    addRule({ locations: ['11560'], assignToAgentId: 'agent-2' });
    expect(matchAgent({ zip: '11560' })).toBe('agent-2');

    resetRoutingStore();
    addRule({ locations: ['Roma Norte'], assignToAgentId: 'agent-3' });
    expect(matchAgent({ preferredZones: ['Roma Norte'] })).toBe('agent-3');
  });

  it('filters by lead type when rule specifies leadType', () => {
    addRule({ locations: ['Polanco'], leadType: 'buy', assignToAgentId: 'agent-2' });
    addRule({ locations: ['Polanco'], leadType: 'sell', assignToAgentId: 'agent-3' });
    expect(matchAgent({ zone: 'Polanco', interestedIn: 'buy' })).toBe('agent-2');
    expect(matchAgent({ zone: 'Polanco', interestedIn: 'sell' })).toBe('agent-3');
  });

  it('migrates legacy zone to locations and defaults leadType to any', async () => {
    clearState();
    window.localStorage.setItem(
      'agenthub_routing_rules',
      JSON.stringify([{ id: 'rule-legacy', zone: 'Roma', assignToAgentId: 'agent-2' }])
    );
    vi.resetModules();
    const mod = await import('./store');
    const rules = mod.listRules();
    expect(rules[0].locations).toEqual(['Roma']);
    expect(rules[0].leadType).toBe('any');
  });
});
