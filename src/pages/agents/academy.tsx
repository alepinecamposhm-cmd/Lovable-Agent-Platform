import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    category: 'Ventas' | 'Marketing' | 'Legal';
    completed: boolean;
    thumbnail: string;
}

const MOCK_COURSES: Course[] = [
    {
        id: 'c1',
        title: 'Domina el Cierre de Ventas',
        description: 'Técnicas avanzadas para manejar objeciones y cerrar tratos.',
        duration: '45 min',
        category: 'Ventas',
        completed: true,
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=60'
    },
    {
        id: 'c2',
        title: 'Marketing Digital para Inmobiliarios',
        description: 'Cómo usar Instagram Ads para generar leads cualificados.',
        duration: '60 min',
        category: 'Marketing',
        completed: false,
        thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&auto=format&fit=crop&q=60'
    },
    {
        id: 'c3',
        title: 'Aspectos Legales 2026',
        description: 'Actualización sobre la Ley de Extinción de Dominio y contratos.',
        duration: '30 min',
        category: 'Legal',
        completed: false,
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=60'
    }
];

export default function AgentAcademy() {
    const [courses, setCourses] = useState(MOCK_COURSES);
    const completedCount = courses.filter(c => c.completed).length;
    const progress = (completedCount / courses.length) * 100;

    const handleToggleComplete = (id: string) => {
        setCourses(courses.map(c => {
            if (c.id === id) {
                const newState = !c.completed;
                toast.success(newState ? "¡Curso completado!" : "Curso marcado como pendiente");
                return { ...c, completed: newState };
            }
            return c;
        }));
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <GraduationCap className="h-4 w-4" /> Agent University
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Capacitación Continua</h1>
                <p className="text-muted-foreground">
                    Mejora tus habilidades con cursos exclusivos para nuestra red.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-3 gap-4">
                <Card className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900">
                    <CardHeader>
                        <CardTitle>Tu Progreso</CardTitle>
                        <CardDescription>Has completado {completedCount} de {courses.length} cursos asignados este mes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="h-3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Próximo Live</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">Q&A con Top Producers</div>
                        <div className="text-xs text-muted-foreground mt-1">Jueves 19:00 hrs</div>
                        <Button size="sm" className="w-full mt-4" variant="outline">Agendar</Button>
                    </CardContent>
                </Card>
            </motion.div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="sales">Ventas</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                    <motion.div variants={staggerItem} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden flex flex-col group">
                                <div className="aspect-video w-full overflow-hidden relative">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle className="h-12 w-12 text-white/80" />
                                    </div>
                                    {course.completed && (
                                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Completado
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" /> {course.duration}
                                        </span>
                                    </div>
                                    <CardTitle className="text-base leading-snug">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto pt-0">
                                    <Button
                                        variant={course.completed ? "ghost" : "default"}
                                        className="w-full"
                                        onClick={() => handleToggleComplete(course.id)}
                                    >
                                        {course.completed ? 'Ver de nuevo' : 'Iniciar curso'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </motion.div>
                </TabsContent>
                {/* Tabs for filters would use filtered list same as above */}
            </Tabs>
        </motion.div>
    );
}
