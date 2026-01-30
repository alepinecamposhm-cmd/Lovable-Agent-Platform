import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import {
  addTask,
  completeTask,
  undoCompleteTask,
  snoozeTask,
  useTaskStore,
} from '@/lib/agents/tasks/store';
import { format, isBefore, isToday, addDays, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { mockLeads } from '@/lib/agents/fixtures';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlarmClock, Clock3, Plus, RotateCcw, Bell } from 'lucide-react';

const priorityBadge: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground',
};

function TaskRow({ task }: { task: any }) {
  const [isPending, setIsPending] = useState(false);

  const handleComplete = () => {
    if (task.status === 'completed') return;
    setIsPending(true);
    const prev = completeTask(task.id);
    toast({
      title: 'Tarea completada',
      description: task.title,
      action: (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            undoCompleteTask(task.id);
            setIsPending(false);
          }}
        >
          Deshacer
        </Button>
      ),
    });
    setTimeout(() => setIsPending(false), 400);
  };

  const handleSnooze = () => {
    const nextDate = addDays(task.dueAt || new Date(), 1);
    snoozeTask(task.id, nextDate);
    toast({
      title: 'Snooze por 1 día',
      description: `${task.title} ahora vence ${format(nextDate, "d MMM, HH:mm", { locale: es })}`,
    });
  };

  return (
    <motion.div
      variants={staggerItem}
      layout
      initial={{ opacity: 0.9, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-all bg-card shadow-sm/50 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/30',
        task.status === 'completed' && 'opacity-60 line-through'
      )}
    >
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={handleComplete}
        className="mt-1"
        aria-label={task.status === 'completed' ? 'Tarea completada' : 'Completar tarea'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm leading-tight truncate">{task.title}</p>
          {task.priority && (
            <Badge variant="outline" className={cn('text-[10px]', priorityBadge[task.priority])}>
              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>
          )}
          {task.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {task.tags.slice(0, 2).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {task.dueAt ? (
            <>
              <Clock3 className="h-3 w-3" />
              <span>{format(task.dueAt, "d MMM, HH:mm", { locale: es })}</span>
              {isBefore(task.dueAt, new Date()) && task.status === 'pending' && (
                <Badge variant="destructive" className="text-[10px]">Vencida</Badge>
              )}
              {isToday(task.dueAt) && <Badge variant="outline" className="text-[10px]">Hoy</Badge>}
            </>
          ) : (
            <span>Sin fecha</span>
          )}
          {task.leadId && (
            <Link to={`/agents/leads/${task.leadId}`} className="underline-offset-4 hover:underline">
              Ver lead
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {task.status !== 'completed' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1" onClick={handleSnooze}>
                  <AlarmClock className="h-4 w-4" /> Snooze
                </Button>
              </TooltipTrigger>
              <TooltipContent>Snooze 1 día</TooltipContent>
            </Tooltip>
          )}
          {task.status === 'completed' && (
            <Button size="sm" variant="ghost" className="gap-1" onClick={() => undoCompleteTask(task.id)}>
              <RotateCcw className="h-4 w-4" /> Deshacer
            </Button>
          )}
        </div>
      </div>
      {isPending && <div className="animate-pulse text-xs text-muted-foreground">OK</div>}
    </motion.div>
  );
}

export default function AgentTasks() {
  const { tasks } = useTaskStore();
  const [tab, setTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [filterLead, setFilterLead] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return tasks.filter((t) => {
      if (filterLead !== 'all' && t.leadId !== filterLead) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (tab === 'today') return t.status === 'pending' && t.dueAt && isToday(t.dueAt);
      if (tab === 'upcoming') return t.status === 'pending' && (!t.dueAt || isAfter(t.dueAt, today));
      if (tab === 'completed') return t.status === 'completed';
      return true;
    });
  }, [tasks, tab, filterLead, search]);

  const leadsOptions = mockLeads.map((l) => ({ id: l.id, name: `${l.firstName} ${l.lastName || ''}`.trim() }));

  const createQuickTask = () => {
    const lead = filterLead !== 'all' ? filterLead : leadsOptions[0]?.id;
    const newTask = addTask({ title: 'Follow-up rápido', leadId: lead, dueAt: new Date(), priority: 'medium' });
    toast({ title: 'Tarea creada', description: newTask.title });
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">Hoy, próximas y completadas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={createQuickTask} className="gap-1">
            <Plus className="h-4 w-4" /> Crear tarea
          </Button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <Select value={filterLead} onValueChange={setFilterLead}>
              <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por lead">
                <SelectValue placeholder="Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los leads</SelectItem>
                {leadsOptions.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setFilterLead('all')} aria-label="Limpiar filtro">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Buscar tarea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
            aria-label="Buscar tarea"
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-3">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground space-y-2">
              <Bell className="h-5 w-5 mx-auto" />
              <p>Sin tareas aquí.</p>
              <Button size="sm" variant="outline" onClick={createQuickTask}>Crear tarea</Button>
            </CardContent>
          </Card>
        )}
        <AnimatePresence initial={false}>
          {!loading && filtered.map((task) => <TaskRow key={task.id} task={task} />)}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
