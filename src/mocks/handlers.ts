import { http, HttpResponse } from 'msw';
import { mockLeads, mockContacts, mockCreditAccount, mockLedger, mockInvoices } from '@/lib/agents/fixtures';
import { mergeContacts } from '@/lib/contacts/merge';
import { addAuditEvent } from '@/lib/audit/store';
import type { CreditAccount, CreditInvoice, CreditLedgerEntry, CreditRule } from '@/types/agents';

const cloneAccount = (): CreditAccount => ({
  ...mockCreditAccount,
  createdAt: new Date(mockCreditAccount.createdAt),
  updatedAt: new Date(mockCreditAccount.updatedAt),
});
const cloneLedger = (): CreditLedgerEntry[] => mockLedger.map((e) => ({ ...e, createdAt: new Date(e.createdAt) }));
const cloneInvoices = (): CreditInvoice[] => mockInvoices.map((i) => ({ ...i, createdAt: new Date(i.createdAt) }));

const creditAccountLive = cloneAccount();
const ledgerLive = cloneLedger();
const invoicesLive = cloneInvoices();

const DEMO_MODE = true;

export const handlers = [
  http.get('/api/leads', () => HttpResponse.json(mockLeads)),

  // Credits - account
  http.get('/api/credits/account', () => {
    return HttpResponse.json({ ok: true, account: creditAccountLive });
  }),

  http.patch('/api/credits/account', async (req) => {
    try {
      const body = await req.request.json();
      if (typeof body.lowBalanceThreshold === 'number') {
        creditAccountLive.lowBalanceThreshold = body.lowBalanceThreshold;
      }
      if (typeof body.currencyRate === 'number') {
        creditAccountLive.currencyRate = body.currencyRate;
      }
      if (typeof body.dailyLimit === 'number') {
        creditAccountLive.dailyLimit = body.dailyLimit;
      }
      creditAccountLive.updatedAt = new Date();
      return HttpResponse.json({ ok: true, account: creditAccountLive });
    } catch {
      return HttpResponse.status(500);
    }
  }),

  // Credits - ledger (paged)
  http.get('/api/credits/ledger', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const type = url.searchParams.get('type') as 'credit' | 'debit' | null;

    const sorted = [...ledgerLive].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const filtered = type ? sorted.filter((e) => e.type === type) : sorted;
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const entries = filtered.slice(start, end);

    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);
    const spentThisMonth = filtered
      .filter((e) => e.type === 'debit' && new Date(e.createdAt) >= monthAgo)
      .reduce((acc, e) => acc + e.amount, 0);
    const addedThisMonth = filtered
      .filter((e) => e.type === 'credit' && new Date(e.createdAt) >= monthAgo)
      .reduce((acc, e) => acc + e.amount, 0);

    return HttpResponse.json({
      ok: true,
      entries,
      page,
      pageSize,
      total,
      summary: { spentThisMonth, addedThisMonth },
    });
  }),

  // Credits - rules
  http.get('/api/credits/rules', () => {
    return HttpResponse.json({ ok: true, rules: creditAccountLive.rules, dailyLimit: creditAccountLive.dailyLimit });
  }),

  http.put('/api/credits/rules', async (req) => {
    try {
      const body = await req.request.json();
      const { rules } = body;
      if (!Array.isArray(rules)) return HttpResponse.json({ ok: false, error: 'invalid_rules' }, { status: 400 });
      creditAccountLive.rules = (rules as unknown[]).map((rRaw, idx) => {
        const r = rRaw as Record<string, unknown>;
        const action =
          typeof r.action === 'string'
            ? (r.action as CreditRule['action'])
            : ('lead_basic' as CreditRule['action']);
        return {
          id: typeof r.id === 'string' ? r.id : `rule-${idx}`,
          action,
          cost: typeof r.cost === 'number' ? r.cost : 0,
          isEnabled: typeof r.isEnabled === 'boolean' ? r.isEnabled : Boolean(r.isEnabled),
        };
      });
      creditAccountLive.updatedAt = new Date();
      return HttpResponse.json({ ok: true, rules: creditAccountLive.rules });
    } catch {
      return HttpResponse.status(500);
    }
  }),

  http.put('/api/credits/limits', async (req) => {
    try {
      const body = await req.request.json();
      if (typeof body.dailyLimit === 'number') creditAccountLive.dailyLimit = body.dailyLimit;
      if (typeof body.lowBalanceThreshold === 'number') creditAccountLive.lowBalanceThreshold = body.lowBalanceThreshold;
      creditAccountLive.updatedAt = new Date();
      return HttpResponse.json({ ok: true, dailyLimit: creditAccountLive.dailyLimit, lowBalanceThreshold: creditAccountLive.lowBalanceThreshold });
    } catch {
      return HttpResponse.status(500);
    }
  }),

  // Credits - purchase
  http.post('/api/credits/purchase', async (req) => {
    try {
      const body = await req.request.json();
      const { accountId, packageId, credits, price } = body;
      if (!accountId || !credits || !price) {
        return HttpResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
      }
      if (accountId !== creditAccountLive.id) {
        return HttpResponse.status(404);
      }

      // Apply purchase
      creditAccountLive.balance += credits;
      creditAccountLive.updatedAt = new Date();
      const entry = {
        id: `ledger-${Date.now()}-purchase`,
        accountId: creditAccountLive.id,
        type: 'credit' as const,
        amount: credits,
        balance: creditAccountLive.balance,
        description: `Compra de créditos (${packageId || credits})`,
        referenceType: 'recharge' as const,
        referenceId: packageId || 'custom',
        createdAt: new Date(),
      };
      ledgerLive.unshift(entry);

      addAuditEvent({
        action: 'credit_purchase',
        actor: 'agent-1',
        payload: { packageId, credits, price, transactionId: entry.id },
      });

      const receipt = {
        id: `rcpt-${Date.now()}`,
        amount: price,
        credits,
        createdAt: entry.createdAt,
        paymentMethod: 'card_4242',
        accountId: creditAccountLive.id,
        currency: 'USD',
      };

      return HttpResponse.json({ ok: true, account: creditAccountLive, transaction: entry, receipt });
    } catch (e) {
      return HttpResponse.status(500);
    }
  }),

  // Credits - receipt email
  http.post('/api/credits/receipt/email', async (req) => {
    try {
      const body = await req.request.json();
      const { receiptId, email } = body;
      if (!receiptId || !email) return HttpResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
      // simulate async send
      await new Promise((resolve) => setTimeout(resolve, 300));
      addAuditEvent({ action: 'credit_receipt_email', actor: 'agent-1', payload: { receiptId, email } });
      return HttpResponse.json({ ok: true });
    } catch {
      return HttpResponse.status(500);
    }
  }),

  // Credits - low balance email
  http.post('/api/credits/low-balance-email', async (req) => {
    try {
      const body = await req.request.json();
      const { email, balance } = body;
      if (!email) return HttpResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
      await new Promise((r) => setTimeout(r, 200));
      addAuditEvent({ action: 'credit_low_balance_email', actor: 'agent-1', payload: { email, balance } });
      return HttpResponse.json({ ok: true });
    } catch {
      return HttpResponse.status(500);
    }
  }),

  // Credits - export CSV
  http.get('/api/credits/ledger/export', () => {
    const header = 'fecha,concepto,monto,saldo,tipo';
    const rows = ledgerLive
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((e) => {
        const date = new Date(e.createdAt).toISOString();
        return `${date},"${e.description}",${e.type === 'credit' ? e.amount : -e.amount},${e.balance},${e.type}`;
      });
    const csv = [header, ...rows].join('\n');
    return new HttpResponse(csv, {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="credits-ledger.csv"' },
    });
  }),

  // Credits invoices
  http.get('/api/credits/invoices', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 10);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const entries = invoicesLive
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(start, end);
    return HttpResponse.json({
      ok: true,
      invoices: entries,
      page,
      pageSize,
      total: invoicesLive.length,
    });
  }),

  // Ledger item detail
  http.get('/api/credits/ledger/:id', ({ params }) => {
    const entry = ledgerLive.find((e) => e.id === params.id);
    if (!entry) return HttpResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    const ref = entry.referenceType === 'lead'
      ? { type: 'lead', label: 'Lead', path: `/agents/leads/${entry.referenceId}` }
      : entry.referenceType === 'listing'
        ? { type: 'listing', label: 'Listing', path: `/agents/listings/${entry.referenceId}` }
        : entry.referenceType === 'recharge'
          ? { type: 'receipt', label: 'Recibo', path: '/agents/credits?tab=invoices' }
          : undefined;
    return HttpResponse.json({ ok: true, entry, reference: ref });
  }),

  // Credits metrics
  http.get('/api/credits/metrics', () => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    const recharge = ledgerLive.filter((e) => e.type === 'credit' && new Date(e.createdAt) >= monthAgo)
      .reduce((acc, e) => acc + e.amount, 0);
    const spend = ledgerLive.filter((e) => e.type === 'debit' && new Date(e.createdAt) >= monthAgo)
      .reduce((acc, e) => acc + e.amount, 0);
    const arpa = recharge; // as mock: recarga mensual por agente único
    return HttpResponse.json({ ok: true, metrics: { arpa, recharge, spend } });
  }),

  // Contacts
  http.get('/api/contacts', () => HttpResponse.json(mockContacts)),

  http.get('/api/contacts/:id', ({ params }) => {
    const contact = mockContacts.find((c) => c.id === params.id);
    if (!contact) return HttpResponse.status(404);
    return HttpResponse.json(contact);
  }),

  http.post('/api/contacts/merge', async (req) => {
    try {
      const body = await req.request.json();
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
        mockContacts[masterIdx] = merged;
      } else {
        mockContacts.push(merged);
      }

      // record audit event
      addAuditEvent({ action: 'contact_merged', actor: 'agent-1', payload: { masterId, mergedIds, mergedId: merged.id } });

      return HttpResponse.json({ ok: true, merged });
    } catch (e) {
      return HttpResponse.status(500);
    }
  }),

  // Credits consume (idempotent + rules + daily limit)
  (() => {
    const idempotencyStore: Record<string, CreditLedgerEntry> = {};

    return http.post('/api/credits/consume', async (req) => {
      try {
        const parsed = (await req.request.json()) as Record<string, unknown>;
        const headerKey = req.headers.get('idempotency-key');
        const idempotencyKey =
          headerKey ?? (typeof parsed.idempotencyKey === 'string' ? parsed.idempotencyKey : undefined);
        if (!idempotencyKey) return HttpResponse.status(400);

        if (idempotencyStore[idempotencyKey]) {
          return HttpResponse.json({ ok: true, transaction: idempotencyStore[idempotencyKey], account: creditAccountLive });
        }

        const accountId = typeof parsed.accountId === 'string' ? parsed.accountId : undefined;
        const action = typeof parsed.action === 'string' ? parsed.action : undefined;
        const referenceType = typeof parsed.referenceType === 'string' ? parsed.referenceType : undefined;
        const referenceId = typeof parsed.referenceId === 'string' ? parsed.referenceId : undefined;
        const amount = typeof parsed.amount === 'number' ? parsed.amount : undefined;
        if (!accountId || !action) return HttpResponse.status(400);
        const account = creditAccountLive;
        if (!account || account.id !== accountId) return HttpResponse.status(404);

        // determine cost from rules
        const rule = account.rules.find((r) => r.action === action);
        if (!rule || !rule.isEnabled) {
          return HttpResponse.json({ ok: false, error: 'rule_disabled' }, 403);
        }
        const cost = rule.cost || amount || 0;

        // daily limit check
        const today = new Date();
        const spentToday = ledgerLive
          .filter((e) => e.type === 'debit' && new Date(e.createdAt).toDateString() === today.toDateString())
          .reduce((acc, e) => acc + e.amount, 0);
        if (account.dailyLimit && spentToday + cost > account.dailyLimit) {
          return HttpResponse.json({ ok: false, error: 'daily_limit', spentToday, dailyLimit: account.dailyLimit }, 403);
        }

        if (account.balance < cost) return HttpResponse.json({ ok: false, error: 'insufficient_balance' }, 402);

        // apply consumption
        const { consumeCredits } = await import('@/lib/credits/consume');
        const { entry } = consumeCredits(account, ledgerLive, cost, {
          action,
          referenceType,
          referenceId,
          idempotencyKey,
        });

        idempotencyStore[idempotencyKey] = entry;

        // record audit
        addAuditEvent({ action: 'credit_consumption', actor: 'agent-1', payload: { transactionId: entry.id, amount: cost, action, referenceId } });

        return HttpResponse.json({ ok: true, transaction: entry, account });
      } catch {
        return HttpResponse.status(500);
      }
    });
  })(),

  // Analytics endpoint (mock)
  http.post('/api/analytics', async (req) => {
    await req.request.json();
    return HttpResponse.json({ ok: true });
  }),
];
