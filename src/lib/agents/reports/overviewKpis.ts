import type { Appointment, Agent, Lead } from '@/types/agents';
import { isWithinPeriod, type ReportsPeriod } from './period';
import type { LeadReportContext } from './leadReport';
import { computeAnswerRatePct, computeAvgFirstResponseMinutes, filterLeadsByPeriod } from './leadReport';

export interface OverviewKpis {
  leadsReceived: number;
  answerRateUnder5m: number; // 0-100
  avgFirstResponseMinutes: number | null;
  conversionToAppointmentPct: number; // 0-100
  noShowRatePct: number; // 0-100
  activeLeads: number;
  closeRatePct: number; // 0-100
  profileCompletionPct: number; // 0-100
}

export function computeConversionToAppointmentPct(leads: Lead[], appointments: Appointment[]): number {
  if (!leads.length) return 0;
  const leadIds = new Set(leads.map((l) => l.id));
  const converted = new Set<string>();
  for (const apt of appointments) {
    if (leadIds.has(apt.leadId)) converted.add(apt.leadId);
  }
  return Math.round((converted.size / leads.length) * 100);
}

export function computeNoShowRatePct(appointments: Appointment[], period: ReportsPeriod, now: Date): number {
  const relevant = period === 'all' ? appointments : appointments.filter((a) => isWithinPeriod(a.scheduledAt, now, period));
  const scored = relevant.filter((a) => a.status === 'confirmed' || a.status === 'completed' || a.status === 'no_show');
  if (!scored.length) return 0;
  const noShow = scored.filter((a) => a.status === 'no_show').length;
  return Math.round((noShow / scored.length) * 100);
}

export function computeCloseRatePct(leads: Lead[]): number {
  if (!leads.length) return 0;
  const closed = leads.filter((l) => l.stage === 'closed').length;
  return Math.round((closed / leads.length) * 100);
}

export function computeActiveLeads(leads: Lead[]): number {
  return leads.filter((l) => l.stage !== 'closed' && l.stage !== 'closed_lost').length;
}

export function computeOverviewKpis(
  allLeads: Lead[],
  allAppointments: Appointment[],
  agent: Agent,
  ctx: LeadReportContext,
): OverviewKpis {
  const leads = filterLeadsByPeriod(allLeads, ctx.period, ctx.now);

  return {
    leadsReceived: leads.length,
    answerRateUnder5m: computeAnswerRatePct(leads, ctx),
    avgFirstResponseMinutes: computeAvgFirstResponseMinutes(leads, ctx),
    conversionToAppointmentPct: computeConversionToAppointmentPct(leads, allAppointments),
    noShowRatePct: computeNoShowRatePct(allAppointments, ctx.period, ctx.now),
    activeLeads: computeActiveLeads(leads),
    closeRatePct: computeCloseRatePct(leads),
    profileCompletionPct: Math.max(0, Math.min(100, Math.round(agent.profileCompletion))),
  };
}

export interface FunnelRow {
  name: string;
  value: number;
}

export function buildFunnel(leads: Lead[], period: ReportsPeriod, now: Date): FunnelRow[] {
  const filtered = filterLeadsByPeriod(leads, period, now);
  return [
    { name: 'Leads nuevos', value: filtered.length },
    { name: 'Contactados', value: filtered.filter((l) => l.stage === 'contacted').length },
    { name: 'Cita agendada', value: filtered.filter((l) => l.stage === 'appointment_set').length },
    { name: 'Visitas', value: filtered.filter((l) => l.stage === 'toured').length },
    { name: 'Cerrados', value: filtered.filter((l) => l.stage === 'closed').length },
  ];
}

