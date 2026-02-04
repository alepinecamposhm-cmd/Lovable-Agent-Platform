import { describe, it, expect } from 'vitest';
import { buildLeadsCsv, leadsToCsvRows } from './exportLeadsCsv';
import type { Lead } from '@/types/agents';

describe('exportLeadsCsv', () => {
  it('buildLeadsCsv returns empty string for empty dataset', () => {
    expect(buildLeadsCsv([])).toBe('');
  });

  it('buildLeadsCsv escapes commas and quotes correctly', () => {
    const d = new Date('2026-02-03T10:00:00.000Z');
    const lead: Lead = {
      id: 'lead-1',
      firstName: 'Ana',
      lastName: 'Doe, "Jr"',
      stage: 'new',
      temperature: 'warm',
      assignedTo: 'agent-1',
      source: 'marketplace',
      interestedIn: 'buy',
      budgetMin: 100,
      budgetMax: 200,
      timeframe: '0-3 months',
      preApproved: true,
      email: 'ana@example.com',
      phone: '555-000',
      createdAt: d,
      updatedAt: d,
    };

    const csv = buildLeadsCsv([lead]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('id,name,stage,assignedTo,source,timeframe,preApproved,budgetMin,budgetMax,email,phone,createdAt,updatedAt');
    expect(row).toContain('lead-1,');
    expect(row).toContain('"Ana Doe, ""Jr"""');
    expect(row).toContain(',new,');
    expect(row).toContain(',marketplace,');
    expect(row).toContain(',0-3 months,');
    expect(row).toContain(',yes,');
    expect(row).toContain(',100,200,');
    expect(row).toContain(',ana@example.com,555-000,');
    expect(row).toContain(d.toISOString());
  });

  it('leadsToCsvRows maps optional values to empty strings', () => {
    const d = new Date('2026-02-03T10:00:00.000Z');
    const lead: Lead = {
      id: 'lead-2',
      firstName: 'Bob',
      stage: 'contacted',
      temperature: 'cold',
      assignedTo: 'agent-2',
      source: 'referral',
      interestedIn: 'rent',
      createdAt: d,
      updatedAt: d,
    };
    const row = leadsToCsvRows([lead])[0];
    expect(row.timeframe).toBe('');
    expect(row.preApproved).toBe('');
    expect(row.budgetMin).toBe('');
    expect(row.budgetMax).toBe('');
    expect(row.email).toBe('');
    expect(row.phone).toBe('');
  });
});

