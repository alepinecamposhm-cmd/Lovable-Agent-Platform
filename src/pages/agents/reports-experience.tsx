import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { addFeedback, useCxStore } from '@/lib/agents/cx/store';
import { mockAgent } from '@/lib/agents/fixtures';
import { Star, Plus, Filter, Loader2 } from 'lucide-react';
import { ReportsSubnav } from '@/components/agents/reports/ReportsSubnav';
import { track } from '@/lib/agents/reports/analytics';

export default function AgentExperienceReport() {
  const feedback = useCxStore();
  const [filterRating, setFilterRating] = useState<'all' | number>('all');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    track('reports.view', { report: 'cx' });
  }, []);
  const filtered = useMemo(() => {
    return feedback.filter((f) => filterRating === 'all' || f.rating === filterRating);
  }, [feedback, filterRating]);

  const addQuick = () => {
    setAdding(true);
    setTimeout(() => {
      addFeedback({ agentId: mockAgent.id, rating: 5, comment: 'Respuesta ultra rápida, gracias!', source: 'survey' });
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'cx.feedback_added', rating: 5 } }));
      toast({ title: 'Feedback agregado (mock)', description: 'Persistido localmente.' });
      setAdding(false);
    }, 500);
  };

  const avg = useMemo(() => {
    if (!feedback.length) return 0;
    return Math.round((feedback.reduce((s, f) => s + f.rating, 0) / feedback.length) * 10) / 10;
  }, [feedback]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Experience</h1>
          <p className="text-muted-foreground text-sm">Feedback post-visita/cierre (mock) · estados completos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterRating('all')} className={filterRating === 'all' ? 'border-primary' : ''}>
            <Filter className="h-4 w-4" /> Todas
          </Button>
          {[5,4,3].map((r) => (
            <Button key={r} variant="outline" size="sm" onClick={() => setFilterRating(r)} className={filterRating === r ? 'border-primary' : ''}>
              {r}★
            </Button>
          ))}
          <Button size="sm" className="gap-2" onClick={addQuick} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Solicitar reseña
          </Button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ReportsSubnav />
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Score y métricas</CardTitle>
              <p className="text-sm text-muted-foreground">Baseline mock, persistido local.</p>
            </div>
            <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" /> {avg || '—'}</Badge>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            <Kpi label="CSAT" value={`${avg}/5`} trend="+0.2" />
            <Kpi label="NPS interno" value={avg > 0 ? '+40' : '—'} trend="" />
            <Kpi label="Agent Score" value={avg ? Math.round(avg*18).toString() : '—'} trend="+3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agregar feedback manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Input id="fb-comment" placeholder="Comentario" />
            <Button variant="outline" size="sm" onClick={addQuick}>Guardar (mock)</Button>
            <p className="text-xs text-muted-foreground">Persistencia mínima; usa seeds iniciales.</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feedback</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="feed">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Reseñas recientes</CardTitle>
              <Badge variant="outline">{filtered.length} items</Badge>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 && <p className="text-sm text-muted-foreground">Empty state: sin feedback aún.</p>}
              <ScrollArea className="max-h-96">
                <div className="divide-y">
                  {filtered.map((f) => (
                    <div key={f.id} className="py-3 flex items-start gap-3">
                      <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" />{f.rating}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{f.comment}</p>
                        <p className="text-xs text-muted-foreground">{f.source} · {f.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="insights">
          <Card>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Gatilla nudge si rating ≤3 (futuro).</p>
              <p>• Exportar CSV (fuera de alcance este sprint).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <p className="text-xs text-muted-foreground">Tracking: cx.view, cx.filter, cx.feedback_added, cx.request_review</p>
    </motion.div>
  );
}

function Kpi({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/30">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {trend && <p className="text-xs text-success">{trend}</p>}
    </div>
  );
}
