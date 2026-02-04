import { describe, it, expect } from 'vitest';
import type { Conversation, Lead, Message } from '@/types/agents';
import {
  buildLeadBreakdown,
  buildLeadVolumeSeries,
  computeAnswerRatePct,
  getLeadFirstContactMs,
  type LeadReportContext,
} from './leadReport';

function leadBase(overrides: Partial<Lead>): Lead {
  return {
    id: 'lead-x',
    firstName: 'Test',
    stage: 'new',
    temperature: 'warm',
    assignedTo: 'agent-1',
    source: 'manual',
    interestedIn: 'buy',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('leadReport', () => {
  it('computes first-contact ms from first agent message for assigned agent (senderId filter)', () => {
    const lead = leadBase({
      id: 'lead-1',
      assignedTo: 'agent-1',
      assignedAt: new Date('2026-01-31T23:00:00Z'),
      createdAt: new Date('2026-01-31T23:00:00Z'),
      updatedAt: new Date('2026-01-31T23:00:00Z'),
    });

    const conversations: Conversation[] = [{ id: 'conv-1', leadId: 'lead-1' } as Conversation];
    const messages: Message[] = [
      // Earlier agent message from a different agent should be ignored.
      {
        id: 'm-0',
        conversationId: 'conv-1',
        senderType: 'agent',
        senderId: 'agent-2',
        createdAt: new Date('2026-01-31T23:01:00Z'),
      } as Message,
      {
        id: 'm-1',
        conversationId: 'conv-1',
        senderType: 'agent',
        senderId: 'agent-1',
        createdAt: new Date('2026-01-31T23:02:00Z'),
      } as Message,
      {
        id: 'm-2',
        conversationId: 'conv-1',
        senderType: 'agent',
        senderId: 'agent-1',
        createdAt: new Date('2026-01-31T23:03:00Z'),
      } as Message,
    ];

    const ctx: LeadReportContext = {
      now: new Date('2026-02-01T00:00:00Z'),
      period: 'all',
      conversations,
      messages,
    };

    expect(getLeadFirstContactMs(lead, ctx)).toBe(2 * 60 * 1000);
  });

  it('falls back to acceptedAt when there is no agent message for assigned agent', () => {
    const lead = leadBase({
      id: 'lead-2',
      assignedTo: 'agent-2',
      assignedAt: new Date('2026-01-31T23:00:00Z'),
      acceptedAt: new Date('2026-01-31T23:04:00Z'),
      createdAt: new Date('2026-01-31T23:00:00Z'),
      updatedAt: new Date('2026-01-31T23:00:00Z'),
    });

    const ctx: LeadReportContext = {
      now: new Date('2026-02-01T00:00:00Z'),
      period: 'all',
      conversations: [{ id: 'conv-1', leadId: 'lead-2' } as Conversation],
      messages: [
        {
          id: 'm-1',
          conversationId: 'conv-1',
          senderType: 'agent',
          senderId: 'agent-1',
          createdAt: new Date('2026-01-31T23:01:00Z'),
        } as Message,
      ],
    };

    expect(getLeadFirstContactMs(lead, ctx)).toBe(4 * 60 * 1000);
  });

  it('computes answer rate % under 5m', () => {
    const leadFast = leadBase({
      id: 'lead-fast',
      assignedTo: 'agent-1',
      assignedAt: new Date('2026-01-31T23:00:00Z'),
      acceptedAt: new Date('2026-01-31T23:04:00Z'),
    });
    const leadSlow = leadBase({
      id: 'lead-slow',
      assignedTo: 'agent-1',
      assignedAt: new Date('2026-01-31T23:00:00Z'),
      acceptedAt: new Date('2026-01-31T23:10:00Z'),
    });
    const ctx: LeadReportContext = { now: new Date('2026-02-01T00:00:00Z'), period: 'all' };
    expect(computeAnswerRatePct([leadFast, leadSlow], ctx)).toBe(50);
  });

  it('builds breakdown rows with per-bucket answer rate', () => {
    const now = new Date('2026-02-01T00:00:00Z');
    const ctx: LeadReportContext = { now, period: 'all' };
    const leads: Lead[] = [
      leadBase({
        id: 'l1',
        source: 'website',
        zip: '10001',
        priceBucket: '2-4M',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:04:00Z'),
      }),
      leadBase({
        id: 'l2',
        source: 'website',
        zip: '10001',
        priceBucket: '2-4M',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:07:00Z'),
      }),
      leadBase({
        id: 'l3',
        source: 'marketplace',
        zip: '10002',
        priceBucket: '4-6M',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:03:00Z'),
      }),
    ];

    const rows = buildLeadBreakdown(leads, 'type', ctx);
    const website = rows.find((r) => r.key === 'website');
    const marketplace = rows.find((r) => r.key === 'marketplace');

    expect(website?.leads).toBe(2);
    expect(website?.answerRate).toBe(50);
    expect(marketplace?.leads).toBe(1);
    expect(marketplace?.answerRate).toBe(100);
  });

  it('builds volume series sorted by date', () => {
    const now = new Date('2026-02-01T00:00:00Z');
    const ctx: LeadReportContext = { now, period: 'all' };
    const leads: Lead[] = [
      leadBase({ id: 'a', assignedAt: new Date('2026-01-28T10:00:00Z') }),
      leadBase({ id: 'b', assignedAt: new Date('2026-01-28T12:00:00Z') }),
      leadBase({ id: 'c', assignedAt: new Date('2026-01-30T10:00:00Z') }),
    ];

    const series = buildLeadVolumeSeries(leads, ctx);
    expect(series).toEqual([
      { date: '2026-01-28', leads: 2 },
      { date: '2026-01-30', leads: 1 },
    ]);
  });
});

