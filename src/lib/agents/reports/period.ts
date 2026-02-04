export type ReportsPeriod = '7d' | '30d' | '90d' | 'all';

export const REPORTS_PERIOD_STORAGE_KEY = 'agenthub_reports_period';

export const REPORTS_PERIOD_OPTIONS: ReadonlyArray<{ value: ReportsPeriod; label: string }> = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All' },
];

export function parseReportsPeriod(raw: unknown): ReportsPeriod {
  if (raw === '7d' || raw === '30d' || raw === '90d' || raw === 'all') return raw;
  return '30d';
}

export function getPeriodDays(period: ReportsPeriod): number | null {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '90d') return 90;
  return null;
}

export function getPeriodStart(now: Date, period: ReportsPeriod): Date | null {
  const days = getPeriodDays(period);
  if (!days) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function isWithinPeriod(date: Date, now: Date, period: ReportsPeriod): boolean {
  const start = getPeriodStart(now, period);
  if (!start) return true;
  return date.getTime() >= start.getTime() && date.getTime() <= now.getTime();
}

