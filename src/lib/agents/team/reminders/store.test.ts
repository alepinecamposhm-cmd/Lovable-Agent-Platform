import { describe, it, expect, beforeEach } from 'vitest';
import {
  addReminderRule,
  canSendReminder,
  deleteReminderRule,
  listReminderRules,
  markReminderSent,
  shouldTriggerReminder,
  __resetForTests,
} from './store';
import type { Lead } from '@/types/agents';

const clearState = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.clear();
};

const makeLead = (overrides: Partial<Lead> = {}): Lead => {
  const now = new Date();
  return {
    id: 'lead-1',
    firstName: 'Maria',
    stage: 'new',
    temperature: 'warm',
    assignedTo: 'agent-1',
    source: 'marketplace',
    interestedIn: 'buy',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

describe('team reminders store', () => {
  beforeEach(() => {
    __resetForTests();
    clearState();
  });

  it('throttles reminders per (rule, lead) for 24h', () => {
    const rule = addReminderRule({ stage: 'new', minutes: 30, enabled: true });
    const leadId = 'lead-1';
    const now = Date.now();
    markReminderSent(rule.id, leadId, new Date(now));
    expect(canSendReminder(rule.id, leadId, now + 23 * 60 * 60 * 1000)).toBe(false);
    expect(canSendReminder(rule.id, leadId, now + 24 * 60 * 60 * 1000 + 1)).toBe(true);
  });

  it('evaluates stuck logic using createdAt for New and updatedAt for others', () => {
    const now = Date.now();
    const ruleNew = addReminderRule({ stage: 'new', minutes: 30 });
    const leadNew = makeLead({ stage: 'new', createdAt: new Date(now - 31 * 60 * 1000), updatedAt: new Date(now) });
    expect(shouldTriggerReminder(ruleNew, leadNew, now)).toBe(true);

    const ruleContacted = addReminderRule({ stage: 'contacted', minutes: 30 });
    const leadContacted = makeLead({ stage: 'contacted', createdAt: new Date(now - 999 * 60 * 1000), updatedAt: new Date(now - 31 * 60 * 1000) });
    expect(shouldTriggerReminder(ruleContacted, leadContacted, now)).toBe(true);
  });

  it('deletes sent map when rule is deleted', () => {
    const rule = addReminderRule({ stage: 'new', minutes: 30, enabled: true });
    markReminderSent(rule.id, 'lead-1', new Date());
    deleteReminderRule(rule.id);
    expect(listReminderRules().find((r) => r.id === rule.id)).toBeUndefined();
  });
});
