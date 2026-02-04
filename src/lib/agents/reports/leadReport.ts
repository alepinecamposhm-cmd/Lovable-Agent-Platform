import type { Conversation, Lead, Message } from '@/types/agents';
import { isWithinPeriod, type ReportsPeriod } from './period';

export type LeadBreakdownKey = 'type' | 'zip' | 'price';

export interface LeadReportContext {
  now: Date;
  period: ReportsPeriod;
  conversations?: Conversation[];
  messages?: Message[];
}

export interface LeadVolumePoint {
  date: string; // YYYY-MM-DD
  leads: number;
}

export interface LeadBreakdownRow {
  key: string;
  leads: number;
  answeredWithin5m: number;
  answerRate: number; // 0-100
}

export function getLeadStartAt(lead: Lead): Date {
  return lead.assignedAt ?? lead.createdAt;
}

export function getFirstAgentMessageAt(
  leadId: string,
  conversations: Conversation[],
  messages: Message[],
  agentId?: string,
): Date | undefined {
  const convIdSet = new Set(conversations.filter((c) => c.leadId === leadId).map((c) => c.id));
  if (convIdSet.size === 0) return undefined;

  let first: Date | undefined;
  for (const msg of messages) {
    if (!convIdSet.has(msg.conversationId)) continue;
    if (msg.senderType !== 'agent') continue;
    if (agentId && msg.senderId !== agentId) continue;
    const createdAt = msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt);
    if (!first || createdAt.getTime() < first.getTime()) first = createdAt;
  }
  return first;
}

export function getLeadFirstContactAt(lead: Lead, ctx: LeadReportContext): Date | undefined {
  const firstFromMessages =
    lead.id &&
    ctx.conversations &&
    ctx.messages &&
    getFirstAgentMessageAt(lead.id, ctx.conversations, ctx.messages, lead.assignedTo);
  if (firstFromMessages) return firstFromMessages;
  if (lead.lastContactedAt) return lead.lastContactedAt;
  if (lead.acceptedAt) return lead.acceptedAt;
  return undefined;
}

export function getLeadFirstContactMs(lead: Lead, ctx: LeadReportContext): number | undefined {
  const startAt = getLeadStartAt(lead);
  const firstContactAt = getLeadFirstContactAt(lead, ctx);
  if (!firstContactAt) return undefined;
  return Math.max(0, firstContactAt.getTime() - startAt.getTime());
}

export function filterLeadsByPeriod(leads: Lead[], period: ReportsPeriod, now: Date): Lead[] {
  if (period === 'all') return leads.slice();
  return leads.filter((l) => isWithinPeriod(getLeadStartAt(l), now, period));
}

export function computeAnswerRatePct(leads: Lead[], ctx: LeadReportContext, thresholdMs = 5 * 60 * 1000): number {
  if (!leads.length) return 0;
  const answered = leads.filter((l) => {
    const ms = getLeadFirstContactMs(l, ctx);
    return typeof ms === 'number' && ms <= thresholdMs;
  }).length;
  return Math.round((answered / leads.length) * 100);
}

export function computeAvgFirstResponseMinutes(leads: Lead[], ctx: LeadReportContext): number | null {
  const msValues = leads
    .map((l) => getLeadFirstContactMs(l, ctx))
    .filter((v): v is number => typeof v === 'number');
  if (!msValues.length) return null;
  const avgMs = msValues.reduce((a, b) => a + b, 0) / msValues.length;
  return Math.round(avgMs / 60000);
}

function getBreakdownKey(lead: Lead, key: LeadBreakdownKey): string {
  if (key === 'type') return lead.source ?? '—';
  if (key === 'zip') return lead.zip ?? '—';
  return lead.priceBucket ?? '—';
}

export function buildLeadBreakdown(
  leads: Lead[],
  breakdown: LeadBreakdownKey,
  ctx: LeadReportContext,
  thresholdMs = 5 * 60 * 1000,
): LeadBreakdownRow[] {
  const buckets = new Map<string, { leads: Lead[] }>();
  for (const lead of leads) {
    const bucketKey = getBreakdownKey(lead, breakdown);
    const existing = buckets.get(bucketKey);
    if (existing) existing.leads.push(lead);
    else buckets.set(bucketKey, { leads: [lead] });
  }

  const rows: LeadBreakdownRow[] = [];
  for (const [key, bucket] of buckets.entries()) {
    const answeredWithin5m = bucket.leads.filter((l) => {
      const ms = getLeadFirstContactMs(l, ctx);
      return typeof ms === 'number' && ms <= thresholdMs;
    }).length;
    rows.push({
      key,
      leads: bucket.leads.length,
      answeredWithin5m,
      answerRate: bucket.leads.length ? Math.round((answeredWithin5m / bucket.leads.length) * 100) : 0,
    });
  }

  return rows.sort((a, b) => b.leads - a.leads || a.key.localeCompare(b.key));
}

export function buildLeadVolumeSeries(leads: Lead[], ctx: LeadReportContext): LeadVolumePoint[] {
  const filtered = filterLeadsByPeriod(leads, ctx.period, ctx.now);
  const map = new Map<string, number>();
  for (const lead of filtered) {
    const d = getLeadStartAt(lead);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, leads: count }));
}
