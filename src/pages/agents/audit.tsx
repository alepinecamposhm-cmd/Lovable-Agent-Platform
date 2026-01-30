import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableRow, TableCell, TableHead, TableHeader } from '@/components/ui/table';
import { listAuditEvents } from '@/lib/audit/store';

export default function AgentAudit() {
  const [events, setEvents] = useState(() => listAuditEvents());

  useEffect(() => {
    const onStorage = () => setEvents(listAuditEvents());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 && <div className="text-sm text-muted-foreground">No hay eventos de auditoría.</div>}

          {events.length > 0 && (
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
                {events.map((e) => (
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
