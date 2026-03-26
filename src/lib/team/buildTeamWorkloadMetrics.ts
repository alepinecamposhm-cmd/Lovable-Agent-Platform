export type TeamWorkloadInput = {
  id: string;
  activeLeads: number;
  leadLimit: number;
};

export type TeamWorkloadTone = 'healthy' | 'high' | 'overload';

export type TeamWorkloadStatus =
  | 'Capacidad saludable'
  | 'Carga alta'
  | 'Sobrecarga detectada';

export type TeamWorkloadMetrics = {
  totalActiveLeads: number;
  totalLeadCapacity: number;
  teamCapacityPct: number;
  teamCapacityFillPct: number;
  overloadedAgentsCount: number;
  status: TeamWorkloadStatus;
  tone: TeamWorkloadTone;
};

type TeamToneClasses = {
  badgeClassName: string;
  barClassName: string;
  trackClassName: string;
  textClassName: string;
};

export function buildTeamWorkloadMetrics(agents: TeamWorkloadInput[]): TeamWorkloadMetrics {
  const safeAgents = agents ?? [];
  const ratios = safeAgents.map((agent) => {
    const capacity = agent.leadLimit > 0 ? agent.leadLimit : 0;
    return capacity === 0 ? 0 : agent.activeLeads / capacity;
  });

  const overloadedAgentsCount = ratios.filter((ratio) => ratio >= 1).length;
  const hasHighLoad = ratios.some((ratio) => ratio >= 0.8);

  const totalActiveLeads = safeAgents.reduce((sum, agent) => sum + agent.activeLeads, 0);
  // Future DB: sum of configurable team/member lead limits from real settings.
  const totalLeadCapacity = safeAgents.reduce(
    (sum, agent) => sum + (agent.leadLimit > 0 ? agent.leadLimit : 0),
    0
  );

  // Future DB: active leads should come from real "open pipeline" query.
  const rawTeamCapacityPct =
    totalLeadCapacity > 0 ? Math.round((totalActiveLeads / totalLeadCapacity) * 100) : 0;
  const teamCapacityFillPct = Math.max(0, Math.min(100, rawTeamCapacityPct));

  let status: TeamWorkloadStatus = 'Capacidad saludable';
  let tone: TeamWorkloadTone = 'healthy';

  if (overloadedAgentsCount > 0) {
    // Future DB: overload count should be derived by analytics aggregate, not UI-only data.
    status = 'Sobrecarga detectada';
    tone = 'overload';
  } else if (hasHighLoad) {
    status = 'Carga alta';
    tone = 'high';
  }

  return {
    totalActiveLeads,
    totalLeadCapacity,
    teamCapacityPct: rawTeamCapacityPct,
    teamCapacityFillPct,
    overloadedAgentsCount,
    status,
    tone,
  };
}

export function getTeamWorkloadToneClasses(tone: TeamWorkloadTone): TeamToneClasses {
  if (tone === 'overload') {
    return {
      badgeClassName: 'border-amber-300 bg-amber-100 text-amber-900',
      barClassName: 'bg-[#BFA46A]',
      trackClassName: 'bg-[#F4E8D1]',
      textClassName: 'text-amber-800',
    };
  }

  if (tone === 'high') {
    return {
      badgeClassName: 'border-amber-200 bg-amber-50 text-amber-800',
      barClassName: 'bg-[#BFA46A]/85',
      trackClassName: 'bg-[#F6EFE2]',
      textClassName: 'text-amber-700',
    };
  }

  return {
    badgeClassName: 'border-[#234B3B]/25 bg-[#234B3B]/10 text-[#234B3B]',
    barClassName: 'bg-[#234B3B]',
    trackClassName: 'bg-[#E7EFEA]',
    textClassName: 'text-[#234B3B]',
  };
}

