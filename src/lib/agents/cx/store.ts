import { useSyncExternalStore } from 'react';
import { mockAgentFeedback } from '../fixtures';
import type { AgentFeedback } from '@/types/agents';

const STORAGE_KEY = 'agenthub_cx_feedback';
const listeners = new Set<() => void>();

function hydrate(raw: any): AgentFeedback {
  return { ...raw, createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date() } as AgentFeedback;
}

function load(): AgentFeedback[] {
  if (typeof window === 'undefined') return mockAgentFeedback;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockAgentFeedback;
  try {
    return JSON.parse(raw).map(hydrate);
  } catch (e) {
    return mockAgentFeedback;
  }
}

function save(data: AgentFeedback[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let feedback = load();
let snapshot: AgentFeedback[] | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listFeedback() {
  return feedback.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function addFeedback(entry: Omit<AgentFeedback, 'id' | 'createdAt'>) {
  const item: AgentFeedback = {
    id: `fb-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    createdAt: new Date(),
    ...entry,
  };
  feedback = [item, ...feedback];
  save(feedback);
  emit();
  return item;
}

function getSnapshot() {
  if (!snapshot) snapshot = listFeedback();
  return snapshot;
}

export function useCxStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
