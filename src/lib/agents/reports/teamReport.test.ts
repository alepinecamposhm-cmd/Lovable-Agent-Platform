import { describe, it, expect } from 'vitest';
import type { Agent, Lead } from '@/types/agents';
import type { LeadReportContext } from './leadReport';
import { buildTeamMemberRows, buildTeamPipeline, isLeader } from './teamReport';

function agentBase(id: string, firstName: string, role: Agent['role'] = 'agent'): Agent {
  return {
    id,
    email: `${id}@example.com`,
    phone: '+0',
    firstName,
    lastName: 'Test',
    specialties: [],
    zones: [],
    languages: ['en'],
    role,
    status: 'active',
    profileCompletion: 100,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
}

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

describe('teamReport', () => {
  it('isLeader returns true only for owner/admin/broker', () => {
    expect(isLeader('owner')).toBe(true);
    expect(isLeader('admin')).toBe(true);
    expect(isLeader('broker')).toBe(true);
    expect(isLeader('agent')).toBe(false);
    expect(isLeader('assistant')).toBe(false);
  });

  it('builds consolidated pipeline counts (excludes closed_lost stage)', () => {
    const ctx: LeadReportContext = { now: new Date('2026-02-01T00:00:00Z'), period: 'all' };
    const leads: Lead[] = [
      leadBase({ id: 'l1', stage: 'new' }),
      leadBase({ id: 'l2', stage: 'contacted' }),
      leadBase({ id: 'l3', stage: 'appointment_set' }),
      leadBase({ id: 'l4', stage: 'toured' }),
      leadBase({ id: 'l5', stage: 'closed' }),
      leadBase({ id: 'l6', stage: 'closed_lost' }),
    ];

    const rows = buildTeamPipeline(leads, ctx);
    const map = new Map(rows.map((r) => [r.stage, r.count] as const));
    expect(map.get('new')).toBe(1);
    expect(map.get('contacted')).toBe(1);
    expect(map.get('appointment_set')).toBe(1);
    expect(map.get('toured')).toBe(1);
    expect(map.get('closed')).toBe(1);
  });

  it('builds per-agent rows with stage counts and answer rate', () => {
    const members: Agent[] = [agentBase('agent-1', 'Alicia'), agentBase('agent-2', 'Bruno')];
    const now = new Date('2026-02-01T00:00:00Z');
    const ctx: LeadReportContext = { now, period: 'all' };

    const start = new Date('2026-01-31T23:00:00Z');
    const leads: Lead[] = [
      leadBase({
        id: 'a1',
        assignedTo: 'agent-1',
        stage: 'new',
        assignedAt: start,
        acceptedAt: new Date(start.getTime() + 3 * 60 * 1000),
      }),
      leadBase({
        id: 'a2',
        assignedTo: 'agent-1',
        stage: 'contacted',
        assignedAt: start,
        acceptedAt: new Date(start.getTime() + 7 * 60 * 1000),
      }),
      leadBase({
        id: 'b1',
        assignedTo: 'agent-2',
        stage: 'closed',
        assignedAt: start,
        acceptedAt: new Date(start.getTime() + 2 * 60 * 1000),
      }),
    ];

    const rows = buildTeamMemberRows(leads, members, ctx);
    expect(rows.length).toBe(2);

    const a = rows.find((r) => r.agentId === 'agent-1');
    const b = rows.find((r) => r.agentId === 'agent-2');

    expect(a?.totalLeads).toBe(2);
    expect(a?.answerRate).toBe(50);
    expect(a?.stageCounts.new).toBe(1);
    expect(a?.stageCounts.contacted).toBe(1);

    expect(b?.totalLeads).toBe(1);
    expect(b?.answerRate).toBe(100);
    expect(b?.stageCounts.closed).toBe(1);
  });
});

