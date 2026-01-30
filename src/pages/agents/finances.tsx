import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const MOCK_DATA = [
    { month: 'Ene', income: 45000, expense: 12000 },
    { month: 'Feb', income: 52000, expense: 15000 },
    { month: 'Mar', income: 38000, expense: 8000 },
    { month: 'Abr', income: 65000, expense: 22000 },
    { month: 'May', income: 48000, expense: 14000 },
    { month: 'Jun', income: 72000, expense: 18000 },
];

const EXPENSES = [
    { category: 'Marketing', amount: 8500, color: '#f87171' },
    { category: 'Portales', amount: 3200, color: '#60a5fa' },
    { category: 'Gasolina', amount: 2400, color: '#fbbf24' },
    { category: 'Otros', amount: 1500, color: '#94a3b8' },
];

export default function AgentFinances() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <DollarSign className="h-4 w-4" /> Business Intelligence
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Finanzas y ROI</h1>
                <p className="text-muted-foreground">
                    Monitorea la salud financiera de tu negocio inmobiliario.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales (YTD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$320,000</div>
                        <p className="text-xs text-muted-foreground">+12% vs año anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Gastos Operativos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$89,600</div>
                        <p className="text-xs text-muted-foreground">28% del ingreso total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ROI Marketing</CardTitle>
                        <PieChart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.5x</div>
                        <p className="text-xs text-muted-foreground">Por cada $1 invertido</p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Flujo de Caja Semestral</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                />
                                <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Desglose de Gastos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {EXPENSES.map((item) => (
                                <div key={item.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-medium">{item.category}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">${item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="pt-4 border-t mt-4">
                                <Button variant="outline" className="w-full">Registrar Nuevo Gasto</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
