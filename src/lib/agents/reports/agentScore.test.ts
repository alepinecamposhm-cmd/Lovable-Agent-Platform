import { describe, it, expect } from 'vitest';
import { computeAgentScore } from './agentScore';

describe('computeAgentScore', () => {
  it('computes weighted score and clamps to 0-100', () => {
    const result = computeAgentScore({ response: 100, performance: 50, operational: 0 });
    // 0.4*100 + 0.3*50 + 0.3*0 = 55
    expect(result.score).toBe(55);
    expect(result.breakdown.response).toBe(100);
  });

  it('assigns labels by thresholds', () => {
    expect(computeAgentScore({ response: 90, performance: 90, operational: 90 }).label).toBe('Excelente');
    expect(computeAgentScore({ response: 70, performance: 70, operational: 70 }).label).toBe('Bueno');
    expect(computeAgentScore({ response: 50, performance: 50, operational: 50 }).label).toBe('Regular');
    expect(computeAgentScore({ response: 10, performance: 10, operational: 10 }).label).toBe('En progreso');
  });
});

