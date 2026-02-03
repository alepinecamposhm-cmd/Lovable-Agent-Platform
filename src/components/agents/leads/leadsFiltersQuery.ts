import type { LeadStage, LeadTimeframe } from '@/types/agents';

export type LeadsViewMode = 'pipeline' | 'list' | 'crm';

export type PreApprovedFilter = 'all' | 'yes' | 'no';
export type TimeframeFilter = 'all' | LeadTimeframe;

export type AssignmentFilter =
  | { scope: 'mine' }
  | { scope: 'team' }
  | { scope: 'agent'; agentId: string };

export type StageFilter = 'all' | LeadStage[];

export type LeadsFilters = {
  stages: StageFilter;
  timeframe: TimeframeFilter;
  preApproved: PreApprovedFilter;
  assignment: AssignmentFilter;
};

export type LeadsQueryState = {
  view: LeadsViewMode;
  filters: LeadsFilters;
};

const TIMEFRAME_TO_QUERY: Record<LeadTimeframe, string> = {
  '0-3 months': '0_3',
  '3-6 months': '3_6',
  '6-12 months': '6_12',
  '12+ months': '12_plus',
};

const TIMEFRAME_FROM_QUERY: Record<string, LeadTimeframe> = Object.fromEntries(
  Object.entries(TIMEFRAME_TO_QUERY).map(([k, v]) => [v, k as LeadTimeframe])
) as Record<string, LeadTimeframe>;

const DEFAULT_STATE: LeadsQueryState = {
  view: 'pipeline',
  filters: {
    stages: 'all',
    timeframe: 'all',
    preApproved: 'all',
    assignment: { scope: 'mine' },
  },
};

function parseStages(sp: URLSearchParams): { stages: StageFilter; invalid: boolean } {
  const raw = sp.getAll('stage').flatMap((v) => v.split(',').map((s) => s.trim()).filter(Boolean));
  if (!raw.length) return { stages: 'all', invalid: false };
  const allowed: LeadStage[] = ['new', 'contacted', 'appointment_set', 'toured', 'closed', 'closed_lost'];
  const unique = Array.from(new Set(raw));
  const parsed = unique.filter((s): s is LeadStage => allowed.includes(s as LeadStage));
  const invalid = parsed.length !== unique.length;
  if (!parsed.length) return { stages: 'all', invalid: true };
  return { stages: parsed.length === allowed.length ? 'all' : parsed, invalid };
}

function parseTimeframe(sp: URLSearchParams): { timeframe: TimeframeFilter; invalid: boolean } {
  const raw = sp.get('timeframe');
  if (!raw) return { timeframe: 'all', invalid: false };
  const tf = TIMEFRAME_FROM_QUERY[raw];
  if (!tf) return { timeframe: 'all', invalid: true };
  return { timeframe: tf, invalid: false };
}

function parsePreApproved(sp: URLSearchParams): { preApproved: PreApprovedFilter; invalid: boolean } {
  const raw = sp.get('preApproved');
  if (!raw) return { preApproved: 'all', invalid: false };
  if (raw === 'yes' || raw === 'no' || raw === 'all') return { preApproved: raw, invalid: false };
  return { preApproved: 'all', invalid: true };
}

function parseAssignment(sp: URLSearchParams): { assignment: AssignmentFilter; invalid: boolean } {
  const raw = sp.get('assigned');
  if (!raw || raw === 'mine') return { assignment: { scope: 'mine' }, invalid: false };
  if (raw === 'team') return { assignment: { scope: 'team' }, invalid: false };
  if (raw.startsWith('agent:')) {
    const id = raw.slice('agent:'.length).trim();
    if (!id) return { assignment: { scope: 'mine' }, invalid: true };
    return { assignment: { scope: 'agent', agentId: id }, invalid: false };
  }
  // Back-compat: treat any other value as an agent id.
  return { assignment: { scope: 'agent', agentId: raw }, invalid: false };
}

function parseView(sp: URLSearchParams): { view: LeadsViewMode; invalid: boolean } {
  const raw = sp.get('view');
  if (!raw) return { view: 'pipeline', invalid: false };
  if (raw === 'pipeline' || raw === 'list' || raw === 'crm') return { view: raw, invalid: false };
  return { view: 'pipeline', invalid: true };
}

export function parseLeadsQuery(searchParams: URLSearchParams): { state: LeadsQueryState; hadInvalid: boolean } {
  const { stages, invalid: invalidStages } = parseStages(searchParams);
  const { timeframe, invalid: invalidTimeframe } = parseTimeframe(searchParams);
  const { preApproved, invalid: invalidPre } = parsePreApproved(searchParams);
  const { assignment, invalid: invalidAssign } = parseAssignment(searchParams);
  const { view, invalid: invalidView } = parseView(searchParams);

  const state: LeadsQueryState = {
    view,
    filters: { stages, timeframe, preApproved, assignment },
  };

  return {
    state,
    hadInvalid: invalidStages || invalidTimeframe || invalidPre || invalidAssign || invalidView,
  };
}

export function serializeLeadsQuery(
  next: LeadsQueryState,
  base?: URLSearchParams
): URLSearchParams {
  const sp = new URLSearchParams(base ? base.toString() : '');

  // view
  if (next.view && next.view !== DEFAULT_STATE.view) sp.set('view', next.view);
  else sp.delete('view');

  // stages
  sp.delete('stage');
  if (next.filters.stages !== 'all') {
    next.filters.stages.forEach((s) => sp.append('stage', s));
  }

  // timeframe
  if (next.filters.timeframe === 'all') sp.delete('timeframe');
  else sp.set('timeframe', TIMEFRAME_TO_QUERY[next.filters.timeframe]);

  // preApproved
  if (next.filters.preApproved === 'all') sp.delete('preApproved');
  else sp.set('preApproved', next.filters.preApproved);

  // assignment
  if (next.filters.assignment.scope === 'mine') sp.delete('assigned');
  else if (next.filters.assignment.scope === 'team') sp.set('assigned', 'team');
  else sp.set('assigned', `agent:${next.filters.assignment.agentId}`);

  return sp;
}

export function getDefaultLeadsQueryState(): LeadsQueryState {
  // return a fresh copy to avoid accidental mutation
  return JSON.parse(JSON.stringify(DEFAULT_STATE)) as LeadsQueryState;
}

export function formatTimeframeLabel(tf: LeadTimeframe): string {
  // UI label: match PDF format but localized suffix.
  if (tf === '12+ months') return '12+ meses';
  return tf.replace(' months', ' meses');
}

