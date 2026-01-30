import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { track } from './index';

describe('analytics track()', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('sends payload to /api/analytics and redacts email/phone/name properties', async () => {
    const spy = globalThis.fetch as unknown as vi.Mock;
    await track('listing.boost', {
      actorId: 'user_123',
      properties: { listingId: 'L-1', userEmail: 'user@example.com', phoneNumber: '555-1234', nested: { ownerName: 'Alice' } },
    });

    expect(spy).toHaveBeenCalled();
    const [[url, opts]] = spy.mock.calls;
    expect(url).toBe('/api/analytics');
    const body = JSON.parse(opts.body);
    expect(body.event).toBe('listing.boost');
    expect(body.actorId).toBe('user_123');
    expect(body.properties.userEmail).toBe('[REDACTED]');
    expect(body.properties.phoneNumber).toBe('[REDACTED]');
    expect(body.properties.nested.ownerName).toBe('[REDACTED]');
  });

  it('does not throw if fetch fails', async () => {
    (globalThis.fetch as unknown as vi.Mock).mockImplementation(() => Promise.reject(new Error('network')));
    const res = await track('agent.test_event');
    expect(res.ok).toBeTruthy();
  });
});
