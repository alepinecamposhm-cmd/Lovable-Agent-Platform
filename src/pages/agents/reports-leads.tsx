import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportsSubnav } from '@/components/agents/reports/ReportsSubnav';
import { ReportsPeriodToggle } from '@/components/agents/reports/ReportsPeriodToggle';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { track } from '@/lib/agents/reports/analytics';
import { useLeadStore } from '@/lib/agents/leads/store';
import { mockConversations, mockMessages } from '@/lib/agents/fixtures';
import { useReportsPeriod } from '@/lib/agents/reports/period-store';
import { getCurrentUser } from '@/lib/agents/team/store';
import type { LeadBreakdownKey, LeadReportContext } from '@/lib/agents/reports/leadReport';
import { buildLeadBreakdown, buildLeadVolumeSeries, computeAnswerRatePct, filterLeadsByPeriod } from '@/lib/agents/reports/leadReport';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const BREAKDOWN_KEY_STORAGE = 'agenthub_reports_leads_breakdown';

function parseBreakdown(raw: unknown): LeadBreakdownKey {
  if (raw === 'type' || raw === 'zip' || raw === 'price') return raw;
  return 'type';
}

export default function AgentLeadReport() {
  const period = useReportsPeriod();
  const { leads } = useLeadStore();
  const currentUser = getCurrentUser();
  const [breakdown, setBreakdown] = useState<LeadBreakdownKey>(() => {
    if (typeof window === 'undefined') return 'type';
    return parseBreakdown(window.localStorage.getItem(BREAKDOWN_KEY_STORAGE));
  });
  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    track('reports.view', { report: 'leads' });
    track('reports.lead_report_view', { period, breakdown });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BREAKDOWN_KEY_STORAGE, breakdown);
  }, [breakdown]);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(t);
  }, [period, breakdown]);

  const now = useMemo(() => {
    // Keep a stable reference timestamp per (period, breakdown) change.
    void period;
    void breakdown;
    return new Date();
  }, [period, breakdown]);

  const ctx: LeadReportContext = useMemo(
    () => ({
      now,
      period,
      conversations: mockConversations,
      messages: mockMessages,
    }),
    [now, period],
  );

  const myLeads = useMemo(() => leads.filter((l) => l.assignedTo === currentUser.id), [currentUser.id, leads]);

  const computed = useMemo(() => {
    void retryToken;
    try {
      const leadsInPeriod = filterLeadsByPeriod(myLeads, period, now);
      const answerRate = computeAnswerRatePct(leadsInPeriod, ctx);
      const volume = buildLeadVolumeSeries(myLeads, ctx);
      const rows = buildLeadBreakdown(leadsInPeriod, breakdown, ctx);
      return { leadsInPeriod, answerRate, volume, rows, error: null as string | null };
    } catch (e) {
      return { leadsInPeriod: [], answerRate: 0, volume: [], rows: [], error: String(e) };
    }
  }, [breakdown, ctx, myLeads, now, period, retryToken]);

  const isEmpty = !loading && computed.leadsInPeriod.length === 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lead Report</h1>
            <p className="text-muted-foreground text-sm">
              Volumen por periodo + breakdown (tipo/ZIP/rango) + answer rate (&lt;5m).
            </p>
          </div>
          <ReportsPeriodToggle eventName="reports.lead_report_period_changed" />
        </div>
        <ReportsSubnav />
      </motion.div>

      {computed.error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm">
            <p className="font-medium text-destructive">No se pudo calcular el reporte</p>
            <p className="text-muted-foreground">{computed.error}</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => setRetryToken((t) => t + 1)}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Leads (periodo)" value={loading ? '—' : String(computed.leadsInPeriod.length)} helper={periodLabel(period)} />
        <KpiCard label="Answer rate <5m" value={loading ? '—' : `${computed.answerRate}%`} helper="Primer contacto <5m" />
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Volumen de leads</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="h-full rounded-lg bg-muted/40 animate-pulse" />
            ) : computed.volume.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sin datos para este periodo.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={computed.volume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs
              value={breakdown}
              onValueChange={(v) => {
                const next = parseBreakdown(v);
                if (next === breakdown) return;
                track('reports.lead_report_breakdown_changed', { from: breakdown, to: next });
                setBreakdown(next);
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="type" className="flex-1">Tipo</TabsTrigger>
                <TabsTrigger value="zip" className="flex-1">ZIP</TabsTrigger>
                <TabsTrigger value="price" className="flex-1">Rango</TabsTrigger>
              </TabsList>
              <TabsContent value={breakdown} className="mt-3">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{breakdownTitle(breakdown)}</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                        <TableHead className="text-right">Answer %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="py-8">
                            <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {computed.rows.map((row) => (
                            <TableRow key={row.key}>
                              <TableCell className="font-medium">{row.key}</TableCell>
                              <TableCell className="text-right">{row.leads}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={row.answerRate < 80 ? 'destructive' : 'secondary'}>
                                  {row.answerRate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {computed.rows.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                                Sin datos para este periodo.
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Definición MVP: primer mensaje del agente (si existe) → fallback a último contacto → fallback a aceptación.
                </p>
              </TabsContent>
            </Tabs>

            {isEmpty && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">No hay leads en este periodo</p>
                <p className="text-muted-foreground text-xs mt-1">Prueba 30d/90d/All para ver historial.</p>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/agents/reports">Volver a Overview</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/agents/leads">Ver todos los leads</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function breakdownTitle(key: LeadBreakdownKey) {
  if (key === 'type') return 'Tipo';
  if (key === 'zip') return 'ZIP';
  return 'Rango';
}

function periodLabel(period: string) {
  if (period === 'all') return 'Todo tiempo';
  return `Últimos ${period}`;
}

function KpiCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
      </CardContent>
    </Card>
  );
}
