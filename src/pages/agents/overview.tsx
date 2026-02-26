import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Building2,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { 
  mockAgent, 
  mockLeads, 
  mockAppointments, 
  mockMetrics,
  mockCreditAccount,
  mockTasks,
  mockTeamAgents,
} from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';
import { useAccess } from '@/lib/permissions/useAccess';
import { getPreviewPersonById } from '@/lib/permissions/mockPeopleCatalog';

// #region agent log
const DEBUG_INGEST = 'http://127.0.0.1:7242/ingest/09986fe5-9bd4-4263-a66c-7f830704a56d';
function logToDebug(p: Record<string, unknown>) {
  fetch(DEBUG_INGEST, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, timestamp: Date.now(), sessionId: 'debug-session' }) }).catch(() => {});
}
// #endregion

export default function AgentOverview() {
  // #region agent log
  // useEffect(() => {
  //   logToDebug({ hypothesisId: 'H1', location: 'overview.tsx:mount', message: 'AgentOverview mounted', data: {} });
  // }, []);
  // #endregion

  const access = useAccess();
  const previewPerson = getPreviewPersonById(access.effectivePersonaId);
  const activeAgentIdForData = access.role === 'agent' ? access.effectiveAgentId : null;
  const activeAgent = useMemo(
    () => mockTeamAgents.find((a) => a.id === access.effectivePersonaId) ?? mockAgent,
    [access.effectivePersonaId]
  );

  const agentLeads = useMemo(
    () => (activeAgentIdForData ? mockLeads.filter((lead) => lead.assignedTo === activeAgentIdForData) : mockLeads),
    [activeAgentIdForData]
  );

  const activeLeads = useMemo(
    () => agentLeads.filter((lead) => lead.stage !== 'closed' && lead.stage !== 'closed_lost'),
    [agentLeads]
  );

  const todayAppointments = useMemo(
    () =>
      mockAppointments.filter(
        (apt) =>
          (!activeAgentIdForData || apt.agentId === activeAgentIdForData) &&
          (format(apt.scheduledAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ||
            format(apt.scheduledAt, 'yyyy-MM-dd') === '2026-01-29')
      ),
    [activeAgentIdForData]
  );

  const pendingTasks = useMemo(
    () => mockTasks.filter((t) => t.status === 'pending' && (!activeAgentIdForData || t.agentId === activeAgentIdForData)),
    [activeAgentIdForData]
  );

  const responseTime = useMemo(() => {
    const responded = agentLeads.filter((lead) => lead.assignedAt && lead.acceptedAt);
    if (responded.length === 0) return mockMetrics.responseTimeAvg;
    const avgMs = responded.reduce((sum, lead) => sum + (lead.acceptedAt!.getTime() - lead.assignedAt!.getTime()), 0) / responded.length;
    return Math.max(1, Math.round(avgMs / 60000));
  }, [agentLeads]);

  const conversion = useMemo(() => {
    if (agentLeads.length === 0) return 0;
    const closed = agentLeads.filter((lead) => lead.stage === 'closed').length;
    return Math.round((closed / agentLeads.length) * 100);
  }, [agentLeads]);

  const appointmentsThisWeek = useMemo(
    () => mockAppointments.filter((apt) => !activeAgentIdForData || apt.agentId === activeAgentIdForData).length,
    [activeAgentIdForData]
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold tracking-tight">
          ¡Hola, {previewPerson?.name?.split(' ')[0] || activeAgent.firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tu actividad de hoy
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={staggerItem}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads.length}</div>
            <div className="flex items-center text-xs text-success mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2 esta semana
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiempo Respuesta
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseTime} min</div>
            <div className="flex items-center text-xs text-success mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -15 min vs promedio
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-success to-accent" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Citas Esta Semana
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsThisWeek}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {mockAppointments.filter(a => a.status === 'confirmed').length} confirmadas
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-info to-primary" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversión
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversion}%</div>
            <div className="flex items-center text-xs text-success mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5% vs mes pasado
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-warning to-success" />
        </Card>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-6">
          {/* Agent Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tu Score de Agente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${mockMetrics.healthScore * 2.51} 251`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{mockMetrics.healthScore}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Responsividad</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Seguimiento</span>
                      <span className="font-medium">70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Perfil completo</span>
                      <span className="font-medium">{activeAgent.profileCompletion}%</span>
                    </div>
                    <Progress value={activeAgent.profileCompletion} className="h-2" />
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">
                  <span className="font-medium">💡 Consejo:</span> Responde a los 2 leads sin actividad esta semana para subir tu score.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Leads Recientes</CardTitle>
                <CardDescription>Últimos leads que requieren atención</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/agents/leads">
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentLeads.slice(0, 4).map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/agents/leads/${lead.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lead.firstName[0]}{lead.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.interestedIn === 'buy' ? 'Comprar' : lead.interestedIn === 'sell' ? 'Vender' : 'Rentar'}
                        {lead.budgetMax && ` • Hasta $${(lead.budgetMax / 1000000).toFixed(1)}M`}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        lead.temperature === 'hot' && 'badge-hot',
                        lead.temperature === 'warm' && 'badge-warm',
                        lead.temperature === 'cold' && 'badge-cold'
                      )}
                    >
                      {lead.temperature === 'hot' ? '🔥 Caliente' : lead.temperature === 'warm' ? '☀️ Tibio' : '❄️ Frío'}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={staggerItem} className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Agenda de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">
                          {format(apt.scheduledAt, 'HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apt.duration} min
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {apt.lead?.firstName} {apt.lead?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {apt.location || 'Virtual'}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'mt-1 text-xs',
                            apt.status === 'confirmed' && 'bg-success/10 text-success',
                            apt.status === 'pending' && 'bg-warning/10 text-warning'
                          )}
                        >
                          {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tienes citas programadas para hoy
                </p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/agents/calendar">Ver calendario completo</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'w-2 h-2 mt-2 rounded-full shrink-0',
                      task.priority === 'high' && 'bg-destructive',
                      task.priority === 'medium' && 'bg-warning',
                      task.priority === 'low' && 'bg-muted-foreground'
                    )} />
                    <p className="text-sm">{task.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Credits */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Créditos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{mockCreditAccount.balance}</span>
                <span className="text-muted-foreground">créditos</span>
              </div>
              <Progress 
                value={(mockCreditAccount.balance / 200) * 100} 
                className="h-2 mt-3" 
              />
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/agents/credits">Administrar créditos</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
