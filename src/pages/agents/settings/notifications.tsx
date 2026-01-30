import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Smartphone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useNotificationPrefs, setQuietHours, isQuietHoursNow } from '@/lib/agents/notifications/store';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { track } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';

export default function AgentNotificationSettings() {
    const prefs = useNotificationPrefs();
    const [enabled, setEnabled] = useState(prefs.enabled);
    const [start, setStart] = useState(prefs.start);
    const [end, setEnd] = useState(prefs.end);
    const [push, setPush] = useState(prefs.channels.push);
    const [email, setEmail] = useState(prefs.channels.email);
    const [weekends, setWeekends] = useState(prefs.weekends ?? true);

    useEffect(() => {
        setEnabled(prefs.enabled);
        setStart(prefs.start);
        setEnd(prefs.end);
        setPush(prefs.channels.push);
        setEmail(prefs.channels.email);
        setWeekends(prefs.weekends ?? true);
    }, [prefs]);

    const handleSave = () => {
        setQuietHours({
            enabled,
            start,
            end,
            channels: { push, email, sms: false },
            weekends,
        });
        track('notifications.prefs_saved', { properties: { enabled, start, end, push, email, weekends } });
        toast({ title: 'Preferencias guardadas', description: 'Aplicamos quiet hours y canales.' });
    };

    const quietActive = enabled && isQuietHoursNow();

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
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Preferencias de Notificación</h1>
                    {quietActive && <Badge variant="secondary">Quiet hours activas</Badge>}
                </div>
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
                            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Hora Fin</Label>
                            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2 bg-muted/50 p-3 rounded-md">
                            <Switch checked={weekends} onCheckedChange={(v) => setWeekends(Boolean(v))} />
                            <span>Silenciar automáticamente fines de semana</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                            <Switch checked={enabled} onCheckedChange={(v) => setEnabled(Boolean(v))} />
                            <span>Quiet hours activas</span>
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
                            <Switch checked={push} onCheckedChange={(v) => setPush(Boolean(v))} />
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="text-base">Email Digest</Label>
                                    <p className="text-sm text-muted-foreground">Resumen diario de actividad cada mañana.</p>
                                </div>
                            </div>
                            <Switch checked={email} onCheckedChange={(v) => setEmail(Boolean(v))} />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSave}>Guardar preferencias</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
