import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    MoreHorizontal,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    ArrowRight
} from 'lucide-react';
import { useTransactionStore, Transaction } from '@/lib/agents/transactions/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STAGE_LABELS: Record<string, string> = {
    offer: 'Oferta Aceptada',
    inspection: 'Inspección',
    appraisal: 'Avalúo',
    financing: 'Crédito',
    closing: 'Escrituración',
    closed: 'Cerrado'
};

const STAGE_COLORS: Record<string, string> = {
    offer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    inspection: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    appraisal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    financing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    closing: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    closed: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
};

export default function AgentTransactions() {
    const { transactions, fetchTransactions, isLoading } = useTransactionStore();

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const currencyFormatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
    });

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        <Briefcase className="h-4 w-4" /> Transactions Management
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Cierres en Proceso</h1>
                    <p className="text-muted-foreground">
                        Monitorea el progreso de tus ventas desde la oferta hasta la firma.
                    </p>
                </div>
                <Button>Nueva Transacción</Button>
            </motion.div>

            <motion.div variants={staggerItem} className="grid gap-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                ) : (
                    transactions.map((tx) => (
                        <Card key={tx.id} className="group hover:shadow-md transition-all">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    {/* Info Principal */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className={STAGE_COLORS[tx.stage]}>
                                                {STAGE_LABELS[tx.stage]}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">ID: {tx.id.toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold">{tx.propertyAddress}</h3>
                                        <p className="text-sm text-muted-foreground">Cliente: {tx.clientName}</p>
                                    </div>

                                    {/* Progress & Dates */}
                                    <div className="w-full md:w-1/3 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progreso de cierre</span>
                                            <span className="font-medium">{tx.progress}%</span>
                                        </div>
                                        <Progress value={tx.progress} className="h-2" />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Est. Cierre: {format(tx.closingDate, 'dd MMM yyyy', { locale: es })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions / Status */}
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="text-right mr-4">
                                            <div className="text-lg font-bold">{currencyFormatter.format(tx.price)}</div>
                                            <div className="flex items-center gap-1 text-xs justify-end">
                                                {tx.missingDocuments > 0 ? (
                                                    <span className="text-amber-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {tx.missingDocuments} docs pendientes
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Docs completos
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <ArrowRight className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
}
