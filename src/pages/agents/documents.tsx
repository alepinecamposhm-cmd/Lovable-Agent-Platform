import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, FolderOpen, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

const MOCK_DOCS = [
    { id: 1, name: 'Promesa de Compraventa.docx', type: 'Contrato', size: '2.4 MB', updated: '28 Ene 2026' },
    { id: 2, name: 'Checklist de Documentación.pdf', type: 'Guía', size: '150 KB', updated: '15 Ene 2026' },
    { id: 3, name: 'Manual de Identidad Visual.pdf', type: 'Branding', size: '12 MB', updated: '10 Dic 2025' },
    { id: 4, name: 'Tarifario de Comisiones 2026.pdf', type: 'Interno', size: '450 KB', updated: '02 Ene 2026' },
    { id: 5, name: 'Formato de Exclusiva.docx', type: 'Contrato', size: '1.2 MB', updated: '20 Ene 2026' },
];

export default function AgentDocuments() {
    const [search, setSearch] = useState('');

    const filteredDocs = MOCK_DOCS.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.type.toLowerCase().includes(search.toLowerCase())
    );

    const handleDownload = (fileName: string) => {
        toast.success(`Descargando ${fileName}...`);
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
                    <FolderOpen className="h-4 w-4" /> Internal Resources
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Documentos</h1>
                <p className="text-muted-foreground">
                    Formatos, contratos y guías oficiales para tu gestión diaria.
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Archivos ({MOCK_DOCS.length})</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar documento..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Tamaño</TableHead>
                                    <TableHead>Actualizado</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocs.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            {doc.name}
                                        </TableCell>
                                        <TableCell>{doc.type}</TableCell>
                                        <TableCell>{doc.size}</TableCell>
                                        <TableCell>{doc.updated}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.name)}>
                                                <Download className="h-4 w-4" />
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
