import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpCircle, Upload } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Mail,
  ShieldCheck,
  ShieldHalf,
  PauseCircle,
  MapPin,
  UserPlus,
  Users2,
  Trash2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockAgent, mockAgentPerformance, mockAgentPerformanceSeries, mockLeads, mockRoutingEvents, mockTeamAgents } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useRoutingStore, addRule, deleteRule, togglePauseAgent, updateRule, moveRule, getRoutingAlert, setFallback, getFallback } from '@/lib/agents/routing/store';
import { useTeamStore, addInvite, updateRole, removeMember, isLastAdmin, getCurrentUser, acceptInvite, transferOwnership, listMembers, listInvites, removeInvite } from '@/lib/agents/team/store';
import { reassignLead, listLeads } from '@/lib/agents/leads/store';
import { add as addNotification } from '@/lib/agents/notifications/store';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addAuditEvent, listAuditEvents } from '@/lib/audit/store';
import type { LeadStage } from '@/types/agents';
import { Separator } from '@/components/ui/separator';

type SortableRowProps = {
  rule: ReturnType<typeof useRoutingStore>['rules'][number];
  index: number;
  teamMembers: typeof mockTeamAgents;
  conflicts: Set<string>;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  slaSeconds: number;
};

function SortableRuleRow({ rule, index, teamMembers, conflicts, onToggleActive, onDelete, onMove, slaSeconds }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const assignees = rule.assignees && rule.assignees.length > 0 ? rule.assignees : [rule.assignToAgentId];
  const names = assignees
    .map((id) => teamMembers.find((m) => m.id === id)?.firstName || 'Agente')
    .join(', ');
  const conflict = conflicts.has(rule.id);
  return (
    <TableRow ref={setNodeRef} style={style} className={conflict ? 'bg-warning/10' : undefined}>
      <TableCell className="text-xs text-muted-foreground">
        <button className="cursor-grab text-muted-foreground" {...attributes} {...listeners} aria-label="Reordenar">
          ☰ #{index + 1}
        </button>
      </TableCell>
      <TableCell className="font-medium">{rule.zone}</TableCell>
      <TableCell className="text-sm">
        {rule.minPrice ? `$${rule.minPrice.toLocaleString()}` : '—'} - {rule.maxPrice ? `$${rule.maxPrice.toLocaleString()}` : '—'}
      </TableCell>
      <TableCell className="text-sm">
        {rule.strategy === 'round_robin' && <Badge variant="secondary" className="mr-1">RR</Badge>}
        {names}
      </TableCell>
      <TableCell>
        <Badge variant={slaSeconds > 300 ? 'destructive' : 'secondary'}>{slaSeconds || '—'}</Badge>
      </TableCell>
      <TableCell>
        <Button variant={rule.active ? 'default' : 'outline'} size="sm" onClick={() => onToggleActive(rule.id, !rule.active)}>
          {rule.active ? 'Activo' : 'Inactivo'}
        </Button>
      </TableCell>
      <TableCell className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onMove(rule.id, 'up')} disabled={index === 0}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onMove(rule.id, 'down')}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(rule.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
        {conflict && <Badge variant="destructive">Conflicto</Badge>}
      </TableCell>
    </TableRow>
  );
}

function BulkReassignModal({ memberId }: { memberId: string }) {
  const leads = listLeads();
  const count = leads.filter((l) => l.assignedTo === memberId).length;
  const [target, setTarget] = useState<string>('');
  const members = listMembers().filter((m) => m.id !== memberId);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reasignar leads</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        <p>Tienes {count} leads asignados a este miembro.</p>
        <select className="w-full border rounded-md px-3 py-2" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Selecciona destino</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.firstName}</option>
          ))}
        </select>
        <Button
          className="w-full"
          disabled={!target || count === 0}
          onClick={() => {
            leads.filter((l) => l.assignedTo === memberId).forEach((lead) => {
              reassignLead(lead.id, target);
            });
            addNotification({
              type: 'lead',
              title: 'Reasignación completada',
              body: `${count} leads reasignados`,
              actionUrl: '/agents/leads',
            });
            addAuditEvent({ action: 'bulk_reassign', actor: 'agent-1', domain: 'team', payload: { from: memberId, to: target, count } });
            toast({ title: 'Listo', description: `${count} leads movidos` });
          }}
        >
          Confirmar
        </Button>
      </div>
    </DialogContent>
  );
}

function MiniLineChart({ points }: { points: { x: number; y: number }[] }) {
  const width = 260;
  const height = 120;
  if (!points.length) return <div className="h-[120px] flex items-center justify-center text-xs text-muted-foreground">Sin datos</div>;
  const maxY = Math.max(...points.map((p) => p.y), 1);
  const minY = 0;
  const toCoord = (p: { x: number; y: number }) => {
    const x = (p.x / Math.max(points[points.length - 1].x || 1, 1)) * width;
    const y = height - ((p.y - minY) / (maxY - minY || 1)) * height;
    return { x, y };
  };
  const path = points
    .map((p, idx) => {
      const { x, y } = toCoord(p);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="text-primary">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, idx) => {
        const { x, y } = toCoord(p);
        return <circle key={idx} cx={x} cy={y} r={3} fill="currentColor" />;
      })}
    </svg>
  );
}

function MiniBarChart({ buckets }: { buckets: { label: string; value: number }[] }) {
  const max = Math.max(...buckets.map((b) => b.value), 1);
  return (
    <div className="grid gap-2">
      {buckets.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <div className="text-xs w-28 truncate" title={b.label}>{b.label}</div>
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${(b.value / max) * 100}%` }}
            />
          </div>
          <div className="w-8 text-right text-xs">{b.value}</div>
        </div>
      ))}
      {buckets.length === 0 && <p className="text-xs text-muted-foreground">Sin datos</p>}
    </div>
  );
}

function PerformanceCard() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [filterMode, setFilterMode] = useState<'all' | 'zone' | 'type'>('all');
  const [view, setView] = useState<'kpi' | 'report'>('kpi');
  const [zipFilter, setZipFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [digest, setDigest] = useState(() => {
    if (typeof window === 'undefined') return { enabled: false, day: 'Mon', hour: '09:00' };
    return JSON.parse(window.localStorage.getItem('agenthub_team_digest') || '{"enabled":false,"day":"Mon","hour":"09:00"}');
  });
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (range === '7d' ? 7 : 30));
  const filteredSeries = mockAgentPerformanceSeries.filter((d) => new Date(d.date) >= startDate);
  const filteredLeads = mockLeads.filter((l) => l.createdAt >= startDate);

  const aggSeries = filteredSeries.reduce<Record<string, { leads: number; resp: number[]; appts: number; rating: number[] }>>((acc, row) => {
    if (!acc[row.agentId]) acc[row.agentId] = { leads: 0, resp: [], appts: 0, rating: [] };
    acc[row.agentId].leads += row.leads;
    acc[row.agentId].resp.push(row.respUnder5m);
    acc[row.agentId].appts += row.appointments;
    acc[row.agentId].rating.push(row.rating);
    return acc;
  }, {});

  const kpiRows = Object.entries(aggSeries).map(([agentId, data]) => {
    const member = mockTeamAgents.find((m) => m.id === agentId);
    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const avgRating = data.rating.length ? (data.rating.reduce((a, b) => a + b, 0) / data.rating.length).toFixed(1) : '—';
    const agentLeads = filteredLeads.filter((l) => l.assignedTo === agentId);
    const answerCount = agentLeads.filter((l) => l.acceptedAt).length;
    const answerRate = agentLeads.length ? Math.round((answerCount / agentLeads.length) * 100) : 0;
    const ttaSeconds = agentLeads
      .filter((l) => l.assignedAt && l.acceptedAt)
      .map((l) => Math.max(1, (l.acceptedAt!.getTime() - l.assignedAt!.getTime()) / 1000));
    const ttaAvg = ttaSeconds.length ? Math.round(ttaSeconds.reduce((a, b) => a + b, 0) / ttaSeconds.length) : 0;
    return {
      agentId,
      member,
      leads: data.leads,
      resp: data.resp.length ? avg(data.resp) : 0,
      appts: data.appts,
      rating: avgRating,
      tta: ttaAvg,
      answerRate,
    };
  });

  const totalLeads = kpiRows.reduce((a, b) => a + b.leads, 0);
  const avgResp = kpiRows.length ? Math.round(kpiRows.reduce((a, b) => a + b.resp, 0) / kpiRows.length) : 0;
  const avgAppts = kpiRows.reduce((a, b) => a + b.appts, 0);

  const byDate = filteredSeries.reduce<Record<string, number>>((acc, row) => {
    acc[row.date] = (acc[row.date] || 0) + row.leads;
    return acc;
  }, {});
  const linePoints = Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, leads], idx) => ({ x: idx + 1, y: leads }));

  const zoneBuckets = filteredLeads.reduce<Record<string, number>>((acc, lead) => {
    const zone = lead.preferredZones?.[0] || 'Sin zona';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});
  const typeBuckets = filteredLeads.reduce<Record<string, number>>((acc, lead) => {
    const type = lead.propertyType || lead.interestedIn || 'Otro';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const barBuckets = Object.entries(filterMode === 'zone' ? zoneBuckets : typeBuckets).map(([label, value]) => ({ label, value }));

  const funnelStages: LeadStage[] = ['new', 'contacted', 'appointment_set', 'toured', 'closed'];
  const funnelCounts = funnelStages.map((stage) => ({
    stage,
    value: filteredLeads.filter((l) => l.stage === stage).length,
  }));
  const funnelByAgent = mockTeamAgents.map((agent) => ({
    agent,
    counts: funnelStages.map((stage) => filteredLeads.filter((l) => l.assignedTo === agent.id && l.stage === stage).length),
  }));

  const allZips = Array.from(new Set(mockLeads.map((l) => l.zip).filter(Boolean))) as string[];
  const allTypes = Array.from(new Set(mockLeads.map((l) => l.propertyType || l.interestedIn)));
  const allPrices = Array.from(new Set(mockLeads.map((l) => l.priceBucket).filter(Boolean))) as string[];

  const reportRows = mockLeads
    .filter((l) => !zipFilter || zipFilter === 'all' || l.zip === zipFilter)
    .filter((l) => !typeFilter || typeFilter === 'all' || l.propertyType === typeFilter || l.interestedIn === typeFilter)
    .filter((l) => !priceFilter || priceFilter === 'all' || l.priceBucket === priceFilter)
    .map((l) => ({
      zip: l.zip || 'NA',
      type: l.propertyType || l.interestedIn,
      price: l.priceBucket || 'NA',
      answerRate: l.acceptedAt ? 100 : 60,
    }));

  const exportCsv = (rowsToExport: any[], filename: string) => {
    if (!rowsToExport.length) {
      toast({ title: 'Sin datos para exportar', variant: 'destructive' });
      return;
    }
    const header = Object.keys(rowsToExport[0] || {}).join(',') + '\n';
    const body = rowsToExport.map((r) => Object.values(r).join(',')).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base">Performance del equipo</CardTitle>
          <p className="text-sm text-muted-foreground">Funnel, KPIs y reportes filtrables.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant={range === '7d' ? 'default' : 'outline'} onClick={() => setRange('7d')}>7d</Button>
          <Button size="sm" variant={range === '30d' ? 'default' : 'outline'} onClick={() => setRange('30d')}>30d</Button>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="kpi">KPIs</TabsTrigger>
              <TabsTrigger value="report">Lead Report</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {view === 'kpi' && (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card className="border bg-primary/5">
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground">Leads recibidos</p>
                  <p className="text-xl font-semibold">{totalLeads}</p>
                </CardContent>
              </Card>
              <Card className="border bg-primary/5">
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground">% &lt;5m promedio</p>
                  <p className="text-xl font-semibold">{avgResp}%</p>
                </CardContent>
              </Card>
              <Card className="border bg-primary/5">
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground">Citas</p>
                  <p className="text-xl font-semibold">{avgAppts}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Volumen por día</CardTitle>
                  <p className="text-xs text-muted-foreground">Lead funnel (línea)</p>
                </CardHeader>
                <CardContent>
                  <MiniLineChart points={linePoints} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{filterMode === 'zone' ? 'Leads por zona' : 'Leads por tipo'}</CardTitle>
                  <p className="text-xs text-muted-foreground">Distribución</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      className="text-sm rounded-md border px-2 py-1"
                      value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value as any)}
                    >
                      <option value="zone">Por zona</option>
                      <option value="type">Por tipo</option>
                    </select>
                    <Button size="sm" variant="outline" onClick={() => exportCsv(barBuckets, `team-distrib-${filterMode}.csv`)}>Exportar CSV</Button>
                  </div>
                  <MiniBarChart buckets={barBuckets} />
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Funnel por etapa</CardTitle>
                  <p className="text-xs text-muted-foreground">New → Closed</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {funnelCounts.map((f) => (
                    <div key={f.stage} className="flex items-center gap-2">
                      <span className="w-24 text-xs capitalize">{f.stage.replace('_', ' ')}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${totalLeads ? (f.value / totalLeads) * 100 : 0}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs">{f.value}</span>
                    </div>
                  ))}
                  {funnelCounts.every((f) => f.value === 0) && <p className="text-xs text-muted-foreground">Sin datos en este rango.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conversiones por agente</CardTitle>
                  <p className="text-xs text-muted-foreground">Etapas por agente</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {funnelByAgent.map(({ agent, counts }) => (
                    <div key={agent.id} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="h-7 w-7"><AvatarFallback>{agent.firstName[0]}</AvatarFallback></Avatar>
                        <span>{agent.firstName}</span>
                      </div>
                      <div className="flex gap-2 text-[11px] text-muted-foreground">
                        {counts.map((c, idx) => (
                          <Badge key={`${agent.id}-${idx}`} variant="outline">
                            {funnelStages[idx].slice(0, 3)}: {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3 mb-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={digest.enabled}
                  onChange={(e) => {
                    const next = { ...digest, enabled: e.target.checked };
                    setDigest(next);
                    if (typeof window !== 'undefined') window.localStorage.setItem('agenthub_team_digest', JSON.stringify(next));
                  }}
                />
                Digest semanal (lunes 9am por defecto)
              </label>
              <select
                className="border rounded px-2 py-1"
                value={digest.day}
                onChange={(e) => {
                  const next = { ...digest, day: e.target.value };
                  setDigest(next);
                  if (typeof window !== 'undefined') window.localStorage.setItem('agenthub_team_digest', JSON.stringify(next));
                }}
              >
                {['Mon','Tue','Wed','Thu','Fri'].map((d) => <option key={d}>{d}</option>)}
              </select>
              <input
                type="time"
                className="border rounded px-2 py-1"
                value={digest.hour}
                onChange={(e) => {
                  const next = { ...digest, hour: e.target.value };
                  setDigest(next);
                  if (typeof window !== 'undefined') window.localStorage.setItem('agenthub_team_digest', JSON.stringify(next));
                }}
              />
            </div>

            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agente</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>% &lt;5m</TableHead>
                    <TableHead>TTA (s)</TableHead>
                    <TableHead>Answer %</TableHead>
                    <TableHead>Citas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiRows.map((row) => (
                    <TableRow key={row.agentId}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{row.member?.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{row.member?.firstName}</p>
                          <p className="text-xs text-muted-foreground">{row.member?.role}</p>
                        </div>
                      </TableCell>
                      <TableCell>{row.leads}</TableCell>
                      <TableCell>{row.resp}%</TableCell>
                      <TableCell>
                        <Badge variant={row.tta > 300 ? 'destructive' : 'secondary'}>{row.tta || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.answerRate < 80 ? 'destructive' : 'secondary'}>{row.answerRate}%</Badge>
                      </TableCell>
                      <TableCell>{row.appts}</TableCell>
                    </TableRow>
                  ))}
                  {kpiRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">Sin datos de performance.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {view === 'report' && (
          <Card className="border">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm">Lead Report</CardTitle>
                <p className="text-xs text-muted-foreground">ZIP / tipo / rango + answer rate</p>
              </div>
              <div className="flex gap-2 items-center">
                <select className="rounded-md border px-2 py-1 text-sm" value={zipFilter} onChange={(e) => setZipFilter(e.target.value)}>
                  <option value="all">ZIP (todos)</option>
                  {allZips.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
                <select className="rounded-md border px-2 py-1 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">Tipo (todos)</option>
                  {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="rounded-md border px-2 py-1 text-sm" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                  <option value="all">Rango (todos)</option>
                  {allPrices.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <Button size="sm" variant="outline" onClick={() => exportCsv(reportRows, 'lead-report.csv')}>Exportar CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ZIP</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Rango</TableHead>
                    <TableHead>Answer %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportRows.map((r, idx) => (
                    <TableRow key={`${r.zip}-${idx}`}>
                      <TableCell>{r.zip}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.price}</TableCell>
                      <TableCell>
                        <Badge variant={r.answerRate < 80 ? 'destructive' : 'secondary'}>{r.answerRate}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">Sin datos para estos filtros.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

function AuditCard({ filter, onFilter, dateRange, onDateRange }: { filter: string; onFilter: (v: string) => void; dateRange: 'all' | '7d' | '30d'; onDateRange: (v: 'all' | '7d' | '30d') => void }) {
  const now = Date.now();
  const minDate = dateRange === 'all' ? 0 : now - (dateRange === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000;
  const events = listAuditEvents()
    .filter((e) => filter === 'all' || e.action.startsWith(filter))
    .filter((e) => new Date(e.createdAt).getTime() >= minDate);

  const exportCsv = () => {
    const header = 'Accion,Actor,Payload,Fecha\n';
    const body = events.map((e) => `${e.action},${e.actor || 'system'},${JSON.stringify(e.payload || {})},${new Date(e.createdAt).toISOString()}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-audit-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base">Auditoría del equipo</CardTitle>
          <p className="text-sm text-muted-foreground">Roles, ruteo, pausas y reasignaciones.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="border rounded-md px-2 py-2 text-sm" value={filter} onChange={(e) => onFilter(e.target.value)}>
            <option value="all">Todo</option>
            <option value="routing">Ruteo</option>
            <option value="role">Roles</option>
            <option value="invite">Invitaciones</option>
            <option value="ownership">Liderazgo</option>
            <option value="bulk_reassign">Reasignaciones</option>
          </select>
          <select className="border rounded-md px-2 py-2 text-sm" value={dateRange} onChange={(e) => onDateRange(e.target.value as any)}>
            <option value="all">Todo tiempo</option>
            <option value="7d">Últimos 7d</option>
            <option value="30d">Últimos 30d</option>
          </select>
          <Button size="sm" variant="outline" onClick={exportCsv}>Exportar CSV</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acción</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.action}</TableCell>
                  <TableCell>{ev.actor || 'system'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{JSON.stringify(ev.payload || {})}</TableCell>
                  <TableCell className="text-xs">{new Date(ev.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">Sin eventos aún.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentTeam() {
  const { members, invites } = useTeamStore();
  const routingState = useRoutingStore();
  const pausedAgents = routingState.paused;
  const [inviteEmail, setInviteEmail] = useState('');
  const [newZone, setNewZone] = useState('');
  const [newMin, setNewMin] = useState<number | ''>('');
  const [newMax, setNewMax] = useState<number | ''>('');
  const [newAssignee, setNewAssignee] = useState(members[0]?.id ?? mockAgent.id);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [strategyRR, setStrategyRR] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [routingAlert, setRoutingAlertFlag] = useState<boolean>(() => getRoutingAlert());
  const [fallback, setFallbackStrategy] = useState(getFallback());
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditDateRange, setAuditDateRange] = useState<'all' | '7d' | '30d'>('all');
  const [reminderConfig, setReminderConfig] = useState<{ enabled: boolean; minutes: number; stage: LeadStage }>(() => {
    if (typeof window === 'undefined') return { enabled: false, minutes: 30, stage: 'new' };
    return JSON.parse(window.localStorage.getItem('agenthub_team_reminders') || '{"enabled":false,"minutes":30,"stage":"new"}');
  });
  const [activeSection, setActiveSection] = useState<'members' | 'routing' | 'performance' | 'audit'>('members');
  const [showTop, setShowTop] = useState(false);
  const currentUser = getCurrentUser();
  const candidateOwner = (currentId: string) => {
    const owner = members.find((m) => m.role === 'owner');
    if (owner) return owner.id;
    return currentId;
  };

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (members.length && !members.find((m) => m.id === newAssignee)) {
      setNewAssignee(members[0].id);
    }
  }, [members, newAssignee]);

  useEffect(() => {
    setRoutingAlertFlag(getRoutingAlert());
  }, [routingState.rules, routingState.paused]);

  // Recordatorios automáticos (mock)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = 'agenthub_team_reminders';
    window.localStorage.setItem(key, JSON.stringify(reminderConfig));
    if (!reminderConfig.enabled) return;
    const interval = setInterval(() => {
      const stuckLead = listLeads().find((l) => l.stage === reminderConfig.stage);
      if (stuckLead) {
        addNotification({
          type: 'task',
          title: 'Recordatorio de equipo',
          body: `${stuckLead.firstName} lleva tiempo en ${reminderConfig.stage}`,
          actionUrl: `/agents/leads/${stuckLead.id}`,
        });
        addAuditEvent({ action: 'team_reminder_triggered', actor: currentUser.id, domain: 'team', payload: { leadId: stuckLead.id } });
        toast({ title: 'Recordatorio enviado', description: `${stuckLead.firstName} necesita atención` });
      }
    }, 1000 * 15); // cada 15s en mock
    return () => clearInterval(interval);
  }, [reminderConfig, currentUser.id]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowTop(y > 400);
      const sections: ('members' | 'routing' | 'performance' | 'audit')[] = ['members', 'routing', 'performance', 'audit'];
      let current: typeof sections[number] = 'members';
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 120) current = id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const teamMembers = members;

  const performanceRows = useMemo(() => {
    return mockAgentPerformance.map((row) => {
      const member = members.find((m) => m.id === row.agentId);
      return { ...row, member };
    }).filter((row) => row.member);
  }, [members]);

  const isLeader = currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'broker';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const ruleSlaMap = useMemo(() => {
    const map: Record<string, number> = {};
    routingState.rules.forEach((rule, idx) => {
      const events = mockRoutingEvents.filter((e) => e.ruleId === rule.id);
      const durations = events.length ? events.map((e) => e.durationMs / 1000) : [120 + idx * 30];
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      map[rule.id] = avg;
    });
    return map;
  }, [routingState.rules]);
  const slaBreach = useMemo(() => Object.values(ruleSlaMap).some((v) => v > 300), [ruleSlaMap]);

  const conflicts = useMemo(() => {
    const rows = routingState.rules;
    const overlaps: Set<string> = new Set();
    rows.forEach((a, i) => {
      rows.forEach((b, j) => {
        if (i >= j) return;
        if (a.zone.toLowerCase() === b.zone.toLowerCase()) {
          const aMin = a.minPrice ?? -Infinity;
          const aMax = a.maxPrice ?? Infinity;
          const bMin = b.minPrice ?? -Infinity;
          const bMax = b.maxPrice ?? Infinity;
          const overlap = aMin <= bMax && bMin <= aMax;
          if (overlap) {
            overlaps.add(a.id);
            overlaps.add(b.id);
          }
        }
      });
    });
    return overlaps;
  }, [routingState.rules]);
  const track = (event: string, properties?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    }).catch(() => {});
  };

  const scrollToSection = (id: 'members' | 'routing' | 'performance' | 'audit') => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportAuditAll = () => {
    const events = listAuditEvents();
    if (!events.length) {
      toast({ title: 'Sin datos para exportar', variant: 'destructive' });
      return;
    }
    const header = 'Accion,Actor,Payload,Fecha\n';
    const body = events.map((e) => `${e.action},${e.actor || 'system'},${JSON.stringify(e.payload || {})},${new Date(e.createdAt).toISOString()}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-audit.csv';
    a.click();
    URL.revokeObjectURL(url);
    track('team.audit_export_all');
  };

  if (!isLeader) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Permiso requerido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Necesitas rol de líder o admin para acceder a Equipo. Contacta a tu administrador.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInvite = () => {
    if (!inviteEmail) return;
    setIsSubmittingInvite(true);
    try {
      const inv = addInvite(inviteEmail, 'agent');
      const link = `${window.location.origin}/invite/${inv.token}`;
      navigator.clipboard.writeText(link).catch(() => {});
      toast({ title: 'Invitación enviada', description: `Copiado el enlace: ${link}` });
      track('team.invite_sent', { email: inviteEmail, token: inv.token });
      setInviteEmail('');
    } catch (e) {
      toast({ title: 'No se pudo enviar la invitación', variant: 'destructive' });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRoleChange = (id: string, role: 'owner' | 'admin' | 'agent' | 'assistant' | 'broker') => {
    if (isLastAdmin(id) && role !== 'owner' && role !== 'admin') {
      const candidate = prompt('Eres el último owner/admin. Ingresa ID del nuevo owner:');
      if (!candidate) return;
      transferOwnership(id, candidate);
      toast({ title: 'Liderazgo transferido', description: `Nuevo owner: ${candidate}` });
      track('team.leadership_transferred', { from: id, to: candidate });
      return;
    }
    const confirmed = window.confirm('¿Confirmas cambiar el rol?');
    if (!confirmed) return;
    if (role === 'owner') {
      const fromOwner = candidateOwner(id);
      if (fromOwner && fromOwner !== id) transferOwnership(fromOwner, id);
    } else {
      updateRole(id, role);
    }
    track('team.role_changed', { memberId: id, role });
    toast({ title: 'Rol actualizado', description: 'Los permisos se aplicarán inmediatamente.' });
  };

  const handleRemove = (memberId: string) => {
    if (isLastAdmin(memberId)) {
      const candidate = prompt('Debes transferir liderazgo antes de eliminar. ID nuevo owner:');
      if (!candidate) return;
      transferOwnership(memberId, candidate);
      track('team.leadership_transferred', { from: memberId, to: candidate });
      toast({ title: 'Liderazgo transferido', description: `Owner: ${candidate}` });
    }
    const leads = listLeads().filter((l) => l.assignedTo === memberId);
    const fallback = members.find((m) => m.id !== memberId)?.id;
    const reassignee = prompt(`Reasignar ${leads.length} lead(s) a (id agente):`, fallback || mockAgent.id);
    if (!reassignee) return;
    removeMember(memberId, reassignee);
    leads.forEach((lead) => reassignLead(lead.id, reassignee));
    addNotification({
      type: 'system',
      title: 'Miembro eliminado',
      body: `Se reasignaron ${leads.length} leads al agente seleccionado`,
    });
    track('team.member_removed', { memberId, reassignedTo: reassignee, leads: leads.length });
    toast({ title: 'Miembro eliminado', description: `Leads reasignados a ${reassignee}` });
  };

  const addRoutingRule = () => {
    if (!newZone) return;
    addRule({
      zone: newZone,
      minPrice: newMin === '' ? undefined : Number(newMin),
      maxPrice: newMax === '' ? undefined : Number(newMax),
      assignToAgentId: newAssignee,
      assignees: strategyRR ? (assignees.length ? assignees : [newAssignee]) : undefined,
      strategy: strategyRR ? 'round_robin' : 'single',
    });
    track('team.routing_rule_created', { zone: newZone, min: newMin || undefined, max: newMax || undefined, assignee: newAssignee });
    setNewZone('');
    setNewMin('');
    setNewMax('');
    setAssignees([]);
    setStrategyRR(false);
    setWizardOpen(false);
    setWizardStep(1);
    toast({ title: 'Regla creada', description: 'Se aplicará al próximo lead que coincida.' });
  };

  const toggleRuleActive = (id: string, active: boolean) => updateRule(id, { active });
  const handleSetFallback = (value: 'owner' | 'unassigned') => {
    setFallbackStrategy(value);
    setFallback(value);
    track('team.routing_fallback_set', { value });
    setRoutingAlertFlag(false);
  };

  const isLoadingUI = loading;
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-7xl mx-auto px-4 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipo</h1>
          <p className="text-muted-foreground">Miembros, ruteo, performance y auditoría en una vista.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => { scrollToSection('members'); document.querySelector('input[placeholder=\"email@equipo.com\"]')?.focus(); }}>
            <Users2 className="h-4 w-4 mr-1" /> Invitar
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setWizardOpen(true); setWizardStep(1); scrollToSection('routing'); }}>
            <MapPin className="h-4 w-4 mr-1" /> Agregar regla
          </Button>
          <Button variant="ghost" size="sm" onClick={exportAuditAll}>
            <Upload className="h-4 w-4 mr-1" /> Export audit
          </Button>
        </div>
      </div>

      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur border-b py-2">
        <div className="flex gap-2">
          {(['members','routing','performance','audit'] as const).map((id) => (
            <Button
              key={id}
              variant={activeSection === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => scrollToSection(id)}
            >
              {id === 'members' && 'Miembros'}
              {id === 'routing' && 'Ruteo'}
              {id === 'performance' && 'Performance'}
              {id === 'audit' && 'Auditoría'}
            </Button>
          ))}
        </div>
      </div>

      {/* Miembros + Invitaciones */}
      <section id="members" className="space-y-4 scroll-mt-24">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Miembros</CardTitle>
                <p className="text-sm text-muted-foreground">Roles, permisos y reasignaciones.</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Users2 className="h-4 w-4" /> {isLoadingUI ? '--' : teamMembers.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Input
                  placeholder="email@equipo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="sm:w-64"
                />
                <Button onClick={handleInvite} disabled={!inviteEmail || isSubmittingInvite} className="gap-2">
                  {isSubmittingInvite && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enviar y copiar enlace
                </Button>
              </div>
              {isLoadingUI && (
                <div className="space-y-2">
                  <div className="h-12 bg-muted/60 rounded-md animate-pulse" />
                  <div className="h-12 bg-muted/60 rounded-md animate-pulse" />
                </div>
              )}
              {!isLoadingUI && teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <select
                    className="text-sm rounded-md border px-2 py-1"
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="broker">Broker</option>
                    <option value="agent">Agente</option>
                  </select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Reasignar leads</Button>
                    </DialogTrigger>
                    <BulkReassignModal memberId={member.id} />
                  </Dialog>
                  {member.id !== currentUser.id && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(member.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invitaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingUI && <div className="h-10 bg-muted/50 rounded animate-pulse" />}
                {!isLoadingUI && invites.map((invite) => (
                  <div
                    key={invite.email}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
                  >
                    <div>
                      <p className="font-medium text-sm">{invite.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{invite.role}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Expira {invite.status === 'expired' ? '—' : formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invite.status === 'expired' ? 'destructive' : invite.status === 'accepted' ? 'default' : 'secondary'}>
                        {invite.status === 'pending' ? 'Activa' : invite.status === 'expired' ? 'Expirada' : 'Usada'}
                      </Badge>
                      {invite.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            acceptInvite(invite.id);
                            track('team.invite_accepted', { email: invite.email });
                            toast({ title: 'Invitación aceptada', description: `${invite.email} ahora es miembro.` });
                          }}
                        >
                          Marcar aceptada
                        </Button>
                      )}
                      {invite.status === 'expired' && (
                        <Button size="sm" variant="ghost" onClick={() => {
                          removeInvite(invite.id);
                          toast({ title: 'Invitación eliminada', description: 'Se limpió el enlace expirado.' });
                        }}>
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!isLoadingUI && invites.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay invitaciones abiertas.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permisos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><ShieldCheck className="h-4 w-4 inline mr-2 text-success" /> Propietario: todo acceso.</p>
                <p><ShieldHalf className="h-4 w-4 inline mr-2 text-warning" /> Broker: invita agentes, ve todo el equipo, reasigna leads.</p>
                <p><ShieldHalf className="h-4 w-4 inline mr-2 text-warning/70" /> Admin: equipos, leads, listings.</p>
                <p><Mail className="h-4 w-4 inline mr-2 text-primary" /> Agente: leads asignados, inbox, calendario.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ruteo */}
      <section id="routing" className="space-y-4 scroll-mt-24">
        {routingAlert && (
          <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Sin agente disponible para ruteo. Configura fallback o reanuda un agente.
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={fallback === 'owner' ? 'default' : 'outline'} onClick={() => handleSetFallback('owner')}>Fallback owner</Button>
              <Button size="sm" variant={fallback === 'unassigned' ? 'default' : 'outline'} onClick={() => handleSetFallback('unassigned')}>Sin asignar</Button>
            </div>
          </div>
        )}
        {slaBreach && (
          <div className="p-3 rounded-md border border-warning/50 bg-warning/10 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              SLA de asignación supera 5m en alguna regla.
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Reglas de ruteo</CardTitle>
                <p className="text-sm text-muted-foreground">Motor de reglas + SLA.</p>
              </div>
              <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" onClick={() => setWizardStep(1)}>Agregar regla (Wizard)</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear regla de ruteo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={wizardStep >= 1 ? 'default' : 'outline'}>1</Badge> Zona/Precio
                      <Badge variant={wizardStep >= 2 ? 'default' : 'outline'}>2</Badge> Asignación
                      <Badge variant={wizardStep >= 3 ? 'default' : 'outline'}>3</Badge> Revisión
                    </div>
                    {wizardStep === 1 && (
                      <div className="space-y-3">
                        <Input placeholder="Zona (ej. Polanco)" value={newZone} onChange={(e) => setNewZone(e.target.value)} />
                        <div className="grid sm:grid-cols-2 gap-2">
                          <Input type="number" placeholder="Precio mín" value={newMin} onChange={(e) => setNewMin(e.target.value ? Number(e.target.value) : '')} />
                          <Input type="number" placeholder="Precio máx" value={newMax} onChange={(e) => setNewMax(e.target.value ? Number(e.target.value) : '')} />
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={() => setWizardStep(2)} disabled={!newZone}>Continuar</Button>
                        </div>
                      </div>
                    )}
                    {wizardStep === 2 && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Selecciona asignación</p>
                        <select className="rounded-md border px-3 py-2 text-sm w-full" value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>{m.firstName}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={strategyRR} onChange={(e) => setStrategyRR(e.target.checked)} />
                          Activar round-robin
                        </label>
                        {strategyRR && (
                          <div className="flex flex-wrap gap-2">
                            {teamMembers.map((m) => {
                              const checked = assignees.includes(m.id);
                              return (
                                <Button
                                  key={m.id}
                                  variant={checked ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setAssignees((prev) =>
                                      checked ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                                    );
                                  }}
                                >
                                  {checked ? '✓ ' : ''}{m.firstName}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex justify-between">
                          <Button variant="outline" onClick={() => setWizardStep(1)}>Atrás</Button>
                          <Button onClick={() => setWizardStep(3)}>Revisar</Button>
                        </div>
                      </div>
                    )}
                    {wizardStep === 3 && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Revisión</p>
                        <div className="rounded-md border p-3 text-sm bg-muted/30">
                          <p><strong>Zona:</strong> {newZone || '—'}</p>
                          <p><strong>Precio:</strong> {newMin || '—'} - {newMax || '—'}</p>
                          <p><strong>Asignación:</strong> {strategyRR ? assignees.join(', ') || newAssignee : newAssignee}</p>
                          <p><strong>Estrategia:</strong> {strategyRR ? 'Round robin' : 'Single'}</p>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" onClick={() => setWizardStep(2)}>Atrás</Button>
                          <Button onClick={addRoutingRule} disabled={!newZone}>Crear y activar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {conflicts.size > 0 && (
                <div className="p-3 rounded-md border border-warning/50 bg-warning/10 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Conflicto: reglas con misma zona y rango se solapan. Ajusta orden o rango.
                </div>
              )}
              <div className="mt-3 overflow-hidden rounded-md border">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;
                  const currentIndex = routingState.rules.findIndex((r) => r.id === active.id);
                  const overIndex = routingState.rules.findIndex((r) => r.id === over.id);
                  moveRule(active.id as string, currentIndex > overIndex ? 'up' : 'down');
                  track('team.routing_rule_reordered', { from: currentIndex, to: overIndex });
                }}>
                  <SortableContext items={routingState.rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Orden</TableHead>
                          <TableHead>Zona</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Asignación</TableHead>
                          <TableHead>TTA (s)</TableHead>
                          <TableHead>Activo</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {routingState.rules.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-sm text-muted-foreground text-center">Sin reglas activas</TableCell>
                          </TableRow>
                        )}
                        {routingState.rules.map((rule, idx) => (
                          <SortableRuleRow
                            key={rule.id}
                            rule={rule}
                            index={idx}
                            teamMembers={teamMembers}
                            conflicts={conflicts}
                            onToggleActive={toggleRuleActive}
                            onDelete={deleteRule}
                            onMove={moveRule}
                            slaSeconds={ruleSlaMap[rule.id] || 0}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </DndContext>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PauseCircle className="h-4 w-4 text-warning" />
                  Pausar agente (vacaciones)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Evita asignaciones nuevas mientras el agente está ausente.</p>
                <div className="space-y-2">
                  {teamMembers.map((member) => {
                    const isPaused = pausedAgents.has(member.id);
                    return (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/40">
                        <span>{member.firstName}</span>
                        <Button
                          variant={isPaused ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => togglePauseAgent(member.id, !isPaused)}
                        >
                          {isPaused ? 'Reanudar' : 'Pausar'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Trigger: evita nuevos leads; histórico intacto.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recordatorios automáticos</CardTitle>
                <p className="text-sm text-muted-foreground">Leads estancados → notificación al equipo.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reminderConfig.enabled}
                    onChange={(e) => setReminderConfig({ ...reminderConfig, enabled: e.target.checked })}
                  />
                  <span>Activar recordatorios</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Minutos en etapa</p>
                    <Input
                      type="number"
                      min={5}
                      value={reminderConfig.minutes}
                      onChange={(e) => setReminderConfig({ ...reminderConfig, minutes: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Etapa</p>
                    <select
                      className="rounded-md border px-2 py-2 text-sm w-full"
                      value={reminderConfig.stage}
                      onChange={(e) => setReminderConfig({ ...reminderConfig, stage: e.target.value as LeadStage })}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="appointment_set">Appointment</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {`Preview: "Lead en ${reminderConfig.stage} por ${reminderConfig.minutes}m".`}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section id="performance" className="scroll-mt-24 space-y-4">
        <PerformanceCard />
      </section>

      {/* Auditoría */}
      <section id="audit" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Auditoría reciente</h2>
            <p className="text-sm text-muted-foreground">Roles, ruteo, pausas y reasignaciones.</p>
          </div>
          <Button size="sm" variant="outline" onClick={exportAuditAll}>Exportar CSV</Button>
        </div>
        <AuditCard filter={auditFilter} onFilter={setAuditFilter} dateRange={auditDateRange} onDateRange={setAuditDateRange} />
      </section>

      {showTop && (
        <Button
          className="fixed bottom-6 right-6 shadow-lg"
          size="icon"
          variant="secondary"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUpCircle className="h-5 w-5" />
        </Button>
      )}
    </motion.div>
  );
}
