import { describe, it, expect, beforeEach } from 'vitest';
import {
  listAppointments,
  setAppointmentStatus,
  updateAppointment,
  addAppointment,
} from './store';

describe('appointments store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists status changes', () => {
    const first = listAppointments()[0];
    setAppointmentStatus(first.id, 'cancelled');
    const updated = listAppointments().find((a) => a.id === first.id);
    expect(updated?.status).toBe('cancelled');
  });

  it('reprograms date and keeps order', () => {
    const first = listAppointments()[0];
    const newDate = new Date(first.scheduledAt.getTime() + 60 * 60 * 1000);
    updateAppointment(first.id, { scheduledAt: newDate, status: 'confirmed' });
    const updated = listAppointments().find((a) => a.id === first.id);
    expect(updated?.scheduledAt.getTime()).toBe(newDate.getTime());
  });

  it('adds appointment with defaults and persists', () => {
    const base = new Date();
    const created = addAppointment({
      scheduledAt: base,
      leadId: 'lead-x',
      agentId: 'agent-1',
      type: 'showing',
    });
    const stored = listAppointments().find((a) => a.id === created.id);
    expect(stored).toBeTruthy();
    expect(stored?.status).toBe('pending');
  });
});
