import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, ArrowRight, Mail, Bell, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';

const RECIPES = [
    { id: 1, name: 'Bienvenida Nuevo Lead', trigger: 'New Lead Created', action: 'Send Email', active: true },
    { id: 2, name: 'Reactivar Lead Frío', trigger: 'Lead Stale (30 days)', action: 'Send WhatsApp', active: false },
    { id: 3, name: 'Recordatorio de Cita', trigger: 'Appointment Scheduled', action: 'Push Notification', active: true },
];

export default function AgentAutomations() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <Zap className="h-4 w-4" /> Workflows
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Automatizaciones</h1>
                <p className="text-muted-foreground">
                    Configura flujos de trabajo "Si pasa esto, haz aquello" para ahorrar tiempo.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid gap-4">
                <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center p-6 text-muted-foreground hover:text-primary">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Crear Nueva Automatización</span>
                    </div>
                </Card>

                {RECIPES.map((recipe) => (
                    <Card key={recipe.id} className="flex flex-col md:flex-row items-center p-6 gap-6">
                        <div className={`p-4 rounded-xl ${recipe.active ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-muted text-muted-foreground'}`}>
                            <Zap className="h-6 w-6" />
                        </div>

                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h3 className="font-semibold text-lg">{recipe.name}</h3>
                                {recipe.active && <Badge variant="outline" className="text-xs">Activo</Badge>}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">{recipe.trigger}</Badge>
                                <ArrowRight className="h-3 w-3" />
                                <Badge variant="secondary">{recipe.action}</Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Switch checked={recipe.active} />
                        </div>
                    </Card>
                ))}
            </motion.div>
        </motion.div>
    );
}
