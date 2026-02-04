import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BadgeCheck, Clock, Percent, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReportsSubnav } from '@/components/agents/reports/ReportsSubnav';
import { ReportsPeriodToggle } from '@/components/agents/reports/ReportsPeriodToggle';
import { AgentScoreDetailsDialog } from '@/components/agents/reports/AgentScoreDetailsDialog';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { track } from '@/lib/agents/reports/analytics';
import { useReportsPeriod } from '@/lib/agents/reports/period-store';
import { useLeadStore } from '@/lib/agents/leads/store';
import { useAppointmentStore } from '@/lib/agents/appointments/store';
import { useListingStore } from '@/lib/agents/listings/store';
import { getCurrentUser } from '@/lib/agents/team/store';
import { mockConversations, mockMessages } from '@/lib/agents/fixtures';
import type { LeadReportContext } from '@/lib/agents/reports/leadReport';
import { computeOverviewKpis, buildFunnel } from '@/lib/agents/reports/overviewKpis';
import { computeAgentScore } from '@/lib/agents/reports/agentScore';
import { buildListingPerformance } from '@/lib/agents/reports/listingPerformance';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

function bucketLabel(idx: number) {
  return `Sem ${idx + 1}`;
}

export default function AgentReports() {
  const period = useReportsPeriod();
  const { leads } = useLeadStore();
  const { appointments } = useAppointmentStore();
  const { listings, activities } = useListingStore();
  const currentUser = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    track('reports.view', { report: 'overview' });
  }, []);

  useEffect(() => {
    track('reports.overview_view', { period });
  }, [period]);

  useEffect(() => {
    track('reports.listing_performance_view', { period });
  }, [period]);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(t);
  }, [period]);

  const now = useMemo(() => {
    // Keep a stable reference timestamp per period change.
    void period;
    return new Date();
  }, [period]);

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
  const myAppointments = useMemo(() => appointments.filter((a) => a.agentId === currentUser.id), [appointments, currentUser.id]);
  const myListings = useMemo(() => listings.filter((l) => l.agentId === currentUser.id), [currentUser.id, listings]);
  const myActivities = useMemo(() => {
    const listingIdSet = new Set(myListings.map((l) => l.id));
    return activities.filter((a) => listingIdSet.has(a.listingId));
  }, [activities, myListings]);

  const computed = useMemo(() => {
    void retryToken;
    try {
      const kpis = computeOverviewKpis(myLeads, myAppointments, currentUser, ctx);
      const score = computeAgentScore({
        response: kpis.answerRateUnder5m,
        performance: kpis.conversionToAppointmentPct,
        operational: kpis.profileCompletionPct,
      });

      const funnel = buildFunnel(myLeads, period, now);
      const listingPerformance = buildListingPerformance(myListings, myActivities, period, now).slice(0, 5);

      const weeklyActivity = Array.from({ length: 4 }).map((_, idx) => {
        const bucketStart = new Date(now.getTime() - (28 - idx * 7) * 24 * 60 * 60 * 1000);
        const bucketEnd = new Date(now.getTime() - (21 - idx * 7) * 24 * 60 * 60 * 1000);
        const leadsCount = myLeads.filter((l) => {
          const t = (l.assignedAt ?? l.createdAt).getTime();
          return t >= bucketStart.getTime() && t < bucketEnd.getTime();
        }).length;
        const apptsCount = myAppointments.filter((a) => {
          const t = a.scheduledAt.getTime();
          return t >= bucketStart.getTime() && t < bucketEnd.getTime();
        }).length;
        const closedCount = myLeads.filter(
          (l) =>
            l.stage === 'closed' &&
            l.updatedAt.getTime() >= bucketStart.getTime() &&
            l.updatedAt.getTime() < bucketEnd.getTime(),
        ).length;
        return { week: bucketLabel(idx), leads: leadsCount, citas: apptsCount, cerrados: closedCount };
      });

      return { kpis, score, funnel, listingPerformance, weeklyActivity, error: null as string | null };
    } catch (e) {
      const kpis = computeOverviewKpis([], [], currentUser, ctx);
      const score = computeAgentScore({ response: 0, performance: 0, operational: kpis.profileCompletionPct });
      return { kpis, score, funnel: [], listingPerformance: [], weeklyActivity: [], error: String(e) };
    }
  }, [ctx, currentUser, myActivities, myAppointments, myLeads, myListings, now, period, retryToken]);

  const isEmpty = !loading && computed.kpis.leadsReceived === 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground text-sm">
              Métricas de desempeño: respuesta, conversión, no-show, workload y cierres.
            </p>
          </div>
          <ReportsPeriodToggle eventName="reports.overview_period_changed" />
        </div>
        <ReportsSubnav />
      </motion.div>

      {computed.error && (
        <motion.div variants={staggerItem}>
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-4 text-sm">
              <p className="font-medium text-destructive">No se pudieron calcular los KPIs</p>
              <p className="text-muted-foreground">{computed.error}</p>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => setRetryToken((t) => t + 1)}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isEmpty && (
        <motion.div variants={staggerItem}>
          <Card className="bg-muted/20">
            <CardContent className="py-6">
              <p className="font-medium">Sin datos para este periodo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Prueba 30d/90d/All para ver historial, o revisa tus leads activos.
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm">
                  <Link to="/agents/leads">Ver leads</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/agents/reports/leads">Abrir Lead Report</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Clock} label="Answer rate <5m" value={loading ? '—' : `${computed.kpis.answerRateUnder5m}%`} helper="Primer contacto <5m" />
        <KpiCard icon={Clock} label="Tiempo medio 1a respuesta" value={loading ? '—' : computed.kpis.avgFirstResponseMinutes === null ? '—' : `${computed.kpis.avgFirstResponseMinutes} min`} helper="Promedio (si hay datos)" />
        <KpiCard icon={Percent} label="Conversión a cita" value={loading ? '—' : `${computed.kpis.conversionToAppointmentPct}%`} helper="Leads → al menos 1 cita" />
        <KpiCard icon={TrendingUp} label="No-show" value={loading ? '—' : `${computed.kpis.noShowRatePct}%`} helper="Citas confirmadas/completadas" />
        <KpiCard icon={Users} label="Leads activos" value={loading ? '—' : String(computed.kpis.activeLeads)} helper="En pipeline (no cerrados)" />
        <KpiCard icon={BarChart3} label="Tasa de cierre" value={loading ? '—' : `${computed.kpis.closeRatePct}%`} helper="Cerrados / leads del periodo" />
        <KpiCard icon={BadgeCheck} label="Perfil completado" value={loading ? '—' : `${computed.kpis.profileCompletionPct}%`} helper="Progreso del perfil" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {loading ? (
                <div className="h-full rounded-lg bg-muted/40 animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={computed.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" name="Leads" />
                    <Line type="monotone" dataKey="citas" stroke="hsl(var(--success))" name="Citas" />
                    <Line type="monotone" dataKey="cerrados" stroke="hsl(var(--warning))" name="Cerrados" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Embudo (pipeline)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {loading ? (
                <div className="h-full rounded-lg bg-muted/40 animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.funnel}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-4">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Agent Health Score</span>
                <Badge variant="secondary">{loading ? '—' : `${computed.score.score} · ${computed.score.label}`}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Transparente y orientado a mejora (no a juicio). Sin encuestas externas en este MVP.
              </p>
              <AgentScoreDetailsDialog
                result={computed.score}
                period={period}
                trigger={
                  <Button className="w-full" variant="outline" size="sm">
                    Ver detalles del score
                  </Button>
                }
              />
              <div className="text-xs text-muted-foreground">
                Señales: answer rate &lt;5m, conversión a cita y perfil completado.
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Desempeño por listing</CardTitle>
                <p className="text-sm text-muted-foreground">Leads generados por listing (inquiries).</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="h-20 rounded-lg bg-muted/40 animate-pulse" />
              ) : computed.listingPerformance.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Sin inquiries en este periodo.
                </div>
              ) : (
                <div className="divide-y rounded-lg border overflow-hidden">
                  {computed.listingPerformance.map((row) => (
                    <Link
                      key={row.listingId}
                      to={`/agents/listings/${row.listingId}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => track('reports.listing_performance_listing_clicked', { listingId: row.listingId })}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{row.addressLabel}</p>
                        <p className="text-xs text-muted-foreground">ZIP {row.zip ?? '—'}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{row.inquiries}</Badge>
                    </Link>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Basado en eventos `inquiry` del periodo seleccionado.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tracking: reports.view, reports.overview_view, reports.overview_period_changed, reports.nav_click, reports.score_detail_opened/closed.
      </p>
    </motion.div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
      </CardContent>
    </Card>
  );
}
