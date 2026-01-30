import { describe, expect, it, beforeEach } from 'vitest';
import { isQuietHoursNow, setQuietHours, getQuietHoursState } from './store';

const resetQuiet = () =>
  setQuietHours({
    enabled: false,
    start: '22:00',
    end: '07:00',
    channels: { push: true, email: true, sms: false },
  });

describe('quiet hours', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetQuiet();
  });

  it('returns false when quiet hours disabled', () => {
    expect(isQuietHoursNow(new Date('2026-01-29T23:00:00'))).toBe(false);
  });

  it('handles overnight range before midnight', () => {
    setQuietHours({ enabled: true, start: '22:00', end: '07:00' });
    expect(isQuietHoursNow(new Date('2026-01-29T23:15:00'))).toBe(true);
  });

  it('handles overnight range after midnight', () => {
    setQuietHours({ enabled: true, start: '22:00', end: '07:00' });
    expect(isQuietHoursNow(new Date('2026-01-30T06:30:00'))).toBe(true);
  });

  it('returns false outside overnight window', () => {
    setQuietHours({ enabled: true, start: '22:00', end: '07:00' });
    expect(isQuietHoursNow(new Date('2026-01-30T12:00:00'))).toBe(false);
  });

  it('handles daytime range start < end', () => {
    setQuietHours({ enabled: true, start: '08:00', end: '18:00' });
    expect(isQuietHoursNow(new Date('2026-01-30T10:00:00'))).toBe(true);
    expect(isQuietHoursNow(new Date('2026-01-30T19:00:00'))).toBe(false);
  });

  it('merges channel preferences without dropping existing values', () => {
    setQuietHours({ channels: { push: false } });
    const state = getQuietHoursState();
    expect(state.channels.push).toBe(false);
    expect(state.channels.email).toBe(true);
    expect(state.channels.sms).toBe(false);
  });
});
