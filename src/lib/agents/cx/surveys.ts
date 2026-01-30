import { useSyncExternalStore } from 'react';
import { mockSurveys } from '../fixtures';
import type { CxSurvey, CxSurveyStatus } from '@/types/agents';
import { addFeedback } from './store';

const STORAGE_KEY = 'agenthub_cx_surveys';
const listeners = new Set<() => void>();

function hydrate(raw: any): CxSurvey {
  return {
    ...raw,
    scheduledAt: raw.scheduledAt ? new Date(raw.scheduledAt) : new Date(),
    sentAt: raw.sentAt ? new Date(raw.sentAt) : undefined,
    receivedAt: raw.receivedAt ? new Date(raw.receivedAt) : undefined,
  } as CxSurvey;
}

function load(): CxSurvey[] {
  if (typeof window === 'undefined') return mockSurveys;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockSurveys;
  try {
    return JSON.parse(raw).map(hydrate);
  } catch (e) {
    return mockSurveys;
  }
}

function save(data: CxSurvey[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let surveys = load();
let snapshot: CxSurvey[] | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listSurveys(): CxSurvey[] {
  return surveys.slice().sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
}

export function sendDueSurveys(now = new Date()) {
  let changed = false;
  surveys = surveys.map((s) => {
    if (s.status === 'scheduled' && s.scheduledAt <= now) {
      changed = true;
      return { ...s, status: 'sent', sentAt: now };
    }
    return s;
  });
  if (changed) {
    save(surveys);
    emit();
  }
}

export function resendSurvey(id: string) {
  surveys = surveys.map((s) => (s.id === id ? { ...s, status: 'sent', sentAt: new Date() } : s));
  save(surveys);
  emit();
}

export function recordSurveyResponse(id: string, rating: number) {
  surveys = surveys.map((s) => (s.id === id ? { ...s, status: 'received', rating, receivedAt: new Date() } : s));
  const survey = surveys.find((s) => s.id === id);
  if (survey) {
    addFeedback({ agentId: survey.agentId, rating, comment: 'Encuesta automática', source: 'survey' });
  }
  save(surveys);
  emit();
}

export function updateStatus(id: string, status: CxSurveyStatus) {
  surveys = surveys.map((s) => (s.id === id ? { ...s, status } : s));
  save(surveys);
  emit();
}

function getSnapshot() {
  if (!snapshot) snapshot = listSurveys();
  return snapshot;
}

export function useSurveyStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
