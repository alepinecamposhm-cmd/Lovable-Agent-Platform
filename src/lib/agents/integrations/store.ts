import { useSyncExternalStore } from 'react';

export type IntegrationId = 'dotloop' | 'showingtime';
export type IntegrationState = {
  id: IntegrationId;
  name: string;
  description: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastSyncedAt?: Date;
};

const STORAGE_KEY = 'agenthub_integrations';
const listeners = new Set<() => void>();

const defaults: IntegrationState[] = [
  { id: 'dotloop', name: 'Dotloop', description: 'Inicia transacciones desde el CRM.', status: 'disconnected' },
  { id: 'showingtime', name: 'ShowingTime', description: 'Sincroniza citas y disponibilidad.', status: 'disconnected' },
];

function hydrate(raw: any): IntegrationState {
  return { ...raw, lastSyncedAt: raw.lastSyncedAt ? new Date(raw.lastSyncedAt) : undefined };
}

function load(): IntegrationState[] {
  if (typeof window === 'undefined') return defaults;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    return JSON.parse(raw).map(hydrate);
  } catch (e) {
    return defaults;
  }
}

function save(data: IntegrationState[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let integrations = load();
let snapshot: IntegrationState[] | null = null;

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listIntegrations() {
  return integrations.slice();
}

export function connectIntegration(id: IntegrationId) {
  integrations = integrations.map((i) =>
    i.id === id ? { ...i, status: 'connected', lastSyncedAt: new Date() } : i
  );
  save(integrations);
  emit();
}

export function disconnectIntegration(id: IntegrationId) {
  integrations = integrations.map((i) =>
    i.id === id ? { ...i, status: 'disconnected' } : i
  );
  save(integrations);
  emit();
}

export function useIntegrationStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function getSnapshot() {
  if (!snapshot) snapshot = listIntegrations();
  return snapshot;
}
