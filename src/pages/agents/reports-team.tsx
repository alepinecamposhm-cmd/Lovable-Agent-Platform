import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportsSubnav } from '@/components/agents/reports/ReportsSubnav';
import { ReportsPeriodToggle } from '@/components/agents/reports/ReportsPeriodToggle';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useLeadStore } from '@/lib/agents/leads/store';
import { getCurrentUser, useTeamStore } from '@/lib/agents/team/store';
import { track } from '@/lib/agents/reports/analytics';
import { useReportsPeriod } from '@/lib/agents/reports/period-store';
import type { LeadReportContext } from '@/lib/agents/reports/leadReport';
import { mockConversations, mockMessages } from '@/lib/agents/fixtures';
import { buildTeamMemberRows, buildTeamPipeline, isLeader, TEAM_PIPELINE_STAGES } from '@/lib/agents/reports/teamReport';
import { computeAnswerRatePct, filterLeadsByPeriod } from '@/lib/agents/reports/leadReport';
import { Link, useNavigate } from 'react-router-dom';

export default function AgentTeamReport() {
  const period = useReportsPeriod();
  const { leads } = useLeadStore();
  const { members } = useTeamStore();
  const currentUser = getCurrentUser();
  const canView = isLeader(currentUser.role);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    track('reports.view', { report: 'team' });
    track('reports.team_report_view', { period });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const teamLeads = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.id));
    return leads.filter((l) => memberIds.has(l.assignedTo));
  }, [leads, members]);

  const computed = useMemo(() => {
    void retryToken;
    try {
      const leadsInPeriod = filterLeadsByPeriod(teamLeads, period, now);
      const teamAnswer = computeAnswerRatePct(leadsInPeriod, ctx);
      const pipeline = buildTeamPipeline(teamLeads, ctx);
      const rows = buildTeamMemberRows(teamLeads, members, ctx);
      return { leadsInPeriod, teamAnswer, pipeline, rows, error: null as string | null };
    } catch (e) {
      return {
        leadsInPeriod: [],
        teamAnswer: 0,
        pipeline: TEAM_PIPELINE_STAGES.map((stage) => ({ stage, count: 0 })),
        rows: [],
        error: String(e),
      };
    }
  }, [ctx, members, now, period, retryToken, teamLeads]);

  if (!canView) {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Team Report</h1>
              <p className="text-muted-foreground text-sm">Pipeline consolidado y desglose por agente.</p>
            </div>
          </div>
          <ReportsSubnav />
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="py-6">
              <p className="font-medium">Solo disponible para líderes de equipo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Este reporte está visible para roles owner/admin/broker.
              </p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/agents/reports">Volver a Overview</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  const isEmpty = !loading && computed.leadsInPeriod.length === 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Report</h1>
            <p className="text-muted-foreground text-sm">
              Pipeline consolidado + desglose por agente/estado + answer rate (&lt;5m).
            </p>
          </div>
          <ReportsPeriodToggle eventName="reports.team_report_period_changed" />
        </div>
        <ReportsSubnav />
      </motion.div>

      {computed.error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm">
            <p className="font-medium text-destructive">No se pudo calcular Team Report</p>
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
        <KpiCard label="Answer rate equipo <5m" value={loading ? '—' : `${computed.teamAnswer}%`} helper="Primer contacto <5m" />
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Pipeline consolidado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TEAM_PIPELINE_STAGES.map((stage) => {
              const row = computed.pipeline.find((p) => p.stage === stage);
              return (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{stage.replace('_', ' ')}</span>
                  <Badge variant="secondary">{loading ? '—' : row?.count ?? 0}</Badge>
                </div>
              );
            })}
            {isEmpty && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">No hay leads del equipo en este periodo</p>
                <p className="text-muted-foreground text-xs mt-1">Prueba 30d/90d/All.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Desglose por agente</CardTitle>
              <p className="text-sm text-muted-foreground">Conteos por estado + answer rate.</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead className="text-right">Contact</TableHead>
                  <TableHead className="text-right">Cita</TableHead>
                  <TableHead className="text-right">Visita</TableHead>
                  <TableHead className="text-right">Closed</TableHead>
                  <TableHead className="text-right">Answer %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10">
                      <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {computed.rows.map((row) => (
                      <TableRow
                        key={row.agentId}
                        className="cursor-pointer"
                        onClick={() => {
                          track('reports.team_report_agent_clicked', { agentId: row.agentId });
                          navigate(`/agents/profile/${row.agentId}`);
                        }}
                      >
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-right">{row.stageCounts.new}</TableCell>
                        <TableCell className="text-right">{row.stageCounts.contacted}</TableCell>
                        <TableCell className="text-right">{row.stageCounts.appointment_set}</TableCell>
                        <TableCell className="text-right">{row.stageCounts.toured}</TableCell>
                        <TableCell className="text-right">{row.stageCounts.closed}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.answerRate < 80 ? 'destructive' : 'secondary'}>
                            {row.answerRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {computed.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                          Sin datos para este periodo.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Definición MVP: primer mensaje del agente (si existe) → fallback a último contacto → fallback a aceptación.
      </p>
    </motion.div>
  );
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
