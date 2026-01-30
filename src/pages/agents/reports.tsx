import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Percent,
  TrendingUp,
  Smile,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { mockMetrics, mockLeads, mockAppointments } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { CustomerFeedbackDialog } from '@/components/agents/reports/CustomerFeedbackDialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const kpiCards = [
  {
    label: 'Respuesta <5m',
    value: `${mockMetrics.responseRate}%`,
    trend: '+3%',
    icon: Clock,
    trendPositive: true,
  },
  {
    label: 'Tiempo prom. respuesta',
    value: `${mockMetrics.responseTimeAvg} min`,
    trend: '-15 min',
    icon: Clock,
    trendPositive: true,
  },
  {
    label: 'Conversión a cita',
    value: `${mockMetrics.conversionToAppointment}%`,
    trend: '+5%',
    icon: Percent,
    trendPositive: true,
  },
  {
    label: 'No-show',
    value: `${mockMetrics.noShowRate}%`,
    trend: '-2%',
    icon: TrendingUp,
    trendPositive: true,
  },
];

const funnelData = [
  { name: 'Leads nuevos', value: mockLeads.length },
  { name: 'Contactados', value: mockLeads.filter((l) => l.stage === 'contacted').length },
  { name: 'Cita agendada', value: mockLeads.filter((l) => l.stage === 'appointment_set').length },
  { name: 'Visitas (Toured)', value: mockLeads.filter((l) => l.stage === 'toured').length },
  { name: 'Cerrados', value: mockLeads.filter((l) => l.stage === 'closed').length },
];

const weeklyActivity = [
  { week: 'Semana 1', leads: 12, citas: 4, cerrados: 1 },
  { week: 'Semana 2', leads: 18, citas: 6, cerrados: 2 },
  { week: 'Semana 3', leads: 15, citas: 5, cerrados: 1 },
  { week: 'Semana 4', leads: 20, citas: 7, cerrados: 3 },
];

export default function AgentReports() {
  const upcoming = mockAppointments.length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes y Score</h1>
          <p className="text-muted-foreground">
            KPIs de retención, velocidad y conversión inspirados en Zillow Premier Agent.
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          {upcoming} citas programadas
        </Badge>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="relative overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-xs mt-1 text-success">
                  {card.trendPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {card.trend}
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
            </Card>
          );
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actividad semanal</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#2563eb" name="Leads" />
                  <Line type="monotone" dataKey="citas" stroke="#22c55e" name="Citas" />
                  <Line type="monotone" dataKey="cerrados" stroke="#f97316" name="Cerrados" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Embudo CRM</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SLA y hábitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• SLA respuesta: &lt; 5 min (objetivo). Mantén badge de inbox en rojo hasta responder.</p>
              <p>• Return triggers: nuevo lead, nuevo mensaje, cita en 24h, saldo bajo.</p>
              <p>• Score agente mezcla velocidad (40%), seguimiento (35%), perfil completo (25%).</p>
              <Tabs defaultValue="acciones" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="acciones" className="flex-1">Acciones</TabsTrigger>
                  <TabsTrigger value="alertas" className="flex-1">Alertas</TabsTrigger>
                </TabsList>
                <TabsContent value="acciones" className="mt-3 space-y-2">
                  <Badge variant="secondary">Enviar recordatorios</Badge>
                  <Badge variant="secondary">Mover leads estancados</Badge>
                  <Badge variant="secondary">Verificar listings</Badge>
                </TabsContent>
                <TabsContent value="alertas" className="mt-3 space-y-2">
                  <Badge variant="outline">Inbox sin leer</Badge>
                  <Badge variant="outline">Saldo &lt; 20 créditos</Badge>
                  <Badge variant="outline">Citas hoy</Badge>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smile className="h-4 w-4 text-primary" />
                Customer Experience (feedback)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl">4.6</div>
                <div>
                  <p className="text-sm font-semibold">CSAT promedio</p>
                  <p className="text-xs text-muted-foreground">Recolectado post-visita y cierre.</p>
                </div>
                <Badge variant="outline" className="ml-auto">V2</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Encuestas automáticas por email/app en etapas clave.</p>
                <p>• Destaca agentes con mejor servicio y alerta outliers.</p>
                <p>• Exportar feedback para coaching.</p>
              </div>
              <CustomerFeedbackDialog />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
