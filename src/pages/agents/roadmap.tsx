import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { Map, Target, Layers } from 'lucide-react';

interface FeatureRow {
  title: string;
  priority: 'MVP' | 'V1' | 'V2';
  trigger: string;
  value: string;
  complexity: 'Baja' | 'Media' | 'Alta';
  dependency?: string;
}

interface FeatureGroup {
  module: string;
  features: FeatureRow[];
}

const featureGroups: FeatureGroup[] = [
  {
    module: 'Inbox & Leads',
    features: [
      {
        title: 'Inbox unificado (leads + mensajes)',
        priority: 'MVP',
        trigger: 'Sí – Nuevo lead/mensaje',
        value: 'Un solo lugar para contactos nuevos, mensajes y notificaciones.',
        complexity: 'Media',
        dependency: 'API leads/mensajes realtime',
      },
      {
        title: 'Búsqueda y filtros de leads/mensajes',
        priority: 'MVP',
        trigger: 'No (uso continuo)',
        value: 'Encontrar contactos por nombre, estado o palabra clave; segmentar pipeline por prioridad.',
        complexity: 'Baja',
      },
      {
        title: 'Cambio de estado del pipeline (Kanban)',
        priority: 'MVP',
        trigger: 'No (mejora retorno indirecto)',
        value: 'Visualiza progreso y mueve leads entre etapas con drag & drop y feedback inmediato.',
        complexity: 'Media',
        dependency: 'Librería DnD (p.ej. DndKit)',
      },
      {
        title: 'Notas internas y etiquetas de lead',
        priority: 'V1',
        trigger: 'No',
        value: 'Documentar info útil ("busca 3H", crédito pre-aprobado); clasificar leads (frío, caliente).',
        complexity: 'Baja',
      },
      {
        title: 'Tareas y recordatorios (follow-up)',
        priority: 'V1',
        trigger: 'Sí – lead sin respuesta 2h; follow-up diario',
        value: 'Organiza to-dos específicos por lead y asegura seguimiento a tiempo.',
        complexity: 'Media',
        dependency: 'Calendario / agenda',
      },
    ],
  },
  {
    module: 'Chat / Inbox',
    features: [
      {
        title: 'Mensajería en tiempo real con leads',
        priority: 'MVP',
        trigger: 'Sí – nuevo mensaje',
        value: 'Comunicación centralizada estilo chat; mantiene al agente como punto de contacto único.',
        complexity: 'Media',
        dependency: 'WebSocket / infra realtime',
      },
      {
        title: 'Plantillas rápidas y adjuntos básicos',
        priority: 'V1',
        trigger: 'No (valor en eficiencia)',
        value: 'Respuestas predefinidas (saludo, solicitud de cita) y adjuntos PDF/imagen.',
        complexity: 'Media',
      },
    ],
  },
  {
    module: 'Calendario / Citas',
    features: [
      {
        title: 'Calendario integrado (agenda visitas)',
        priority: 'MVP',
        trigger: 'Sí – cita confirmada hoy',
        value: 'Visualiza citas con leads, evita olvidos con recordatorios automáticos; sincroniza disponibilidad.',
        complexity: 'Alta',
        dependency: 'Librería calendario (RBC)',
      },
      {
        title: 'Confirmar / reprogramar / cancelar visitas',
        priority: 'MVP',
        trigger: 'Sí – cita reprogramada',
        value: 'Gestionar cambios con notificación a ambos lados.',
        complexity: 'Media',
      },
    ],
  },
  {
    module: 'Listings',
    features: [
      {
        title: 'Gestión de listings del agente',
        priority: 'MVP',
        trigger: 'No (ligado a actividad)',
        value: 'Editar precio, descripción, fotos y estado; ver todos los listings en un lugar.',
        complexity: 'Media',
        dependency: 'API listings marketplace',
      },
      {
        title: 'Solicitar verificación de listing',
        priority: 'V1',
        trigger: 'Sí – listing verificado',
        value: 'Envío de documentación para sello de verificado (aumenta confianza).',
        complexity: 'Baja',
        dependency: 'Workflow verif. (backoffice)',
      },
      {
        title: 'Feed de actividad del listing',
        priority: 'MVP',
        trigger: 'Sí – actividad destacada',
        value: 'Muestra views, saves, consultas, cambios de precio; mantiene informado al agente.',
        complexity: 'Media',
        dependency: 'Tracking front (views/saves)',
      },
    ],
  },
  {
    module: 'Créditos / Billing',
    features: [
      {
        title: 'Saldo de créditos y recarga (UI)',
        priority: 'V1',
        trigger: 'Sí – saldo bajo',
        value: 'Transparencia en monetización: cuántos créditos quedan para leads/promos y recarga fácil.',
        complexity: 'Media',
        dependency: 'Pasarela pago API',
      },
      {
        title: 'Historial de consumo (ledger)',
        priority: 'V1',
        trigger: 'No (consulta eventual)',
        value: 'Tabla de movimientos: leads comprados, cargos por destacar listings, con fecha y descripción.',
        complexity: 'Baja',
      },
    ],
  },
  {
    module: 'Team',
    features: [
      {
        title: 'Gestión de miembros (roles, invitaciones)',
        priority: 'V2',
        trigger: 'No (valor para brokers)',
        value: 'Brokers invitan agentes, asignan roles y controlan accesos.',
        complexity: 'Media',
        dependency: 'API equipos/roles',
      },
      {
        title: 'Ruteo de leads (zona / precio)',
        priority: 'V2',
        trigger: 'Sí – lead reasignado',
        value: 'Asigna leads automáticamente al agente apropiado según criterios; respuesta rápida en equipos grandes.',
        complexity: 'Alta',
        dependency: 'Motor reglas back',
      },
      {
        title: 'Pausar agentes (no recibir leads)',
        priority: 'V2',
        trigger: 'No (solo evita triggers)',
        value: 'Marca agentes “de vacaciones” para no recibir leads temporalmente.',
        complexity: 'Baja',
      },
    ],
  },
  {
    module: 'Reporting / CX',
    features: [
      {
        title: 'Panel de rendimiento (lead funnel)',
        priority: 'V1',
        trigger: 'No (insight habitual)',
        value: 'Volumen de leads por periodo, breakdown por tipo/zona, tasa de respuesta y conversión a cita.',
        complexity: 'Media',
        dependency: 'Datos de nuestra DB',
      },
      {
        title: 'Customer Experience (feedback)',
        priority: 'V2',
        trigger: 'Sí – nuevo feedback',
        value: 'Recolecta feedback en etapas clave y muestra score al agente para mejorar servicio.',
        complexity: 'Alta',
        dependency: 'Integrar encuestas (email/app)',
      },
    ],
  },
];

const priorityTone: Record<FeatureRow['priority'], string> = {
  MVP: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100',
  V1: 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100',
  V2: 'bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100',
};

const complexityTone: Record<FeatureRow['complexity'], string> = {
  Baja: 'text-emerald-700 dark:text-emerald-200',
  Media: 'text-amber-700 dark:text-amber-200',
  Alta: 'text-rose-600 dark:text-rose-200',
};

export default function AgentRoadmap() {
  const total = featureGroups.reduce((acc, g) => acc + g.features.length, 0);
  const mvp = featureGroups.reduce((acc, g) => acc + g.features.filter((f) => f.priority === 'MVP').length, 0);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
          <Map className="h-4 w-4" /> Mapa de funcionalidades
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Plan de plataforma de agentes</h1>
        <p className="text-muted-foreground max-w-3xl">
          Derivado del PDF de especificación. Mantiene el tono UI actual: tarjetas limpias, micro-interacciones y
          jerarquía clara para priorizar entregables.
        </p>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="gap-2">
            <Target className="h-4 w-4" /> {mvp} MVP
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Layers className="h-4 w-4" /> {total} funcionalidades mapeadas
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-2">
        {featureGroups.map((group) => (
          <motion.div key={group.module} variants={staggerItem}>
            <Card className="border-border/60 bg-card/70 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{group.module}</span>
                  <Badge variant="outline" className="text-xs">{group.features.length} ítems</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[38%]">Funcionalidad</TableHead>
                      <TableHead className="w-[12%]">Prioridad</TableHead>
                      <TableHead className="w-[18%]">Trigger</TableHead>
                      <TableHead className="w-[20%]">Valor</TableHead>
                      <TableHead className="w-[12%]">Complejidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.features.map((feature) => (
                      <TableRow key={feature.title} className="align-top">
                        <TableCell>
                          <div className="font-medium leading-snug">{feature.title}</div>
                          {feature.dependency && (
                            <div className="text-xs text-muted-foreground mt-1">Dep: {feature.dependency}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityTone[feature.priority]}>
                            {feature.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {feature.trigger}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {feature.value}
                        </TableCell>
                        <TableCell className={`text-sm font-semibold ${complexityTone[feature.complexity]}`}>
                          {feature.complexity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
