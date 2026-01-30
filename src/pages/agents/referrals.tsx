import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Send, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

const REFERRALS = [
    { id: 1, type: 'sent', client: 'Familia Torres', agent: 'Pedro Sola (QRO)', status: 'accepted', fee: '25%', date: '15 Ene 2026' },
    { id: 2, type: 'sent', client: 'Jorge M.', agent: 'Ana R. (MTY)', status: 'pending', fee: '20%', date: '28 Ene 2026' },
    { id: 3, type: 'received', client: 'Sarah Connor', agent: 'John D. (USA)', status: 'closed', fee: '30%', date: '10 Dic 2025' },
];

export default function AgentReferrals() {
    const [open, setOpen] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setOpen(false);
        toast.success("Referido enviado exitosamente", { description: "Se ha notificado al agente receptor." });
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        <Users className="h-4 w-4" /> Network
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Referidos</h1>
                    <p className="text-muted-foreground">
                        Envía y recibe clientes de otros agentes en la red global.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Send className="h-4 w-4" /> Nuevo Referido
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enviar Referido</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Datos del Cliente</Label>
                                <Input placeholder="Nombre completo" required />
                                <Input placeholder="Teléfono" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Agente Destino (o Ciudad)</Label>
                                <Input placeholder="Buscar agente o ubicación..." required />
                            </div>
                            <div className="space-y-2">
                                <Label>Comisión por Referido (%)</Label>
                                <Input type="number" defaultValue={25} min={10} max={50} />
                            </div>
                            <Button type="submit" className="w-full">Enviar Solicitud</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="sent">Enviados</TabsTrigger>
                        <TabsTrigger value="received">Recibidos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4 space-y-4">
                        {REFERRALS.map((ref) => (
                            <Card key={ref.id} className="flex flex-col md:flex-row items-center p-4 gap-4">
                                <div className={`p-3 rounded-full ${ref.type === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {ref.type === 'sent' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-semibold">{ref.client}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {ref.type === 'sent' ? `Enviado a: ${ref.agent}` : `Recibido de: ${ref.agent}`}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center md:items-end gap-1">
                                    <Badge variant={ref.status === 'closed' ? 'default' : 'secondary'}>
                                        {ref.status === 'closed' ? 'Pagado' : ref.status === 'pending' ? 'Pendiente' : 'Aceptado'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">Fee: {ref.fee} • {ref.date}</span>
                                </div>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}
