import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useTeamReportStore } from '@/lib/agents/reports/team';
import { mockTeamAgents } from '@/lib/agents/fixtures';
import { Link } from 'react-router-dom';
import { Filter, TrendingUp } from 'lucide-react';

export default function AgentTeamReport() {
  const { kpis, leads, appointments } = useTeamReportStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const text = search.toLowerCase();
    return kpis.filter((k) => k.agentName.toLowerCase().includes(text));
  }, [kpis, search]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground text-sm">Respuesta, citas y cierres por agente (mock, estados completos).</p>
        </div>
        <div className="flex gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtrar agentes" className="w-48" />
          <Badge variant="secondary" className="gap-1"><Filter className="h-4 w-4" />{filtered.length}</Badge>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((kpi) => (
          <Card key={kpi.agentId} className="relative overflow-hidden">
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">{kpi.agentName}</CardTitle>
              <Badge variant="outline">{kpi.responseRate}%</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Resp. &lt;5m</p>
              <div className="text-xl font-semibold mb-2">{kpi.responseRate}%</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[11px]">Citas</p>
                  <p className="font-semibold text-foreground">{kpi.appointments}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[11px]">Cierres</p>
                  <p className="font-semibold text-foreground">{kpi.closed}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-6 text-sm text-muted-foreground">Empty state: sin agentes que coincidan.</CardContent>
          </Card>
        )}
      </motion.div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Tabla</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">KPIs por agente</CardTitle>
              <Badge variant="outline" className="gap-1"><TrendingUp className="h-4 w-4" />{kpis.length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agente</TableHead>
                      <TableHead>Resp. &lt;5m</TableHead>
                      <TableHead>Citas</TableHead>
                      <TableHead>Cerrados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.agentId} className="hover:bg-muted/40">
                        <TableCell>{row.agentName}</TableCell>
                        <TableCell>{row.responseRate}%</TableCell>
                        <TableCell>{row.appointments}</TableCell>
                        <TableCell>{row.closed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leads por agente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Agente</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Último contacto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/40">
                        <TableCell>
                          <Link to={`/agents/leads/${lead.id}`} className="text-primary hover:underline">
                            {lead.firstName} {lead.lastName}
                          </Link>
                        </TableCell>
                        <TableCell>{mockTeamAgents.find((a) => a.id === lead.assignedTo)?.firstName || '—'}</TableCell>
                        <TableCell className="capitalize">{lead.stage.replace('_', ' ')}</TableCell>
                        <TableCell>{lead.lastContactedAt ? lead.lastContactedAt.toLocaleDateString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">Tracking: teamreport.view, teamreport.filter</p>
    </motion.div>
  );
}
