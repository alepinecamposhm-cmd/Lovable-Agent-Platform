import { http, HttpResponse } from 'msw';
import { mockLeads, mockContacts } from '@/lib/agents/fixtures';
import { mergeContacts } from '@/lib/contacts/merge';
import { addAuditEvent } from '@/lib/audit/store';

export const handlers = [
  http.get('/api/leads', () => HttpResponse.json(mockLeads)),

  // Contacts
  http.get('/api/contacts', () => HttpResponse.json(mockContacts)),

  http.get('/api/contacts/:id', ({ params }) => {
    const contact = mockContacts.find((c) => c.id === params.id);
    if (!contact) return HttpResponse.status(404);
    return HttpResponse.json(contact);
  }),

  http.post('/api/contacts/merge', async (req) => {
    try {
      const body = await req.json();
      const { masterId, mergedIds, fieldsOverride } = body;

      const master = mockContacts.find((c) => c.id === masterId);
      if (!master) return HttpResponse.status(404);

      const others = mockContacts.filter((c) => mergedIds.includes(c.id));

      const merged = mergeContacts(master, others, fieldsOverride);

      // Remove merged contacts and replace master with merged
      for (const id of merged.mergedWith || []) {
        const idx = mockContacts.findIndex((c) => c.id === id);
        if (idx >= 0) mockContacts.splice(idx, 1);
      }

      const masterIdx = mockContacts.findIndex((c) => c.id === masterId);
      if (masterIdx >= 0) {
        mockContacts[masterIdx] = merged as any;
      } else {
        mockContacts.push(merged as any);
      }

      // record audit event
      addAuditEvent({ action: 'contact_merged', actor: 'agent-1', payload: { masterId, mergedIds, mergedId: merged.id } });

      return HttpResponse.json({ ok: true, merged });
    } catch (e) {
      return HttpResponse.status(500);
    }
  }),

  // Credits consume (idempotent)
  (() => {
    const idempotencyStore: Record<string, any> = {};

    return http.post('/api/credits/consume', async (req) => {
      try {
        const idempotencyKey = req.headers.get('idempotency-key') || ((await req.json()).idempotencyKey);
        if (!idempotencyKey) return HttpResponse.status(400);

        if (idempotencyStore[idempotencyKey]) {
          return HttpResponse.json({ ok: true, transaction: idempotencyStore[idempotencyKey] });
        }

        const body = await req.json();
        const { accountId, amount, action, referenceType, referenceId } = body;
        const account = mockCreditAccount;
        if (!account || account.id !== accountId) return HttpResponse.status(404);

        if (account.balance < amount) return HttpResponse.json({ ok: false, error: 'insufficient_balance' }, 402);

        // apply consumption
        const { entry } = (await import('@/lib/credits/consume')).consumeCredits(account as any, mockLedger as any, amount, { action, referenceType, referenceId, idempotencyKey });

        idempotencyStore[idempotencyKey] = entry;

        // record audit
        addAuditEvent({ action: 'credit_consumption', actor: 'agent-1', payload: { transactionId: entry.id, amount, action, referenceId } });

        return HttpResponse.json({ ok: true, transaction: entry });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('credits consume error', e);
        return HttpResponse.status(500);
      }
    });
  })(),

  // Analytics endpoint (mock)
  http.post('/api/analytics', async (req) => {
    const payload = await req.json();
    // eslint-disable-next-line no-console
    console.log('[msw] analytics event', payload);
    return HttpResponse.json({ ok: true });
  }),
];
