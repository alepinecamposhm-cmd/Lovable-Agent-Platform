import { motion } from 'framer-motion';
import {
  Plus,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockCreditAccount, mockLedger } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const actionLabels: Record<string, string> = {
  lead_basic: 'Lead básico',
  lead_premium: 'Lead premium',
  boost_24h: 'Boost 24h',
  boost_7d: 'Boost 7 días',
  featured_listing: 'Listing destacado',
  verification_request: 'Verificación',
};

import { useState } from 'react';
import { BuyCreditsDialog } from '@/components/agents/credits/BuyCreditsDialog';

export default function AgentCredits() {
  // Local state to simulate updates
  const [account, setAccount] = useState(mockCreditAccount);
  const [ledger, setLedger] = useState(mockLedger);
  const usedThisMonth = 65;
  const isLowBalance = account.balance <= account.lowBalanceThreshold;

  const handlePurchase = (amount: number) => {
    // Optimistic update
    setAccount(prev => ({ ...prev, balance: prev.balance + amount }));
    setLedger(prev => [
      {
        id: `txn-${Date.now()}`,
        agentId: 'agent-1',
        accountId: account.id,
        createdAt: new Date(),
        type: 'credit',
        amount: amount,
        description: 'Compra de créditos',
        balance: account.balance + amount
      },
      ...prev
    ]);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Créditos</h1>
          <p className="text-muted-foreground">
            Administra tu saldo y consumo de créditos
          </p>
        </div>
        <BuyCreditsDialog onPurchase={handlePurchase} />
      </motion.div>

      {/* Balance Cards */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className={cn(
          'relative overflow-hidden',
          isLowBalance && 'border-warning'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Saldo Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{account.balance}</span>
              <span className="text-muted-foreground">créditos</span>
            </div>
            {isLowBalance && (
              <div className="flex items-center gap-2 mt-2 text-warning text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Saldo bajo - considera recargar</span>
              </div>
            )}
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Consumo Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold">{usedThisMonth}</span>
              <span className="text-muted-foreground">/ {account.dailyLimit ? account.dailyLimit * 30 : '∞'}</span>
            </div>
            <Progress value={(usedThisMonth / (account.dailyLimit ? account.dailyLimit * 30 : 200)) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">-15%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              vs mes anterior
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction History */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>
                Últimos movimientos de tu cuenta de créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">
                        {format(entry.createdAt, 'd MMM', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.type === 'credit' ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              <Plus className="h-3 w-3 mr-1" />
                              Recarga
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Consumo
                            </Badge>
                          )}
                          <span className="text-sm">{entry.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className={cn(
                        'text-right font-medium',
                        entry.type === 'credit' ? 'text-success' : 'text-destructive'
                      )}>
                        {entry.type === 'credit' ? '+' : '-'}{entry.amount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {entry.balance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consumption Rules */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Reglas de Consumo
              </CardTitle>
              <CardDescription>
                Configura qué acciones consumen créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {account.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={rule.id} className="font-medium cursor-pointer">
                          {actionLabels[rule.action]}
                        </Label>
                        {rule.isEnabled ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rule.cost} créditos
                      </p>
                    </div>
                    <Switch
                      id={rule.id}
                      checked={rule.isEnabled}
                      disabled={['lead_basic', 'lead_premium'].includes(rule.action)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg border border-dashed">
                <h4 className="font-medium text-sm mb-2">Límites</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Límite diario:</span>
                    <span className="font-medium">{account.dailyLimit || 'Sin límite'} créditos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alerta saldo bajo:</span>
                    <span className="font-medium">&lt; {account.lowBalanceThreshold} créditos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
