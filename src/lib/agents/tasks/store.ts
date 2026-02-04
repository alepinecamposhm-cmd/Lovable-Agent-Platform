import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';
import { mockLeads, mockTasks } from '../fixtures';
import type { Lead, Task } from '@/types/agents';

const STORAGE_KEY = 'agenthub_tasks';
const listeners = new Set<() => void>();

function hydrateTask(raw: unknown): Task {
  const r = raw as Record<string, unknown>;
  return {
    ...(r as Task),
    dueAt: r.dueAt ? parseISO(String(r.dueAt)) : undefined,
    createdAt: r.createdAt ? parseISO(String(r.createdAt)) : new Date(),
    completedAt: r.completedAt ? parseISO(String(r.completedAt)) : undefined,
    snoozedUntil: r.snoozedUntil ? parseISO(String(r.snoozedUntil)) : undefined,
  };
}

function load(): Task[] {
  if (typeof window === 'undefined') return mockTasks;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockTasks;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return mockTasks;
    return parsed.map(hydrateTask);
  } catch (e) {
    console.error('Failed to parse tasks', e);
    return mockTasks;
  }
}

function save(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  const serializable = tasks.map((t) => ({
    ...t,
    dueAt: t.dueAt ? formatISO(t.dueAt) : undefined,
    createdAt: formatISO(t.createdAt),
    completedAt: t.completedAt ? formatISO(t.completedAt) : undefined,
    snoozedUntil: t.snoozedUntil ? formatISO(t.snoozedUntil) : undefined,
  }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let tasks = load();

function emit() {
  cachedSnapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function existsOriginKey(originKey?: string) {
  if (!originKey) return false;
  return tasks.some((t) => t.originKey === originKey);
}

function baseTask(input: Partial<Task> & { title: string; agentId?: string }): Task {
  const now = new Date();
  return {
    id: `task-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    agentId: input.agentId || 'agent-1',
    title: input.title,
    description: input.description,
    leadId: input.leadId,
    listingId: input.listingId,
    priority: input.priority || 'medium',
    status: 'pending',
    dueAt: input.dueAt,
    tags: input.tags || [],
    origin: input.origin || 'manual',
    originKey: input.originKey,
    createdAt: now,
  } as Task;
}

export function addTask(input: Partial<Task> & { title: string; agentId?: string }) {
  if (existsOriginKey(input.originKey)) return tasks.find((t) => t.originKey === input.originKey)!;
  const task = baseTask(input);
  tasks = [task, ...tasks];
  save(tasks);
  emit();
  return task;
}

export function completeTask(id: string) {
  let previous: Task | undefined;
  tasks = tasks.map((t) => {
    if (t.id !== id) return t;
    previous = t;
    return { ...t, status: 'completed', completedAt: new Date() };
  });
  if (previous) {
    save(tasks);
    emit();
  }
  return previous;
}

export function undoCompleteTask(id: string) {
  let previous: Task | undefined;
  tasks = tasks.map((t) => {
    if (t.id !== id) return t;
    previous = t;
    return { ...t, status: 'pending', completedAt: undefined };
  });
  if (previous) {
    save(tasks);
    emit();
  }
  return previous;
}

export function snoozeTask(id: string, nextDate: Date) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, dueAt: nextDate, snoozedUntil: nextDate } : t));
  save(tasks);
  emit();
}

export function listTasks() {
  return tasks.slice().sort((a, b) => (a.dueAt?.getTime() || 0) - (b.dueAt?.getTime() || 0));
}

export function getPendingCount() {
  return tasks.filter((t) => t.status === 'pending').length;
}

export function getTasksByLead(leadId: string) {
  return listTasks().filter((t) => t.leadId === leadId);
}

export function getTasksToday() {
  const now = new Date();
  return listTasks().filter((t) => {
    if (!t.dueAt) return false;
    return t.dueAt.toDateString() === now.toDateString() && t.status === 'pending';
  });
}

// Triggers
export function ensureLeadSlaTasks(leads: Lead[], thresholdHours = 6) {
  const now = Date.now();
  leads.forEach((lead) => {
    if (lead.stage !== 'new') return;
    if (lead.lastContactedAt) return;
    const ageHours = (now - lead.createdAt.getTime()) / 36e5;
    if (ageHours < thresholdHours) return;
    addTask({
      title: `Responder a ${lead.firstName}`,
      priority: 'high',
      leadId: lead.id,
      dueAt: new Date(),
      origin: 'auto',
      originKey: `sla-${lead.id}`,
      tags: ['SLA'],
    });
  });
}

export function addNoShowFollowUp(appointment: { id: string; leadId?: string; lead?: Lead; scheduledAt: Date }) {
  if (!appointment.leadId) return;
  addTask({
    title: `Reprogramar visita con ${appointment.lead?.firstName || 'lead'}`,
    priority: 'high',
    leadId: appointment.leadId,
    dueAt: new Date(appointment.scheduledAt.getTime() + 24 * 60 * 60 * 1000),
    origin: 'auto',
    originKey: `no-show-${appointment.id}`,
    tags: ['No-show'],
  });
}

let cachedSnapshot: { tasks: Task[]; pending: number; _raw: Task[] } | null = null;

function getSnapshot() {
  if (!cachedSnapshot || cachedSnapshot._raw !== tasks) {
    cachedSnapshot = {
      tasks: listTasks(),
      pending: getPendingCount(),
      _raw: tasks,
    };
  }
  return cachedSnapshot as { tasks: Task[]; pending: number };
}

export function useTaskStore(): { tasks: Task[]; pending: number } {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Initialize SLA triggers with current mock leads
ensureLeadSlaTasks(mockLeads);
