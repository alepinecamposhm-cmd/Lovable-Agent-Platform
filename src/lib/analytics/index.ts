export type AnalyticsPayload = {
  event: string;
  timestamp: string;
  actorId?: string;
  context?: Record<string, any>;
  properties?: Record<string, any>;
};

function redactPII(obj: Record<string, any> = {}) {
  const copy: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lk = k.toLowerCase();
    if (lk.includes('email') || lk.includes('phone') || lk.includes('name')) {
      copy[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      copy[k] = redactPII(v);
    } else {
      copy[k] = v;
    }
  }
  return copy;
}

export async function track(event: string, opts: { actorId?: string; context?: Record<string, any>; properties?: Record<string, any> } = {}) {
  try {
    const payload: AnalyticsPayload = {
      event,
      timestamp: new Date().toISOString(),
      actorId: opts.actorId,
      context: redactPII(opts.context),
      properties: redactPII(opts.properties as Record<string, any>),
    };

    // Fire and forget but return the response if caller wants to await
    const send = async () => {
      try {
        const res = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // simple retry once
          await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      } catch (e) {
        // swallow errors - analytics should not break UX
        // eslint-disable-next-line no-console
        console.warn('analytics: send failed', e);
      }
    };

    // kick off but don't await
    void send();

    return { ok: true };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('analytics: track failed', e);
    return { ok: false };
  }
}

export default { track };
