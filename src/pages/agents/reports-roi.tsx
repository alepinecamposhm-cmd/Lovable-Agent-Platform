import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { mockCreditAccount, mockLedger } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { Save, Download } from 'lucide-react';

export default function AgentRoiReport() {
  const [filter, setFilter] = useState('30');
  const data = useMemo(() => {
    return [
      { name: 'Enero', gasto: 120, ingresos: 420 },
      { name: 'Feb', gasto: 200, ingresos: 380 },
      { name: 'Mar', gasto: 150, ingresos: 500 },
    ];
  }, []);

  const totalGasto = mockLedger.filter(l => l.type === 'debit').reduce((s, l) => s + l.amount, 0);
  const totalIngresos = 850; // mock

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ROI Créditos vs Cierres</h1>
          <p className="text-muted-foreground text-sm">Gasto en créditos vs ingresos simulados.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} className="w-24" />
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export (mock)</Button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Saldo créditos" value={`${mockCreditAccount.balance}`} helper="Umbral bajo: 20" />
        <Kpi label="Gasto YTD" value={`${totalGasto}`} helper="Ledger mock" />
        <Kpi label="Ingresos mock" value={`${totalIngresos}`} helper="Transacciones demo" />
        <Kpi label="ROI" value={`${Math.round((totalIngresos / Math.max(totalGasto,1))*100)/100}x`} helper="No real" />
      </motion.div>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="table">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gasto vs Ingresos</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="gasto" fill="#ef4444" name="Gasto créditos" />
                  <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0 divide-y">
              {mockLedger.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{entry.description}</span>
                  <span className={entry.type === 'debit' ? 'text-destructive' : 'text-success'}>
                    {entry.type === 'debit' ? '-' : '+'}{entry.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">Tracking: roi.view, roi.filter({filter}), roi.export_attempt</p>
    </motion.div>
  );
}

function Kpi({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helper && <div className="text-xs text-muted-foreground mt-1">{helper}</div>}
      </CardContent>
    </Card>
  );
}
