import { motion } from 'framer-motion';
import { Blocks, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

const APPS = [
    { id: 'google', name: 'Google Calendar', desc: 'Sincroniza tus citas automáticamente.', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg', connected: true },
    { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Envía mensajes desde el CRM.', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', connected: false },
    { id: 'docusign', name: 'DocuSign', desc: 'Firma digital de contratos.', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/DocuSign_Logo.svg', connected: false },
    { id: 'outlook', name: 'Outlook / Office 365', desc: 'Conecta tu email corporativo.', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg', connected: false },
    { id: 'zapier', name: 'Zapier', desc: 'Automatiza flujos con 5000+ apps.', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Zapier_logo.svg', connected: true },
    { id: 'stripe', name: 'Stripe', desc: 'Gestiona pagos y facturación.', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', connected: false },
];

export default function AgentIntegrations() {
    const handleToggle = (name: string, current: boolean) => {
        const newState = !current;
        toast[newState ? 'success' : 'info'](
            newState ? `${name} Conectado` : `${name} Desconectado`,
            { description: newState ? "La sincronización comenzará en breve." : "Se ha revocado el acceso." }
        );
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
                    <Blocks className="h-4 w-4" /> Connectivity
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
                <p className="text-muted-foreground">
                    Conecta tus herramientas favoritas para centralizar tu flujo de trabajo.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {APPS.map((app) => (
                    <Card key={app.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="flex-row gap-4 items-start space-y-0 pb-2">
                            <div className="w-12 h-12 bg-white rounded-lg border p-2 flex items-center justify-center shrink-0">
                                <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate" title={app.name}>{app.name}</CardTitle>
                                {app.connected && (
                                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                                        <Check className="h-3 w-3" /> Conectado
                                    </div>
                                )}
                            </div>
                            <Switch checked={app.connected} onCheckedChange={() => handleToggle(app.name, app.connected)} />
                        </CardHeader>
                        <CardContent className="py-2 flex-1">
                            <p className="text-sm text-muted-foreground">{app.desc}</p>
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-3">
                            <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                                Configurar <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </motion.div>
        </motion.div>
    );
}
