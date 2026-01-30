import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';

export default function AgentCalculator() {
    const [price, setPrice] = useState(5000000);
    const [commissionRate, setCommissionRate] = useState(5); // 5%
    const [split, setSplit] = useState(60); // 60% for agent
    const [deductions, setDeductions] = useState(0);

    const grossCommission = price * (commissionRate / 100);
    const agentGross = grossCommission * (split / 100);
    const netIncome = agentGross - deductions;

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <Calculator className="h-4 w-4" /> Tools
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Calculadora de Comisiones</h1>
                <p className="text-muted-foreground">
                    Proyecta tus ingresos (GCI) por operación configurando los splits y deducciones.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración de la Operación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Precio de Venta</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="pl-9 text-lg font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Comisión Total (%)</Label>
                                <span className="text-sm font-medium">{commissionRate}%</span>
                            </div>
                            <Slider
                                value={[commissionRate]}
                                onValueChange={(val) => setCommissionRate(val[0])}
                                max={10}
                                step={0.5}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Split Agente (%)</Label>
                                <span className="text-sm font-medium">{split}%</span>
                            </div>
                            <Slider
                                value={[split]}
                                onValueChange={(val) => setSplit(val[0])}
                                max={100}
                                step={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Deducciones (Marketing, Referidos)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    value={deductions}
                                    onChange={(e) => setDeductions(Number(e.target.value))}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Ingreso Neto Estimado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-primary">
                                {formatCurrency(netIncome)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                *Antes de impuestos
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Comisión Bruta (GCI)</div>
                                <div className="text-xl font-bold">{formatCurrency(grossCommission)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Brokerage Split</div>
                                <div className="text-xl font-bold text-muted-foreground">{formatCurrency(grossCommission - agentGross)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
                        <CardContent className="pt-6 flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-medium text-emerald-900 dark:text-emerald-100">Meta Anual</p>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                    Esta operación representa el <strong>{((netIncome / 2000000) * 100).toFixed(1)}%</strong> de tu meta anual de 2M.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </motion.div>
    );
}
