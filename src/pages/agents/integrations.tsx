import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CloudOff, Link as LinkIcon, Loader2, PlugZap, RefreshCw } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { connectIntegration, disconnectIntegration, useIntegrationStore } from '@/lib/agents/integrations/store';
import type { IntegrationId } from '@/lib/agents/integrations/store';
import { toast } from '@/components/ui/use-toast';

export default function AgentIntegrations() {
  const integrations = useIntegrationStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [state, setState] = useState<'success' | 'error'>('success');

  const handleConnect = (id: IntegrationId) => {
    setBusy(id);
    setTimeout(() => {
      connectIntegration(id);
      setBusy(null);
      toast({ title: 'Conectado', description: `${id} (mock OAuth) conectado` });
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'integration.connect', integration: id } }));
    }, 700);
  };

  const handleDisconnect = (id: IntegrationId) => {
    disconnectIntegration(id);
    toast({ title: 'Desconectado', description: `${id} removido` });
    window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'integration.disconnect', integration: id } }));
  };

  const refresh = () => {
    setState('success');
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integraciones</h1>
          <p className="text-muted-foreground text-sm">Dotloop, ShowingTime · estados loading/empty/error/success · persistencia mock.</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refrescar
        </Button>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 md:grid-cols-2">
        {integrations.map((item) => (
          <Card key={item.id} className="border">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <PlugZap className="h-4 w-4 text-primary" /> {item.name}
              </CardTitle>
              <Badge variant={item.status === 'connected' ? 'default' : 'outline'} className="capitalize">
                {item.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{item.description}</p>
              {item.lastSyncedAt && (
                <p className="text-xs text-muted-foreground">Última sync: {item.lastSyncedAt.toLocaleString()}</p>
              )}
              <div className="flex gap-2">
                {item.status !== 'connected' ? (
                  <Button className="gap-2" onClick={() => handleConnect(item.id)} disabled={busy === item.id}>
                    {busy === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                    Conectar
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleDisconnect(item.id)} className="gap-2">
                    <CloudOff className="h-4 w-4" /> Desconectar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {integrations.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Estado empty: no hay integraciones disponibles.
          </CardContent>
        </Card>
      )}

      {state === 'error' && (
        <Card>
          <CardContent className="py-6 text-destructive flex items-center gap-2">
            <CloudOff className="h-4 w-4" /> Error al cargar integraciones.
          </CardContent>
        </Card>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">Mock OAuth + tracking mínimo: integration.connect / integration.disconnect.</p>
    </motion.div>
  );
}
