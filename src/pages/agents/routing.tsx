import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AvatarFallback } from '@/components/ui/avatar';
import { mockTeamAgents } from '@/lib/agents/fixtures';
import { addRule, deleteRule, matchAgentWithAudit, useRoutingStore } from '@/lib/agents/routing/store';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { track } from '@/lib/analytics';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { MapPin, Play, Route, Trash } from 'lucide-react';

type LeadType = 'buyer' | 'seller' | 'rent' | '';

export default function AgentRouting() {
  const { rules, audit } = useRoutingStore();
  const [zone, setZone] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [leadType, setLeadType] = useState<LeadType>('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([mockTeamAgents[0].id]);

  const [simZone, setSimZone] = useState('');
  const [simPrice, setSimPrice] = useState<string>('');
  const [simType, setSimType] = useState<LeadType>('');
  const [simResult, setSimResult] = useState<{ agentId: string; ruleId?: string } | null>(null);

  const formattedRules = useMemo(() => rules, [rules]);

  const handleAddRule = () => {
    if (!zone.trim() || selectedAgents.length === 0) {
      toast({ title: 'Falta info', description: 'Agrega zona y al menos un agente.' });
      return;
    }
    const rule = addRule({
      zone: zone.trim(),
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      type: leadType || undefined,
      assignToAgentId: selectedAgents[0],
      assignToAgentIds: selectedAgents,
    });
    track('routing.rule_created', { properties: { ruleId: rule.id, zone: rule.zone, minPrice: rule.minPrice, maxPrice: rule.maxPrice, type: rule.type } });
    setZone('');
    setMinPrice('');
    setMaxPrice('');
    setLeadType('');
  };

  const toggleAgentSelection = (id: string) => {
    setSelectedAgents((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleSimulate = () => {
    const price = simPrice ? Number(simPrice) : undefined;
    const result = matchAgentWithAudit({ zone: simZone || undefined, price, type: simType || undefined, reason: 'simulation' });
    setSimResult(result);
    const agentName = mockTeamAgents.find((a) => a.id === result.agentId)?.firstName || result.agentId;
    toast({ title: 'Ruta simulada', description: `Se asignaría a ${agentName}` });
    track('routing.simulate', { properties: { zone: simZone || null, price, type: simType || null, ruleId: result.ruleId || null } });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ruteo de Leads</h1>
          <p className="text-muted-foreground">Reglas por zona/precio y bitácora de asignaciones.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/agents/team">Volver a Equipo</Link>
          </Button>
          <Button asChild>
            <Link to="/agents/leads">Ir a Leads</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Route className="h-4 w-4 text-primary" /> Reglas activas
            </CardTitle>
            <p className="text-sm text-muted-foreground">Criterios por zona, rango de precio y tipo de lead.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Zona</Label>
                <Input placeholder="Ej. Polanco" value={zone} onChange={(e) => setZone(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Precio mín.</Label>
                <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="2500000" />
              </div>
              <div>
                <Label className="text-xs">Precio máx.</Label>
                <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="8000000" />
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                <select className="w-full rounded-md border px-3 py-2 text-sm" value={leadType} onChange={(e) => setLeadType(e.target.value as LeadType)}>
                  <option value="">Cualquiera</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Asignar a</Label>
              <div className="flex flex-wrap gap-2">
                {mockTeamAgents.map((agent) => {
                  const active = selectedAgents.includes(agent.id);
                  return (
                    <Button
                      key={agent.id}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={() => toggleAgentSelection(agent.id)}
                    >
                      <AvatarFallback className="h-6 w-6 bg-primary/10 text-primary text-xs">{agent.firstName[0]}</AvatarFallback>
                      {agent.firstName}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Round-robin entre los agentes seleccionados. Las reglas nuevas aparecen primero.</p>
              <Button size="sm" onClick={handleAddRule}>Agregar regla</Button>
            </div>

            <div className="space-y-2">
              {formattedRules.length === 0 && (
                <div className="text-sm text-muted-foreground italic">Sin reglas configuradas.</div>
              )}
              {formattedRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      {rule.zone}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                      {rule.minPrice && <Badge variant="secondary">≥ ${rule.minPrice.toLocaleString('es-MX')}</Badge>}
                      {rule.maxPrice && <Badge variant="secondary">≤ ${rule.maxPrice.toLocaleString('es-MX')}</Badge>}
                      {rule.type && <Badge variant="outline">{rule.type}</Badge>}
                      <Badge variant="default">
                        {rule.assignToAgentIds?.map((id) => mockTeamAgents.find((a) => a.id === id)?.firstName || id).join(' · ') || 'Agente'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" /> Simulador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <Label className="text-xs">Zona</Label>
              <Input placeholder="Zona o colonia" value={simZone} onChange={(e) => setSimZone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Precio</Label>
              <Input type="number" placeholder="Ej. 4500000" value={simPrice} onChange={(e) => setSimPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <select className="w-full rounded-md border px-3 py-2 text-sm" value={simType} onChange={(e) => setSimType(e.target.value as LeadType)}>
                <option value="">Cualquiera</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="rent">Rent</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleSimulate}>Simular asignación</Button>

            {simResult && (
              <div className="rounded-lg border p-3 bg-muted/40 space-y-1">
                <p className="text-xs text-muted-foreground">Resultado</p>
                <p className="text-sm font-semibold">
                  {mockTeamAgents.find((a) => a.id === simResult.agentId)?.firstName || simResult.agentId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Regla: {simResult.ruleId ? simResult.ruleId : 'fallback sin regla'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bitácora de ruteo</CardTitle>
          </CardHeader>
          <CardContent>
            {audit.length === 0 && <div className="text-sm text-muted-foreground">Aún no hay eventos. Simula o crea un lead para ver registros.</div>}

            {audit.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Agente</TableHead>
                    <TableHead>Regla</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">{row.createdAt.toLocaleString()}</TableCell>
                      <TableCell>{row.zone || '—'}</TableCell>
                      <TableCell>{row.price ? `$${row.price.toLocaleString('es-MX')}` : '—'}</TableCell>
                      <TableCell>{row.type || '—'}</TableCell>
                      <TableCell>{mockTeamAgents.find((a) => a.id === row.matchedAgentId)?.firstName || row.matchedAgentId}</TableCell>
                      <TableCell>{row.ruleId || 'fallback'}</TableCell>
                      <TableCell>
                        <Badge variant={row.reason === 'simulation' ? 'secondary' : 'default'}>
                          {row.reason}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
