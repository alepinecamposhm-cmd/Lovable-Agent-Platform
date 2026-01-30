import { motion } from 'framer-motion';
import { Users, FileDown, Eye, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

const VISITORS = [
    { id: 1, name: 'Mario López', email: 'mario.lz@gmail.com', listing: 'Depto Polanco #402', time: 'Hoy, 12:30 PM', status: 'Converted' },
    { id: 2, name: 'Elena Garza', email: 'elena.garza@hotmail.com', listing: 'Depto Polanco #402', time: 'Hoy, 12:45 PM', status: 'GUEST' },
    { id: 3, name: 'Juan Pérez', email: 'jperez@yahoo.com', listing: 'Casa Lomas Virreyes', time: 'Ayer, 4:10 PM', status: 'GUEST' },
];

export default function AgentOpenHouseVisitors() {
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
                        <Users className="h-4 w-4" /> Open House
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Visitantes Registrados</h1>
                    <p className="text-muted-foreground">
                        Base de datos de personas captadas mediante el Kiosco.
                    </p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => toast.success("CSV Descargado")}>
                    <FileDown className="h-4 w-4" /> Exportar CSV
                </Button>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card>
                    <CardHeader>
                        <CardTitle>Historial Reciente</CardTitle>
                        <CardDescription>Mostrando últimos registros</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Visitante</TableHead>
                                    <TableHead>Propiedad</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {VISITORS.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>
                                            <div className="font-medium">{v.name}</div>
                                            <div className="text-xs text-muted-foreground">{v.email}</div>
                                        </TableCell>
                                        <TableCell>{v.listing}</TableCell>
                                        <TableCell>{v.time}</TableCell>
                                        <TableCell>
                                            <Badge variant={v.status === 'Converted' ? 'default' : 'secondary'}>
                                                {v.status === 'Converted' ? 'Lead' : 'Visitante'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
