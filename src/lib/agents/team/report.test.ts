import { describe, expect, it } from 'vitest';
import { calcTeamReport, filterLeadsByRange } from './report';
import type { Lead } from '@/types/agents';

const makeLead = (overrides: Partial<Lead> = {}): Lead => {
  const baseDate = new Date('2026-02-03T12:00:00Z');
  return {
    id: 'lead-1',
    firstName: 'Maria',
    stage: 'new',
    temperature: 'warm',
    assignedTo: 'agent-1',
    source: 'marketplace',
    interestedIn: 'buy',
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
};

describe('team report', () => {
  it('filters leads by range', () => {
    const now = new Date('2026-02-04T00:00:00Z');
    const leads: Lead[] = [
      makeLead({ id: 'recent', createdAt: new Date('2026-02-03T00:00:00Z') }),
      makeLead({ id: 'old', createdAt: new Date('2026-01-01T00:00:00Z') }),
    ];
    expect(filterLeadsByRange(leads, '7d', now).map((l) => l.id)).toEqual(['recent']);
    expect(filterLeadsByRange(leads, 'all', now).map((l) => l.id)).toEqual(['recent', 'old']);
  });

  it('calculates per-agent stage counts and under-5m rate', () => {
    const agentIds = ['agent-1', 'agent-2', 'agent-3'];
    const leads: Lead[] = [
      makeLead({
        id: 'l1',
        assignedTo: 'agent-1',
        stage: 'new',
        assignedAt: new Date('2026-02-03T10:00:00Z'),
        acceptedAt: new Date('2026-02-03T10:04:00Z'),
      }),
      makeLead({
        id: 'l2',
        assignedTo: 'agent-1',
        stage: 'contacted',
        assignedAt: new Date('2026-02-03T10:00:00Z'),
        acceptedAt: new Date('2026-02-03T10:10:00Z'),
      }),
      makeLead({
        id: 'l3',
        assignedTo: 'agent-2',
        stage: 'closed_lost',
      }),
      makeLead({
        id: 'l4',
        assignedTo: 'agent-2',
        stage: 'appointment_set',
        // No assignedAt: should fall back to createdAt for the 5m clock.
        createdAt: new Date('2026-02-03T10:00:00Z'),
        acceptedAt: new Date('2026-02-03T10:03:00Z'),
      }),
    ];

    const report = calcTeamReport(leads, agentIds);

    expect(report.totals.new).toBe(1);
    expect(report.totals.contacted).toBe(1);
    expect(report.totals.appointment_set).toBe(1);
    expect(report.totals.closed_lost).toBe(1);

    const row1 = report.rows.find((r) => r.agentId === 'agent-1')!;
    expect(row1.leads).toBe(2);
    expect(row1.answeredUnder5mPct).toBe(50);
    expect(row1.answerRatePct).toBe(100);
    expect(row1.new).toBe(1);
    expect(row1.contacted).toBe(1);

    const row2 = report.rows.find((r) => r.agentId === 'agent-2')!;
    expect(row2.leads).toBe(2);
    expect(row2.answeredUnder5mPct).toBe(50);
    expect(row2.answerRatePct).toBe(50);
    expect(row2.appointment_set).toBe(1);
    expect(row2.closed_lost).toBe(1);

    const row3 = report.rows.find((r) => r.agentId === 'agent-3')!;
    expect(row3.leads).toBe(0);
    expect(row3.answeredUnder5mPct).toBe(0);
    expect(row3.answerRatePct).toBe(0);
  });
});

