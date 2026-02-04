import { describe, it, expect } from 'vitest';
import type { Agent, Appointment, Lead } from '@/types/agents';
import type { LeadReportContext } from './leadReport';
import {
  buildFunnel,
  computeActiveLeads,
  computeCloseRatePct,
  computeConversionToAppointmentPct,
  computeNoShowRatePct,
  computeOverviewKpis,
} from './overviewKpis';

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

function appointmentBase(overrides: Partial<Appointment>): Appointment {
  return {
    id: 'apt-x',
    leadId: 'lead-x',
    agentId: 'agent-1',
    type: 'showing',
    status: 'confirmed',
    scheduledAt: new Date('2026-02-01T00:00:00Z'),
    duration: 30,
    createdAt: new Date('2026-02-01T00:00:00Z'),
    updatedAt: new Date('2026-02-01T00:00:00Z'),
    ...overrides,
  };
}

function agentBase(overrides: Partial<Agent>): Agent {
  return {
    id: 'agent-1',
    email: 'agent-1@example.com',
    phone: '+0',
    firstName: 'Test',
    lastName: 'Agent',
    specialties: [],
    zones: [],
    languages: ['en'],
    role: 'agent',
    status: 'active',
    profileCompletion: 80,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('overviewKpis', () => {
  it('computes conversion/no-show/active/close metrics', () => {
    const leads: Lead[] = [
      leadBase({
        id: 'l1',
        stage: 'contacted',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:03:00Z'),
      }),
      leadBase({
        id: 'l2',
        stage: 'closed',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:10:00Z'),
      }),
      leadBase({
        id: 'l3',
        stage: 'closed_lost',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
      }),
    ];

    const appts: Appointment[] = [
      appointmentBase({ id: 'a1', leadId: 'l1', status: 'confirmed' }),
      appointmentBase({ id: 'a2', leadId: 'l2', status: 'no_show' }),
      appointmentBase({ id: 'a3', leadId: 'other', status: 'cancelled' }),
    ];

    expect(computeConversionToAppointmentPct(leads.slice(0, 2), appts)).toBe(100);
    expect(computeNoShowRatePct(appts, 'all', new Date('2026-02-01T00:00:00Z'))).toBe(50);
    expect(computeActiveLeads(leads)).toBe(1); // contacted only
    expect(computeCloseRatePct(leads.slice(0, 2))).toBe(50);
  });

  it('computes overview KPIs and clamps profile completion', () => {
    const now = new Date('2026-02-01T00:00:00Z');
    const ctx: LeadReportContext = { now, period: 'all' };

    const leads: Lead[] = [
      leadBase({
        id: 'l1',
        stage: 'contacted',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:03:00Z'),
      }),
      leadBase({
        id: 'l2',
        stage: 'closed',
        assignedAt: new Date('2026-01-31T23:00:00Z'),
        acceptedAt: new Date('2026-01-31T23:10:00Z'),
      }),
    ];

    const appts: Appointment[] = [
      appointmentBase({ id: 'a1', leadId: 'l1', status: 'confirmed' }),
      appointmentBase({ id: 'a2', leadId: 'l2', status: 'no_show' }),
    ];

    const agent = agentBase({ profileCompletion: 120 });
    const kpis = computeOverviewKpis(leads, appts, agent, ctx);

    expect(kpis.leadsReceived).toBe(2);
    expect(kpis.answerRateUnder5m).toBe(50);
    expect(kpis.avgFirstResponseMinutes).toBe(7);
    expect(kpis.conversionToAppointmentPct).toBe(100);
    expect(kpis.noShowRatePct).toBe(50);
    expect(kpis.activeLeads).toBe(1);
    expect(kpis.closeRatePct).toBe(50);
    expect(kpis.profileCompletionPct).toBe(100);
  });

  it('builds funnel rows from stages', () => {
    const now = new Date('2026-02-01T00:00:00Z');
    const leads: Lead[] = [
      leadBase({ id: 'l1', stage: 'contacted', assignedAt: new Date('2026-01-30T00:00:00Z') }),
      leadBase({ id: 'l2', stage: 'appointment_set', assignedAt: new Date('2026-01-30T00:00:00Z') }),
      leadBase({ id: 'l3', stage: 'closed', assignedAt: new Date('2026-01-30T00:00:00Z') }),
    ];

    const funnel = buildFunnel(leads, 'all', now);
    const map = new Map(funnel.map((r) => [r.name, r.value] as const));
    expect(map.get('Leads nuevos')).toBe(3);
    expect(map.get('Contactados')).toBe(1);
    expect(map.get('Cita agendada')).toBe(1);
    expect(map.get('Cerrados')).toBe(1);
  });
});

