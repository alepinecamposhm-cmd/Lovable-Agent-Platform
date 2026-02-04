import type { Lead, LeadStage } from '@/types/agents';

export type TeamReportRange = 'all' | '7d' | '30d';

export type TeamReportStage = Extract<
  LeadStage,
  'new' | 'contacted' | 'appointment_set' | 'toured' | 'closed' | 'closed_lost'
>;

export const TEAM_REPORT_STAGES: TeamReportStage[] = [
  'new',
  'contacted',
  'appointment_set',
  'toured',
  'closed',
  'closed_lost',
];

export type TeamReportRow = {
  agentId: string;
  leads: number;
  answeredUnder5mPct: number;
  answerRatePct: number;
} & Record<TeamReportStage, number>;

export type TeamReport = {
  totals: Record<TeamReportStage, number>;
  rows: TeamReportRow[];
};

export function filterLeadsByRange(leads: Lead[], range: TeamReportRange, now = new Date()): Lead[] {
  if (range === 'all') return leads;
  const days = range === '7d' ? 7 : 30;
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() - days);
  return leads.filter((l) => l.createdAt >= minDate);
}

function calcAnswerMetrics(leads: Lead[]) {
  const total = leads.length;
  let answered = 0;
  let answeredUnder5m = 0;
  for (const lead of leads) {
    if (!lead.acceptedAt) continue;
    answered += 1;
    const start = lead.assignedAt ?? lead.createdAt;
    const deltaMs = lead.acceptedAt.getTime() - start.getTime();
    if (deltaMs <= 5 * 60 * 1000) answeredUnder5m += 1;
  }
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  return {
    total,
    answered,
    answeredUnder5m,
    answerRatePct: pct(answered),
    answeredUnder5mPct: pct(answeredUnder5m),
  };
}

function emptyStageCounts(): Record<TeamReportStage, number> {
  return TEAM_REPORT_STAGES.reduce<Record<TeamReportStage, number>>((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {} as Record<TeamReportStage, number>);
}

export function calcTeamReport(leads: Lead[], agentIds: string[]): TeamReport {
  const totals = emptyStageCounts();
  for (const lead of leads) {
    const stage = lead.stage;
    if (TEAM_REPORT_STAGES.includes(stage as TeamReportStage)) {
      totals[stage as TeamReportStage] += 1;
    }
  }

  const rows: TeamReportRow[] = agentIds.map((agentId) => {
    const agentLeads = leads.filter((l) => l.assignedTo === agentId);
    const stageCounts = emptyStageCounts();
    for (const lead of agentLeads) {
      const stage = lead.stage;
      if (TEAM_REPORT_STAGES.includes(stage as TeamReportStage)) {
        stageCounts[stage as TeamReportStage] += 1;
      }
    }
    const metrics = calcAnswerMetrics(agentLeads);
    return {
      agentId,
      leads: metrics.total,
      answeredUnder5mPct: metrics.answeredUnder5mPct,
      answerRatePct: metrics.answerRatePct,
      ...stageCounts,
    };
  });

  return { totals, rows };
}

