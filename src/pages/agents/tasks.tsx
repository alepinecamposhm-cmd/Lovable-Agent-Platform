import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Calendar, Clock, Filter, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  lead: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  type: 'Call' | 'Email' | 'Meeting' | 'Paperwork';
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Llamada de seguimiento', lead: 'Roberto Gómez', dueDate: 'Hoy, 10:00 AM', priority: 'High', completed: false, type: 'Call' },
  { id: '2', title: 'Enviar contrato firmado', lead: 'Sarah Connor', dueDate: 'Hoy, 2:00 PM', priority: 'High', completed: false, type: 'Paperwork' },
  { id: '3', title: 'Confirmar visita Polanco', lead: 'Familia Torres', dueDate: 'Mañana, 11:00 AM', priority: 'Medium', completed: false, type: 'Meeting' },
  { id: '4', title: 'Enviar opciones de renta', lead: 'Jorge M.', dueDate: 'Mañana, 4:00 PM', priority: 'Low', completed: false, type: 'Email' },
  { id: '5', title: 'Actualizar listing Condesa', lead: 'N/A', dueDate: 'Ayer', priority: 'Medium', completed: true, type: 'Paperwork' },
];

export default function AgentTasks() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filter, setFilter] = useState('all');

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
        if (newState) toast.success("Tarea completada", { description: "¡Buen trabajo manteniendo tu pipeline al día!" });
        return { ...t, completed: newState };
      }
      return t;
    }));
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'text-rose-600 bg-rose-100 dark:bg-rose-900/30';
      case 'Medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'Low': return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <CheckSquare className="h-4 w-4" /> Productivity
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona tus pendientes diarios y recordatorios de seguimiento.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Tarea
        </Button>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              Pendientes <Badge variant="secondary" className="px-1.5 h-5 min-w-[1.25rem]">{activeTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <AnimatePresence>
              {activeTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>¡Todo al día! No tienes tareas pendientes.</p>
                </div>
              ) : (
                activeTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <button onClick={() => handleToggle(task.id)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                          <Circle className="h-6 w-6" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">{task.title}</span>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            <Badge variant="secondary" className="text-xs font-normal">{task.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {task.lead !== 'N/A' && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                {task.lead}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.dueDate}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                          Editar
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTasks.map((task) => (
              <Card key={task.id} className="opacity-60 bg-muted/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <button onClick={() => handleToggle(task.id)} className="text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium line-through text-muted-foreground">{task.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
