import { motion } from 'framer-motion';
import { Bell, Moon, Smartphone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';

export default function AgentNotificationSettings() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-3xl"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <Bell className="h-4 w-4" /> Preferences
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Preferencias de Notificación</h1>
                <p className="text-muted-foreground">
                    Define cuándo y cómo quieres recibir alertas. Evita interrupciones en tu tiempo libre.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5 text-indigo-500" /> Quiet Hours
                        </CardTitle>
                        <CardDescription>
                            Silencia todas las notificaciones (excepto urgentes) durante este horario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Hora Inicio</Label>
                            <Input type="time" defaultValue="20:00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Hora Fin</Label>
                            <Input type="time" defaultValue="08:00" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2 bg-muted/50 p-3 rounded-md">
                            <Switch defaultChecked />
                            <span>Silenciar automáticamente fines de semana</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Canales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Alertas en tiempo real en tu navegador/móvil.</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-base">Email Digest</Label>
                                    <p className="text-sm text-muted-foreground">Resumen diario de actividad cada mañana.</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
