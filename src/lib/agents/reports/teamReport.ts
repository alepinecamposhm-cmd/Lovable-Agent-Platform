import type { Agent, Lead, LeadStage, TeamRole } from '@/types/agents';
import type { LeadReportContext } from './leadReport';
import { computeAnswerRatePct, filterLeadsByPeriod } from './leadReport';

export const TEAM_PIPELINE_STAGES: ReadonlyArray<LeadStage> = [
  'new',
  'contacted',
  'appointment_set',
  'toured',
  'closed',
];

export function isLeader(role: TeamRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'broker';
}

export interface TeamPipelineRow {
  stage: LeadStage;
  count: number;
}

export interface TeamMemberReportRow {
  agentId: string;
  name: string;
  avatarUrl?: string;
  totalLeads: number;
  answerRate: number; // 0-100
  stageCounts: Record<LeadStage, number>;
}

export function buildTeamPipeline(leads: Lead[], ctx: LeadReportContext): TeamPipelineRow[] {
  const filtered = filterLeadsByPeriod(leads, ctx.period, ctx.now);
  const counts: Record<LeadStage, number> = {
    new: 0,
    contacted: 0,
    appointment_set: 0,
    toured: 0,
    closed: 0,
    closed_lost: 0,
  };
  for (const lead of filtered) {
    if (TEAM_PIPELINE_STAGES.includes(lead.stage)) counts[lead.stage] += 1;
  }
  return TEAM_PIPELINE_STAGES.map((stage) => ({ stage, count: counts[stage] }));
}

export function buildTeamMemberRows(leads: Lead[], members: Agent[], ctx: LeadReportContext): TeamMemberReportRow[] {
  const filtered = filterLeadsByPeriod(leads, ctx.period, ctx.now);

  const byAgent = new Map<string, Lead[]>();
  for (const lead of filtered) {
    const arr = byAgent.get(lead.assignedTo);
    if (arr) arr.push(lead);
    else byAgent.set(lead.assignedTo, [lead]);
  }

  const rows: TeamMemberReportRow[] = [];
  for (const member of members) {
    const memberLeads = byAgent.get(member.id) ?? [];
    const stageCounts: Record<LeadStage, number> = {
      new: 0,
      contacted: 0,
      appointment_set: 0,
      toured: 0,
      closed: 0,
      closed_lost: 0,
    };
    for (const l of memberLeads) {
      stageCounts[l.stage] += 1;
    }
    rows.push({
      agentId: member.id,
      name: `${member.firstName} ${member.lastName ?? ''}`.trim(),
      avatarUrl: member.avatarUrl,
      totalLeads: memberLeads.length,
      answerRate: computeAnswerRatePct(memberLeads, ctx),
      stageCounts,
    });
  }

  return rows
    .filter((r) => r.totalLeads > 0)
    .sort((a, b) => b.totalLeads - a.totalLeads || b.answerRate - a.answerRate);
}

