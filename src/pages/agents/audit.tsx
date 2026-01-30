import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableRow, TableCell, TableHead, TableHeader } from '@/components/ui/table';
import { listAuditEvents } from '@/lib/audit/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgentAudit() {
  const [events, setEvents] = useState(() => listAuditEvents());
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    const onStorage = () => setEvents(listAuditEvents());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const actions = useMemo(() => Array.from(new Set(events.map((e) => e.action))), [events]);
  const filtered = useMemo(
    () => events.filter((e) => actionFilter === 'all' || e.action === actionFilter),
    [events, actionFilter]
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <div className="ml-auto flex items-center gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 && <div className="text-sm text-muted-foreground">No hay eventos de auditoría.</div>}

          {filtered.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{e.action}</TableCell>
                    <TableCell>{e.actor}</TableCell>
                    <TableCell><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(e.payload, null, 2)}</pre></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
