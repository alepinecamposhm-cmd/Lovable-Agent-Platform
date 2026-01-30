import { useSyncExternalStore } from 'react';
import { mockLeads, mockAppointments, mockTeamAgents } from '@/lib/agents/fixtures';
import type { Lead, Appointment } from '@/types/agents';

export interface TeamKpi {
  agentId: string;
  agentName: string;
  responseRate: number;
  appointments: number;
  closed: number;
}

export interface TeamReportState {
  kpis: TeamKpi[];
  leads: Lead[];
  appointments: Appointment[];
}

let snapshot: TeamReportState | null = null;
const listeners = new Set<() => void>();

function compute(): TeamReportState {
  const leads = mockLeads;
  const appointments = mockAppointments;

  const kpis: TeamKpi[] = mockTeamAgents.map((agent) => {
    const agentLeads = leads.filter((l) => l.assignedTo === agent.id);
    const responded = agentLeads.filter((l) => l.lastContactedAt).length;
    const responseRate = agentLeads.length ? Math.round((responded / agentLeads.length) * 100) : 0;
    const appointmentsCount = appointments.filter((a) => a.agentId === agent.id).length;
    const closed = agentLeads.filter((l) => l.stage === 'closed').length;

    return {
      agentId: agent.id,
      agentName: `${agent.firstName} ${agent.lastName}`,
      responseRate,
      appointments: appointmentsCount,
      closed,
    };
  });

  return { kpis, leads, appointments };
}

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function useTeamReportStore(): TeamReportState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): TeamReportState {
  if (!snapshot) snapshot = compute();
  return snapshot;
}

// hook to force recompute if needed later (e.g., after adding data)
export function refreshTeamReport() {
  emit();
}
