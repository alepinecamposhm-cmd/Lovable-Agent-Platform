import { useSyncExternalStore } from 'react';
import { parseReportsPeriod, REPORTS_PERIOD_STORAGE_KEY, type ReportsPeriod } from './period';

const listeners = new Set<() => void>();

function load(): ReportsPeriod {
  if (typeof window === 'undefined') return '30d';
  return parseReportsPeriod(window.localStorage.getItem(REPORTS_PERIOD_STORAGE_KEY));
}

function save(period: ReportsPeriod) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REPORTS_PERIOD_STORAGE_KEY, period);
}

let period: ReportsPeriod = load();
let cached: { period: ReportsPeriod } | null = null;

function emit() {
  cached = null;
  listeners.forEach((l) => l());
}

export function getReportsPeriod(): ReportsPeriod {
  return period;
}

export function setReportsPeriod(next: ReportsPeriod) {
  if (period === next) return;
  period = next;
  save(period);
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!cached) cached = { period };
  return cached;
}

export function useReportsPeriod(): ReportsPeriod {
  return useSyncExternalStore(subscribe, () => getSnapshot().period, () => getSnapshot().period);
}

