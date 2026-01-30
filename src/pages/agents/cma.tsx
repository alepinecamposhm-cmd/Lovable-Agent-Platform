import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Search, CheckCircle2, ArrowRight, Download, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { mockListings } from '@/lib/agents/fixtures';
import { toast } from 'sonner';

export default function AgentCMA() {
    const [step, setStep] = useState(1);
    const [subjectProperty, setSubjectProperty] = useState('');
    const [price, setPrice] = useState<number | null>(null);

    const handleSearch = () => {
        if (!subjectProperty) return;
        setStep(2);
    };

    const handleCalculate = () => {
        setStep(3);
        setPrice(4850000); // Mock result
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-4xl mx-auto"
        >
            <motion.div variants={staggerItem} className="text-center space-y-2 mb-8">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis Comparativo de Mercado</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Genera estimaciones de valor precisas comparando propiedades similares en el mercado.
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card className="overflow-hidden">
                    <div className="bg-muted/50 p-2 flex items-center justify-center gap-4 border-b">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
                                    {s}
                                </div>
                                <span className="text-sm font-medium hidden sm:inline">
                                    {s === 1 ? 'Propiedad' : s === 2 ? 'Comparables' : 'Resultado'}
                                </span>
                                {s < 3 && <div className="w-8 h-px bg-border mx-2" />}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-md mx-auto py-10">
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-lg font-semibold">¿Qué propiedad quieres valuar?</h3>
                                        <p className="text-sm text-muted-foreground">Ingresa la dirección o ID del listing.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ej. Av. Horacio 1500..."
                                            value={subjectProperty}
                                            onChange={(e) => setSubjectProperty(e.target.value)}
                                        />
                                        <Button onClick={handleSearch} disabled={!subjectProperty}>
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center">
                                        o selecciona una de tus propiedades activas
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Comparables Sugeridos</h3>
                                        <Badge variant="outline">3 Seleccionados</Badge>
                                    </div>
                                    <div className="grid gap-4">
                                        {mockListings.slice(0, 3).map((listing) => (
                                            <div key={listing.id} className="flex items-center gap-4 border p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                                <img src={listing.coverImage} className="w-16 h-16 object-cover rounded-md" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{listing.address.street}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ${listing.price.toLocaleString()} • {listing.features?.beds} Rec • {listing.features?.sqft} m²
                                                    </div>
                                                </div>
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleCalculate} className="gap-2">
                                            Calcular Precio <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                                    <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                        <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Precio Sugerido</p>
                                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price || 0)}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Rango: $4.6M - $5.1M MXN
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-4 pt-6">
                                        <Button variant="outline" onClick={() => setStep(1)}>Nuevo Análisis</Button>
                                        <Button className="gap-2" onClick={() => toast.success("PDF Descargado")}>
                                            <Download className="h-4 w-4" /> Descargar Reporte PDF
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
