import { motion } from 'framer-motion';
import { Target, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';

export default function AgentGoals() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <Target className="h-4 w-4" /> Performance
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Metas 2026</h1>
                <p className="text-muted-foreground">
                    Visualiza y ajusta tus objetivos anuales. Vas por buen camino 🚀
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-2 gap-6">
                <Card className="md:col-span-2 bg-slate-950 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-400" /> Meta de Ingresos (GCI)
                        </CardTitle>
                        <CardDescription className="text-slate-400">Progreso anual vs Objetivo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="text-4xl font-bold">$320,000 <span className="text-lg text-slate-400 font-normal">/ $2,000,000</span></div>
                            <div className="text-emerald-400 font-medium">+5% vs Pacing</div>
                        </div>
                        <Progress value={16} className="h-4 bg-slate-800 [&>div]:bg-yellow-400" />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Enero 2026</span>
                            <span>Diciembre 2026</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cierres (Unidades)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">4 ventas cerradas</span>
                            <span className="text-sm text-muted-foreground">Meta: 24</span>
                        </div>
                        <Progress value={16.6} className="h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Nuevos Leads</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">45 leads generados</span>
                            <span className="text-sm text-muted-foreground">Meta: 500</span>
                        </div>
                        <Progress value={9} className="h-2" />
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
