import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Loader2,
  Plus,
  Settings,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BuyCreditsDialog } from '@/components/agents/credits/BuyCreditsDialog';
import { useCreditAccount, useCreditLedger, useUpdateCreditAccount, useSaveCreditRules, useSaveCreditLimits, useCreditMetrics, useCreditInvoices } from '@/lib/credits/query';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { CreditLedgerEntry } from '@/types/agents';

const PER_PAGE = 10;
const INVOICE_PER_PAGE = 10;

const actionLabels: Record<string, string> = {
  lead_basic: 'Lead básico',
  lead_premium: 'Lead premium',
  boost_24h: 'Boost 24h',
  boost_7d: 'Boost 7 días',
  featured_listing: 'Listing destacado',
  verification_request: 'Verificación',
};

const track = (event: string, properties?: Record<string, unknown>) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
};

function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          ¿Cómo funcionan los créditos?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Créditos & Billing</DialogTitle>
          <DialogDescription>Resumen basado en la especificación.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>• Los créditos se usan para aceptar leads y destacar listings.</p>
          <p>• Puedes recargar paquetes (50/100/500) y ver tu recibo.</p>
          <p>• Si el saldo es insuficiente se bloquea la acción y se muestra CTA para recargar.</p>
          <p>• El ledger registra recargas (+) y consumos (-) con fecha y descripción.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingRow() {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground">
        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="text-right">
        <div className="h-4 w-12 rounded bg-muted animate-pulse ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <div className="h-4 w-12 rounded bg-muted animate-pulse ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export default function AgentCredits() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [invoicePage, setInvoicePage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices'>('overview');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [ledgerDetail, setLedgerDetail] = useState<{ entry: CreditLedgerEntry; reference?: { type: string; label: string; path: string } } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const accountQuery = useCreditAccount();
  const account = accountQuery.data;
  const accountLoading = accountQuery.isLoading;
  const accountError = accountQuery.isError;
  const refetchAccount = accountQuery.refetch;
  const { mutateAsync: updateAccount, isPending: updatingAccount } = useUpdateCreditAccount();
  const { mutateAsync: saveRules, isPending: savingRules } = useSaveCreditRules();
  const { mutateAsync: saveLimits, isPending: savingLimits } = useSaveCreditLimits();
  const [thresholdInput, setThresholdInput] = useState<number | ''>('');
  const [rateInput, setRateInput] = useState<number | ''>('');
  const [dailyLimitInput, setDailyLimitInput] = useState<number | ''>('');
  const [rulesState, setRulesState] = useState<NonNullable<typeof account>['rules']>(account?.rules ?? []);
  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useCreditMetrics();

  const ledgerQuery = useCreditLedger({
    page,
    pageSize: PER_PAGE,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });
  const ledgerData = ledgerQuery.data;
  const ledgerLoading = ledgerQuery.isLoading;
  const ledgerError = ledgerQuery.isError;
  const ledgerFetching = ledgerQuery.isFetching;

  const invoicesQuery = useCreditInvoices({ page: invoicePage, pageSize: INVOICE_PER_PAGE });
  const invoicesData = invoicesQuery.data;

  const ledger = ledgerData?.entries || [];
  const totalPages = Math.max(1, Math.ceil((ledgerData?.total || 0) / PER_PAGE));
  const usedThisMonth = ledgerData?.summary.spentThisMonth || 0;
  const lastUpdatedTime = ledgerQuery.dataUpdatedAt ? new Date(ledgerQuery.dataUpdatedAt) : lastUpdated;
  const isLowBalance = !!account && account.balance <= account.lowBalanceThreshold;
  const isLedgerSeed = ledgerData?.source === 'seed';
  const isInvoicesSeed = invoicesData?.source === 'seed';

  useEffect(() => {
    if (account) {
      track('credits_balance_view', { balance: account.balance, source: 'credits_page' });
      setThresholdInput(account.lowBalanceThreshold);
      setRateInput(account.currencyRate ?? 1);
      setDailyLimitInput(account.dailyLimit ?? '');
      setRulesState(account.rules);
      setLastUpdated(new Date());
    }
  }, [account]);

  useEffect(() => {
    if (ledgerQuery.dataUpdatedAt) {
      setLastUpdated(new Date(ledgerQuery.dataUpdatedAt));
    }
  }, [ledgerQuery.dataUpdatedAt]);

  useEffect(() => {
    if (isLowBalance) {
      track('credits_low_balance_banner_shown', { balance: account?.balance, threshold: account?.lowBalanceThreshold });
    }
  }, [isLowBalance, account?.balance, account?.lowBalanceThreshold]);

  const refreshAll = () => {
    refetchAccount();
    ledgerQuery.refetch();
    track('credits_balance_refresh', { source: 'credits_page' });
  };

  const handleSaveAlerts = async () => {
    try {
      await updateAccount({
        lowBalanceThreshold: typeof thresholdInput === 'number' ? thresholdInput : account?.lowBalanceThreshold,
        currencyRate: typeof rateInput === 'number' ? rateInput : account?.currencyRate,
      });
      toast.success('Preferencias guardadas');
      track('credits_threshold_updated', { threshold: thresholdInput, rate: rateInput });
    } catch (e) {
      toast.error('No se pudo guardar');
    }
  };

  const handleSaveRules = async () => {
    try {
      await saveRules({ rules: rulesState });
      await saveLimits({
        dailyLimit: typeof dailyLimitInput === 'number' ? dailyLimitInput : account?.dailyLimit,
      });
      toast.success('Reglas guardadas');
      track('credits_rules_saved', { rules: rulesState.length });
    } catch (e) {
      toast.error('No se pudieron guardar las reglas');
    }
  };

  const handleLowBalanceEmail = async () => {
    try {
      const res = await fetch('/api/credits/low-balance-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'agent@example.com', balance: account?.balance }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error('fail');
      toast.success('Recordatorio enviado');
      track('credits_low_balance_email_sent', { balance: account?.balance });
    } catch {
      toast.error('No se pudo enviar el recordatorio');
    }
  };

  const openLedgerDetail = async (id: string) => {
    setSelectedLedgerId(id);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/credits/ledger/${id}`);
      const json = (await res.json()) as { ok?: boolean; entry?: unknown; reference?: unknown; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo cargar el detalle');
      const entryRaw = (json.entry ?? {}) as Record<string, unknown>;
      const entry: CreditLedgerEntry = {
        ...(entryRaw as CreditLedgerEntry),
        createdAt: entryRaw.createdAt ? new Date(String(entryRaw.createdAt)) : new Date(),
      };
      const reference = json.reference as { type: string; label: string; path: string } | undefined;
      setLedgerDetail({ entry, reference });
      track('credits_ledger_item_open', { id });
    } catch (e: unknown) {
      setDetailError(e instanceof Error ? e.message : 'No se pudo cargar el detalle');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Créditos</h1>
          <p className="text-muted-foreground">
            Administra tu saldo y consumo de créditos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HelpDialog />
          <BuyCreditsDialog />
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'invoices')}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="invoices">Facturas / Recibos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      {/* Balance Cards */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cn('relative overflow-hidden', isLowBalance && 'border-warning')}>
          <CardHeader className="pb-2 flex flex-row justify-between items-start">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Saldo Actual
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={refreshAll} aria-label="Refrescar saldo">
              {accountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refrescar'}
            </Button>
          </CardHeader>
          <CardContent>
            {accountError ? (
              <div className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No se pudo cargar el saldo.
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {accountLoading ? '—' : account?.balance ?? '—'}
                </span>
                <span className="text-muted-foreground">créditos</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              1 crédito ≈ ${account?.currencyRate ?? 1}
            </p>
            {isLowBalance && (
              <div className="flex items-center gap-2 mt-2 text-warning text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Saldo bajo - considera recargar</span>
              </div>
            )}
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Consumo Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold">
                {ledgerLoading ? '—' : usedThisMonth}
              </span>
              <span className="text-muted-foreground">
                / {account?.dailyLimit ? account.dailyLimit * 30 : '∞'}
              </span>
            </div>
            <Progress
              value={
                account?.dailyLimit
                  ? (usedThisMonth / (account.dailyLimit * 30)) * 100
                  : 0
              }
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">-15%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              vs mes anterior (mock)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monetización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {metricsError && <p className="text-sm text-destructive">Error métricas</p>}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ARPA mes</span>
              <span className="font-semibold">{metricsLoading ? '—' : `$${metrics?.arpa ?? 0}`}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recargas mes</span>
              <span className="font-semibold">{metricsLoading ? '—' : `${metrics?.recharge ?? 0} cr.`}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gasto mes</span>
              <span className="font-semibold text-destructive">{metricsLoading ? '—' : `${metrics?.spend ?? 0} cr.`}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isLowBalance && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Saldo bajo</p>
                <p className="text-sm text-muted-foreground">
                  Te quedan {account?.balance} créditos. Configura tu umbral o recarga para evitar bloqueos.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <BuyCreditsDialog trigger={<Button size="sm">Recargar</Button>} />
              <Button variant="ghost" size="sm" onClick={handleLowBalanceEmail}>Enviar recordatorio</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Alertas y equivalencia
            </CardTitle>
            <CardDescription>Configura tu umbral y cuánto vale un crédito.</CardDescription>
          </div>
          <Button size="sm" onClick={handleSaveAlerts} disabled={updatingAccount}>
            {updatingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Alerta de saldo bajo</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <span className="text-sm text-muted-foreground">créditos</span>
            </div>
            <p className="text-xs text-muted-foreground">Mostraremos alerta y banner cuando el saldo sea menor.</p>
          </div>
          <div className="space-y-2">
            <Label>Equivalencia monetaria</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0.1}
                step="0.1"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <span className="text-sm text-muted-foreground">$ por crédito</span>
            </div>
            <p className="text-xs text-muted-foreground">Se usa para mostrar el valor estimado de tus créditos.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction History */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Historial de Movimientos</CardTitle>
                <CardDescription>
                  Últimos movimientos de tu cuenta de créditos {lastUpdatedTime && (
                    <span className="text-xs text-muted-foreground block">
                      Actualizado {formatDistanceToNow(lastUpdatedTime, { addSuffix: true, locale: es })}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isLedgerSeed && (
                  <Badge variant="secondary" className="text-[11px]">Datos demo</Badge>
                )}
                <Select
                  value={typeFilter}
                  onValueChange={(val: 'all' | 'credit' | 'debit') => {
                    setPage(1);
                    setTypeFilter(val);
                    track('credits_ledger_filter_change', { type: val });
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="credit">Recargas</SelectItem>
                    <SelectItem value="debit">Consumos</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetch('/api/credits/ledger/export')
                      .then((res) => res.text())
                      .then((csv) => {
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'credits-ledger.csv';
                        a.click();
                        track('credits_ledger_export');
                      });
                  }}
                >
                  Exportar CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    ledgerQuery.refetch();
                    track('credits_ledger_manual_refresh');
                  }}
                  disabled={ledgerFetching}
                >
                  {ledgerFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reintentar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ledgerError && (
                <div className="flex items-center gap-2 text-destructive text-sm mb-4">
                  <AlertCircle className="h-4 w-4" />
                  No se pudo cargar el historial. <Button variant="link" onClick={() => ledgerQuery.refetch()}>Reintentar</Button>
                  {ledger.length > 0 && <span className="text-muted-foreground">Mostrando datos previos (demo).</span>}
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerLoading && ledger.length === 0 && Array.from({ length: 4 }).map((_, i) => <LoadingRow key={i} />)}
                  {!ledgerLoading && ledger.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="py-6 text-center text-sm text-muted-foreground space-y-2">
                          <BookOpen className="h-5 w-5 mx-auto" />
                          <p>Aún no hay movimientos.</p>
                          <BuyCreditsDialog trigger={<Button size="sm">Comprar créditos</Button>} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!ledgerLoading && ledger.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => openLedgerDetail(entry.id)}
                    >
                      <TableCell className="text-muted-foreground">
                        {format(entry.createdAt, 'd MMM', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.type === 'credit' ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              <Plus className="h-3 w-3 mr-1" />
                              Recarga
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Consumo
                            </Badge>
                          )}
                          <span className="text-sm">{entry.description}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          entry.type === 'credit' ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {entry.type === 'credit' ? '+' : '-'}
                        {entry.amount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {entry.balance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      track('credits_ledger_page_change', { page: page - 1 });
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      track('credits_ledger_page_change', { page: page + 1 });
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consumption Rules */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Reglas de Consumo
              </CardTitle>
              <CardDescription>
                Configura qué acciones consumen créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rulesState.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={rule.id} className="font-medium cursor-pointer">
                          {actionLabels[rule.action]}
                        </Label>
                        {rule.isEnabled ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rule.cost} créditos
                      </p>
                    </div>
                    <Switch
                      id={rule.id}
                      checked={rule.isEnabled}
                      disabled={['lead_basic', 'lead_premium'].includes(rule.action)}
                      onCheckedChange={(checked) =>
                        setRulesState((prev) =>
                          prev.map((r) => (r.id === rule.id ? { ...r, isEnabled: checked } : r))
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg border border-dashed">
                <h4 className="font-medium text-sm mb-2">Límites</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Límite diario:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={dailyLimitInput}
                        onChange={(e) => setDailyLimitInput(e.target.value === '' ? '' : Number(e.target.value))}
                        className="h-8 w-24"
                      />
                      <span className="text-xs text-muted-foreground">créditos</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alerta saldo bajo:</span>
                    <span className="font-medium">&lt; {account?.lowBalanceThreshold ?? '—'} créditos</span>
                  </div>
                </div>
                <Button size="sm" className="mt-3" onClick={handleSaveRules} disabled={savingRules || savingLimits}>
                  {savingRules || savingLimits ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Facturas / Recibos</CardTitle>
              <CardDescription>Descarga o envía por email tus recibos anteriores.</CardDescription>
            </div>
            {invoicesQuery.isFetching && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Sincronizando…</div>}
          </CardHeader>
          <CardContent>
            {invoicesQuery.isError && (
              <div className="flex items-center gap-2 text-destructive text-sm mb-3">
                <AlertCircle className="h-4 w-4" />
                No se pudieron cargar las facturas.
                <Button size="sm" variant="link" onClick={() => invoicesQuery.refetch()}>Reintentar</Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesQuery.isLoading && Array.from({ length: 3 }).map((_, i) => <LoadingRow key={i} />)}
                  {!invoicesQuery.isLoading && (invoicesData?.invoices || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Aún no tienes facturas. Compra créditos para generar tu primer recibo.
                      </TableCell>
                    </TableRow>
                  )}
                  {isInvoicesSeed && !invoicesQuery.isLoading && (invoicesData?.invoices || []).length > 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                        Mostrando datos demo (sin backend).
                      </TableCell>
                    </TableRow>
                  )}
                {(invoicesData?.invoices || []).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-muted-foreground">{format(inv.createdAt, 'd MMM y', { locale: es })}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">Factura #{inv.id}</span>
                        <span className="text-xs text-muted-foreground">{inv.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.paymentMethod}</TableCell>
                    <TableCell className="text-right font-semibold">${inv.amount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([`Recibo ${inv.id}\nMonto: $${inv.amount}\nCréditos: ${inv.credits}\nMétodo: ${inv.paymentMethod}`], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `recibo-${inv.id}.txt`;
                            a.click();
                            track('credits_invoice_download', { id: inv.id });
                          }}
                        >
                          Descargar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await fetch('/api/credits/receipt/email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ receiptId: inv.id, email: 'agent@example.com' }),
                            });
                            toast.success('Recibo enviado');
                            track('credits_invoice_email', { id: inv.id });
                          }}
                        >
                          Enviar email
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <span>Página {invoicePage} de {Math.max(1, Math.ceil((invoicesData?.total || 0) / INVOICE_PER_PAGE))}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                  disabled={invoicePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvoicePage((p) => p + 1)}
                  disabled={invoicePage >= Math.max(1, Math.ceil((invoicesData?.total || 0) / INVOICE_PER_PAGE))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

      {/* Ledger detail modal */}
      <Dialog open={!!selectedLedgerId} onOpenChange={(open) => { if (!open) { setSelectedLedgerId(null); setLedgerDetail(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de movimiento</DialogTitle>
            <DialogDescription>Consulta la referencia del consumo/recarga.</DialogDescription>
          </DialogHeader>
          {detailLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando...</p>}
          {detailError && <p className="text-sm text-destructive">{detailError}</p>}
          {!detailLoading && !detailError && ledgerDetail && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Concepto</span>
                <span className="font-medium">{ledgerDetail.entry.description}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto</span>
                <span className="font-semibold">{ledgerDetail.entry.type === 'credit' ? '+' : '-'}{ledgerDetail.entry.amount} cr.</span>
              </div>
              <div className="flex justify-between">
                <span>Saldo resultante</span>
                <span className="font-semibold">{ledgerDetail.entry.balance} cr.</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha</span>
                <span>{format(new Date(ledgerDetail.entry.createdAt), 'd MMM y, HH:mm', { locale: es })}</span>
              </div>
              {ledgerDetail.reference && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    track('credits_ledger_item_navigate', { id: selectedLedgerId, refType: ledgerDetail.reference?.type });
                    window.location.href = ledgerDetail.reference.path;
                  }}
                >
                  Ver {ledgerDetail.reference.label}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
