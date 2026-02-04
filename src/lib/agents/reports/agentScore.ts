export interface AgentScoreBreakdown {
  response: number; // 0-100
  performance: number; // 0-100
  operational: number; // 0-100
}

export interface AgentScoreResult {
  score: number; // 0-100
  label: 'Excelente' | 'Bueno' | 'Regular' | 'En progreso';
  breakdown: AgentScoreBreakdown;
}

export function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeAgentScore(breakdown: AgentScoreBreakdown): AgentScoreResult {
  const response = clampPct(breakdown.response);
  const performance = clampPct(breakdown.performance);
  const operational = clampPct(breakdown.operational);

  const score = clampPct(0.4 * response + 0.3 * performance + 0.3 * operational);
  const label: AgentScoreResult['label'] =
    score >= 85 ? 'Excelente' : score >= 70 ? 'Bueno' : score >= 50 ? 'Regular' : 'En progreso';

  return { score, label, breakdown: { response, performance, operational } };
}

