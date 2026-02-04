import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreditAccount, CreditLedgerEntry, CreditInvoice } from '@/types/agents';
import { mockCreditAccount, mockLedger, mockInvoices } from '@/lib/agents/fixtures';

const ACCOUNT_KEY = ['credits', 'account'];
const LEDGER_KEY = ['credits', 'ledger'];

const LEDGER_SEED_KEY = 'demo_credits_ledger_seed';
const INVOICE_SEED_KEY = 'demo_credits_invoices_seed';
const METRIC_SEED_KEY = 'demo_credits_metrics_seed';

type LedgerSummary = {
  spentThisMonth: number;
  addedThisMonth: number;
};

export type CreditReceipt = {
  id: string;
  amount: number;
  credits: number;
  createdAt: string | Date;
  paymentMethod?: string;
};

export type LedgerResponse = {
  entries: CreditLedgerEntry[];
  page: number;
  pageSize: number;
  total: number;
  summary: LedgerSummary;
  source?: 'remote' | 'seed';
};

export type InvoiceResponse = {
  invoices: CreditInvoice[];
  page: number;
  pageSize: number;
  total: number;
  source?: 'remote' | 'seed';
};

export type CreditMetrics = { arpa: number; recharge: number; spend: number; source?: 'remote' | 'seed' };

// Helpers for seeds -------------------------------------------------
function cloneLedgerSeed(): CreditLedgerEntry[] {
  return mockLedger.map((e) => ({ ...e, createdAt: new Date(e.createdAt) }));
}

function loadLedgerSeed(): CreditLedgerEntry[] {
  if (typeof window === 'undefined') return cloneLedgerSeed();
  const raw = window.localStorage.getItem(LEDGER_SEED_KEY);
  if (!raw) {
    const seed = cloneLedgerSeed();
    window.localStorage.setItem(LEDGER_SEED_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return cloneLedgerSeed();
    return parsed.map((eRaw) => {
      const e = eRaw as Record<string, unknown>;
      return { ...(e as CreditLedgerEntry), createdAt: new Date(String(e.createdAt)) };
    });
  } catch {
    const seed = cloneLedgerSeed();
    window.localStorage.setItem(LEDGER_SEED_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveLedgerSeed(data: CreditLedgerEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEDGER_SEED_KEY, JSON.stringify(data));
}

function loadInvoiceSeed(): CreditInvoice[] {
  if (typeof window === 'undefined') return mockInvoices.map((i) => ({ ...i, createdAt: new Date(i.createdAt) }));
  const raw = window.localStorage.getItem(INVOICE_SEED_KEY);
  if (!raw) {
    const seed = mockInvoices.map((i) => ({ ...i, createdAt: new Date(i.createdAt) }));
    window.localStorage.setItem(INVOICE_SEED_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return mockInvoices.map((i) => ({ ...i, createdAt: new Date(i.createdAt) }));
    return parsed.map((eRaw) => {
      const e = eRaw as Record<string, unknown>;
      return { ...(e as CreditInvoice), createdAt: new Date(String(e.createdAt)) };
    });
  } catch {
    const seed = mockInvoices.map((i) => ({ ...i, createdAt: new Date(i.createdAt) }));
    window.localStorage.setItem(INVOICE_SEED_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveInvoiceSeed(data: CreditInvoice[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVOICE_SEED_KEY, JSON.stringify(data));
}

function computeMetricsFromLedger(entries: CreditLedgerEntry[]): CreditMetrics {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const recharge = entries.filter((e) => e.type === 'credit' && new Date(e.createdAt) >= monthAgo).reduce((a, b) => a + b.amount, 0);
  const spend = entries.filter((e) => e.type === 'debit' && new Date(e.createdAt) >= monthAgo).reduce((a, b) => a + b.amount, 0);
  return { arpa: recharge, recharge, spend };
}

function loadMetricsSeed(): CreditMetrics {
  if (typeof window === 'undefined') return computeMetricsFromLedger(cloneLedgerSeed());
  const raw = window.localStorage.getItem(METRIC_SEED_KEY);
  if (!raw) {
    const seed = computeMetricsFromLedger(cloneLedgerSeed());
    window.localStorage.setItem(METRIC_SEED_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as CreditMetrics;
  } catch {
    const seed = computeMetricsFromLedger(cloneLedgerSeed());
    window.localStorage.setItem(METRIC_SEED_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveMetricsSeed(data: CreditMetrics) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(METRIC_SEED_KEY, JSON.stringify(data));
}

// Fetchers ----------------------------------------------------------
async function fetchMetrics(): Promise<CreditMetrics> {
  try {
    const res = await fetch('/api/credits/metrics');
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudieron cargar métricas');
    saveMetricsSeed(json.metrics);
    return { ...json.metrics, source: 'remote' };
  } catch {
    const seed = loadMetricsSeed();
    return { ...seed, source: 'seed' };
  }
}

function reviveLedgerEntry(entry: CreditLedgerEntry & { createdAt: string | Date }): CreditLedgerEntry {
  return {
    ...entry,
    createdAt: new Date(entry.createdAt),
  };
}

async function fetchAccount(): Promise<CreditAccount> {
  try {
    const res = await fetch('/api/credits/account');
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo cargar la cuenta de créditos');
    return {
      ...json.account,
      createdAt: new Date(json.account.createdAt),
      updatedAt: new Date(json.account.updatedAt),
    };
  } catch (e) {
    return { ...mockCreditAccount, createdAt: new Date(mockCreditAccount.createdAt), updatedAt: new Date(mockCreditAccount.updatedAt) };
  }
}

async function fetchLedger(params: { page: number; pageSize?: number; type?: 'credit' | 'debit' }): Promise<LedgerResponse> {
  const fallback = () => {
    const seed = loadLedgerSeed();
    const summary: LedgerSummary = {
      spentThisMonth: seed.filter((e) => e.type === 'debit').reduce((a, b) => a + b.amount, 0),
      addedThisMonth: seed.filter((e) => e.type === 'credit').reduce((a, b) => a + b.amount, 0),
    };
    return {
      entries: seed,
      page: 1,
      pageSize: params.pageSize || 10,
      total: seed.length,
      summary,
      source: 'seed',
    };
  };

  try {
    const search = new URLSearchParams();
    search.set('page', String(params.page));
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    if (params.type) search.set('type', params.type);
    const res = await fetch(`/api/credits/ledger?${search.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo cargar el historial');
    const entries = (json.entries || []).map(reviveLedgerEntry);
    if (!entries.length) return fallback();
    saveLedgerSeed(entries);
    return {
      entries,
      page: json.page,
      pageSize: json.pageSize,
      total: json.total,
      summary: json.summary,
      source: 'remote',
    };
  } catch {
    return fallback();
  }
}

async function purchaseCredits(payload: { accountId: string; packageId: string; credits: number; price: number }) {
  const res = await fetch('/api/credits/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo completar la compra');
  return {
    account: {
      ...json.account,
      createdAt: new Date(json.account.createdAt),
      updatedAt: new Date(json.account.updatedAt),
    } as CreditAccount,
    transaction: reviveLedgerEntry(json.transaction),
    receipt: json.receipt as CreditReceipt,
  };
}

async function consumeCreditsApi(payload: { accountId: string; amount?: number; action: string; referenceType?: string; referenceId?: string }) {
  const idempotencyKey = payload.referenceId
    ? `${payload.action}-${payload.referenceId}`
    : `${payload.action}-${Date.now()}`;

  const res = await fetch('/api/credits/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': idempotencyKey },
    body: JSON.stringify({ ...payload, idempotencyKey }),
  });
  const json = await res.json();
  if (res.status === 402 || json.error === 'insufficient_balance') {
    const err = new Error('INSUFFICIENT_BALANCE');
    throw err;
  }
  if (res.status === 403 && json.error === 'daily_limit') {
    const err = new Error('DAILY_LIMIT') as Error & { meta?: { dailyLimit?: number; spentToday?: number } };
    err.meta = { dailyLimit: json.dailyLimit, spentToday: json.spentToday };
    throw err;
  }
  if (res.status === 403 && json.error === 'rule_disabled') {
    throw new Error('RULE_DISABLED');
  }
  if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo consumir créditos');
  return {
    transaction: reviveLedgerEntry(json.transaction),
    account: {
      ...json.account,
      createdAt: new Date(json.account.createdAt),
      updatedAt: new Date(json.account.updatedAt),
    } as CreditAccount,
  };
}

async function fetchInvoices(params: { page: number; pageSize?: number }): Promise<InvoiceResponse> {
  const fallback = () => {
    const seed = loadInvoiceSeed();
    return {
      invoices: seed,
      page: 1,
      pageSize: params.pageSize || 10,
      total: seed.length,
      source: 'seed',
    };
  };
  try {
    const search = new URLSearchParams();
    search.set('page', String(params.page));
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    const res = await fetch(`/api/credits/invoices?${search.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudieron cargar las facturas');
    const invoices = (Array.isArray(json.invoices) ? json.invoices : []).map((iRaw: unknown) => {
      const i = iRaw as Record<string, unknown>;
      return { ...(i as CreditInvoice), createdAt: new Date(String(i.createdAt)) } satisfies CreditInvoice;
    });
    if (!invoices.length) return fallback();
    saveInvoiceSeed(invoices);
    return {
      invoices,
      page: json.page,
      pageSize: json.pageSize,
      total: json.total,
      source: 'remote',
    };
  } catch {
    return fallback();
  }
}

// Hooks -------------------------------------------------------------
export function useCreditAccount() {
  return useQuery({
    queryKey: ACCOUNT_KEY,
    queryFn: fetchAccount,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreditMetrics() {
  return useQuery({
    queryKey: ['credits', 'metrics'],
    queryFn: fetchMetrics,
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreditLedger(params: { page: number; pageSize?: number; type?: 'credit' | 'debit' }) {
  return useQuery({
    queryKey: [...LEDGER_KEY, params],
    queryFn: () => fetchLedger(params),
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreditInvoices(params: { page: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['credits', 'invoices', params],
    queryFn: () => fetchInvoices(params),
    keepPreviousData: true,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseCredits,
    onSuccess: ({ account }) => {
      queryClient.setQueryData(ACCOUNT_KEY, account);
      queryClient.invalidateQueries({ queryKey: LEDGER_KEY });
      queryClient.invalidateQueries({ queryKey: ['credits', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['credits', 'invoices'] });
    },
  });
}

export function useSendReceiptEmail() {
  return useMutation({
    mutationFn: async (payload: { receiptId: string; email: string }) => {
      const res = await fetch('/api/credits/receipt/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo enviar el recibo');
      return true;
    },
  });
}

export function useConsumeCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: consumeCreditsApi,
    onSuccess: ({ account }) => {
      if (account) queryClient.setQueryData(ACCOUNT_KEY, account);
      queryClient.invalidateQueries({ queryKey: LEDGER_KEY });
      queryClient.invalidateQueries({ queryKey: ['credits', 'metrics'] });
    },
  });
}

export function useUpdateCreditAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Pick<CreditAccount, 'lowBalanceThreshold' | 'currencyRate' | 'dailyLimit'>>) => {
      const res = await fetch('/api/credits/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo actualizar la cuenta');
      return {
        ...json.account,
        createdAt: new Date(json.account.createdAt),
        updatedAt: new Date(json.account.updatedAt),
      } as CreditAccount;
    },
    onSuccess: (account) => {
      queryClient.setQueryData(ACCOUNT_KEY, account);
    },
  });
}

export function useSaveCreditRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rules: CreditAccount['rules'] }) => {
      const res = await fetch('/api/credits/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudieron guardar las reglas');
      return json.rules as CreditAccount['rules'];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEY });
    },
  });
}

export function useSaveCreditLimits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { dailyLimit?: number; lowBalanceThreshold?: number }) => {
      const res = await fetch('/api/credits/limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudieron guardar los límites');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEY });
    },
  });
}
