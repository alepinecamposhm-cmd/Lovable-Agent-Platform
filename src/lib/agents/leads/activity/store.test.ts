import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('lead activity store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it('adds and persists new activity entries', async () => {
    const { addLeadActivity, listLeadActivities } = await import('./store');
    const created = addLeadActivity({
      leadId: 'lead-x',
      type: 'appointment_scheduled',
      description: 'Cita programada',
      createdBy: 'agent-1',
    });

    const stored = listLeadActivities('lead-x').find((a) => a.id === created.id);
    expect(stored).toBeTruthy();
    expect(stored?.type).toBe('appointment_scheduled');
  });
});

