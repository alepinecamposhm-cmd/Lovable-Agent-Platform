import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';
import { mockAppointments } from '../fixtures';
import type { Appointment, AppointmentStatus } from '@/types/agents';

const STORAGE_KEY = 'agenthub_appointments';
const listeners = new Set<() => void>();

function load(): Appointment[] {
  if (typeof window === 'undefined') return mockAppointments;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockAppointments;
  try {
    return JSON.parse(raw).map((apt: any) => ({
      ...apt,
      scheduledAt: apt.scheduledAt ? parseISO(apt.scheduledAt) : new Date(),
      createdAt: apt.createdAt ? parseISO(apt.createdAt) : new Date(),
      updatedAt: apt.updatedAt ? parseISO(apt.updatedAt) : new Date(),
    }));
  } catch (e) {
    console.error('Failed to parse appointments', e);
    return mockAppointments;
  }
}

function save(data: Appointment[]) {
  if (typeof window === 'undefined') return;
  const serializable = data.map((apt) => ({
    ...apt,
    scheduledAt: formatISO(apt.scheduledAt),
    createdAt: formatISO(apt.createdAt),
    updatedAt: formatISO(apt.updatedAt),
  }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let appointments = load();

function emit() {
  listeners.forEach((l) => l());
}

type AppointmentInput = Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>> & {
  scheduledAt: Date;
  leadId: string;
  agentId: string;
  type: Appointment['type'];
  status?: AppointmentStatus;
};

export function addAppointment(input: AppointmentInput) {
  const now = new Date();
  const apt: Appointment = {
    id: `apt-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    status: input.status ?? 'pending',
    duration: input.duration ?? 60,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  appointments = [apt, ...appointments];
  save(appointments);
  emit();
  return apt;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listAppointments(): Appointment[] {
  return appointments
    .slice()
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export function getAppointment(id: string) {
  return appointments.find((a) => a.id === id);
}

export function updateAppointment(
  id: string,
  patch: Partial<Appointment> & { scheduledAt?: Date }
) {
  let previous: Appointment | undefined;
  appointments = appointments.map((apt) => {
    if (apt.id !== id) return apt;
    previous = apt;
    return {
      ...apt,
      ...patch,
      scheduledAt: patch.scheduledAt ?? apt.scheduledAt,
      updatedAt: new Date(),
    };
  });
  if (previous) {
    save(appointments);
    emit();
  }
  return previous;
}

export function setAppointmentStatus(id: string, status: AppointmentStatus) {
  return updateAppointment(id, { status });
}

let cachedSnapshot: { appointments: Appointment[]; _raw: Appointment[] } | null = null;

function getSnapshot() {
  if (!cachedSnapshot || cachedSnapshot._raw !== appointments) {
    cachedSnapshot = {
      appointments: listAppointments(),
      _raw: appointments,
    };
  }
  return cachedSnapshot;
}

export function useAppointmentStore() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}
