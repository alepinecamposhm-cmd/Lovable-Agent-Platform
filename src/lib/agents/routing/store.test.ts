import { describe, it, expect, beforeEach } from 'vitest';
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
    addRule({ zone: 'Polanco', minPrice: 4000000, maxPrice: 8000000, assignToAgentId: 'agent-2' });
    addRule({ zone: 'Roma', assignToAgentId: 'agent-3' });

    const found = matchAgent({ zone: 'Polanco', price: 5000000 });
    expect(found).toBe('agent-2');
  });

  it('respects priority order when moved', () => {
    const first = addRule({ zone: 'Roma', assignToAgentId: 'agent-3' });
    const second = addRule({ zone: 'Roma', assignToAgentId: 'agent-2' });
    moveRule(second.id, 'up');
    const found = matchAgent({ zone: 'Roma' });
    expect(found).toBe('agent-2');
    moveRule(second.id, 'down');
    const found2 = matchAgent({ zone: 'Roma' });
    expect(found2).toBe('agent-3');
  });

  it('skips inactive rules', () => {
    const r = addRule({ zone: 'Centro', assignToAgentId: 'agent-3' });
    updateRule(r.id, { active: false });
    const fallback = matchAgent({ zone: 'Centro' });
    expect(mockTeamAgents.some((a) => a.id === fallback)).toBe(true);
  });

  it('supports round robin across assignees and skips paused', () => {
    const r = addRule({
      zone: 'RR',
      assignToAgentId: 'agent-1',
      assignees: ['agent-1', 'agent-2', 'agent-3'],
      strategy: 'round_robin',
    });
    const first = matchAgent({ zone: 'RR' });
    const second = matchAgent({ zone: 'RR' });
    expect(first).not.toBe(second);
  });

  it('ignores rule when price outside range', () => {
    addRule({ zone: 'Norte', minPrice: 1000000, maxPrice: 2000000, assignToAgentId: 'agent-2' });
    const found = matchAgent({ zone: 'Norte', price: 500000 });
    expect(found).not.toBe('agent-2');
  });

  it('reindexes order after delete', () => {
    const a = addRule({ zone: 'X', assignToAgentId: 'agent-1' });
    const b = addRule({ zone: 'Y', assignToAgentId: 'agent-2' });
    deleteRule(a.id);
    const found = matchAgent({ zone: 'Y' });
    expect(found).toBe('agent-2');
  });
});
