import { describe, it, expect, beforeEach } from 'vitest';
import {
  addTask,
  completeTask,
  undoCompleteTask,
  snoozeTask,
  listTasks,
  getPendingCount,
  ensureLeadSlaTasks,
} from './store';
import { mockLeads } from '../fixtures';

beforeEach(() => {
  window.localStorage.clear();
});

describe('tasks store', () => {
  it('adds and persists task', () => {
    const task = addTask({ title: 'Llamar a Ana', leadId: 'lead-1', dueAt: new Date('2026-01-29') });
    const found = listTasks().find((t) => t.id === task.id);
    expect(found?.title).toBe('Llamar a Ana');
  });

  it('completes and undo a task', () => {
    const task = addTask({ title: 'Enviar correo', leadId: 'lead-2' });
    completeTask(task.id);
    expect(listTasks().find((t) => t.id === task.id)?.status).toBe('completed');
    undoCompleteTask(task.id);
    expect(listTasks().find((t) => t.id === task.id)?.status).toBe('pending');
  });

  it('snoozes task to new date', () => {
    const task = addTask({ title: 'Seguimiento', dueAt: new Date('2026-01-29') });
    const next = new Date('2026-01-30');
    snoozeTask(task.id, next);
    expect(listTasks().find((t) => t.id === task.id)?.dueAt?.toDateString()).toBe(next.toDateString());
  });

  it('prevents duplicate SLA tasks via originKey', () => {
    ensureLeadSlaTasks(mockLeads, 0); // force create
    const count = listTasks().filter((t) => t.originKey?.startsWith('sla-')).length;
    expect(count).toBeGreaterThan(0);
    ensureLeadSlaTasks(mockLeads, 0);
    const count2 = listTasks().filter((t) => t.originKey?.startsWith('sla-')).length;
    expect(count2).toBe(count);
  });

  it('counts pending tasks', () => {
    addTask({ title: 'Tarea A' });
    addTask({ title: 'Tarea B' });
    const pending = getPendingCount();
    expect(pending).toBeGreaterThanOrEqual(2);
  });
});
