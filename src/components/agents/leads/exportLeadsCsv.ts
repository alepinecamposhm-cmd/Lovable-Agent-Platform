import type { Lead } from '@/types/agents';

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const needsQuotes = /[",\n\r]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export type LeadCsvRow = {
  id: string;
  name: string;
  stage: string;
  assignedTo: string;
  source: string;
  timeframe: string;
  preApproved: string;
  budgetMin: string;
  budgetMax: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export function leadsToCsvRows(leads: Lead[]): LeadCsvRow[] {
  return leads.map((l) => ({
    id: l.id,
    name: `${l.firstName} ${l.lastName || ''}`.trim(),
    stage: l.stage,
    assignedTo: l.assignedTo,
    source: l.source,
    timeframe: l.timeframe || '',
    preApproved: typeof l.preApproved === 'boolean' ? (l.preApproved ? 'yes' : 'no') : '',
    budgetMin: typeof l.budgetMin === 'number' ? String(l.budgetMin) : '',
    budgetMax: typeof l.budgetMax === 'number' ? String(l.budgetMax) : '',
    email: l.email || '',
    phone: l.phone || '',
    createdAt: l.createdAt?.toISOString?.() ? l.createdAt.toISOString() : '',
    updatedAt: l.updatedAt?.toISOString?.() ? l.updatedAt.toISOString() : '',
  }));
}

export function buildLeadsCsv(leads: Lead[]) {
  const rows = leadsToCsvRows(leads);
  const header = Object.keys(rows[0] || ({} as LeadCsvRow));
  const lines = [header.join(',')];
  rows.forEach((row) => {
    const values = header.map((key) => csvEscape((row as any)[key]));
    lines.push(values.join(','));
  });
  return lines.join('\n');
}

export function downloadLeadsCsv(leads: Lead[], filenamePrefix = 'leads-export') {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${date}.csv`;
  const csv = buildLeadsCsv(leads);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return filename;
}

