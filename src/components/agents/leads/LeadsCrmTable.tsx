import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState, createColumnHelper } from '@tanstack/react-table';
import { ArrowUpDown, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Lead, LeadStage } from '@/types/agents';
import { downloadLeadsCsv } from './exportLeadsCsv';
import { formatTimeframeLabel } from './leadsFiltersQuery';

const stageLabel: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contactado',
  appointment_set: 'Appointment Set',
  toured: 'Toured',
  closed: 'Closed',
  closed_lost: 'Closed Lost',
};

const columnHelper = createColumnHelper<Lead>();

export type LeadsCrmTableProps = {
  leads: Lead[];
  loading?: boolean;
  error?: string | null;
  memberLookup: Record<string, string>;
  onOpenLead: (lead: Lead) => void;
  onTrack?: (event: string, properties?: Record<string, unknown>) => void;
};

export function LeadsCrmTable({ leads, loading, error, memberLookup, onOpenLead, onTrack }: LeadsCrmTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.firstName} ${row.lastName || ''}`.trim(),
        {
          id: 'name',
          header: () => <span>Nombre</span>,
          cell: (info) => (
            <div className="min-w-[180px]">
              <div className="font-medium">{info.getValue()}</div>
              <div className="text-xs text-muted-foreground">{info.row.original.email || info.row.original.phone || '—'}</div>
            </div>
          ),
        }
      ),
      columnHelper.accessor('stage', {
        id: 'stage',
        header: () => <span>Etapa</span>,
        cell: (info) => (
          <Badge variant="outline" className="text-[11px]">
            {stageLabel[info.getValue()] || info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('assignedTo', {
        id: 'assignedTo',
        header: () => <span>Asignado a</span>,
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {memberLookup[info.getValue()] || info.getValue() || '—'}
          </span>
        ),
      }),
      columnHelper.accessor('source', {
        id: 'source',
        header: () => <span>Fuente</span>,
        cell: (info) => (
          <span className="text-sm text-muted-foreground capitalize">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('timeframe', {
        id: 'timeframe',
        header: () => <span>Timeframe</span>,
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() ? formatTimeframeLabel(info.getValue()!) : '—'}
          </span>
        ),
      }),
      columnHelper.accessor('preApproved', {
        id: 'preApproved',
        header: () => <span>Pre-aprobado</span>,
        cell: (info) => {
          const v = info.getValue();
          if (typeof v !== 'boolean') return <span className="text-sm text-muted-foreground">—</span>;
          return (
            <Badge variant={v ? 'default' : 'secondary'} className="text-[11px]">
              {v ? 'Sí' : 'No'}
            </Badge>
          );
        },
      }),
      columnHelper.accessor(
        (row) => ({ min: row.budgetMin, max: row.budgetMax }),
        {
          id: 'budget',
          header: () => <span>Presupuesto</span>,
          cell: (info) => {
            const v = info.getValue();
            if (!v?.max && !v?.min) return <span className="text-sm text-muted-foreground">—</span>;
            const fmt = (n: number) => n.toLocaleString();
            return (
              <span className="text-sm">
                ${fmt(v.min || 0)}{v.max ? ` - $${fmt(v.max)}` : ''}
              </span>
            );
          },
        }
      ),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Acciones</span>,
        cell: (info) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLead(info.row.original);
            }}
            aria-label="Ver detalle del lead"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver
          </Button>
        ),
      }),
    ],
    [memberLookup, onOpenLead]
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    if (!leads.length) {
      toast({ title: 'Sin datos para exportar', variant: 'destructive' });
      return;
    }
    try {
      onTrack?.('leads.export_csv_clicked', { view: 'crm', rowCount: leads.length });
      const filename = downloadLeadsCsv(leads);
      toast({ title: 'CSV descargado', description: filename });
      onTrack?.('leads.export_csv_completed', { rowCount: leads.length });
    } catch (e) {
      onTrack?.('leads.export_csv_failed', { error: (e as Error).message || String(e) });
      toast({ title: 'No se pudo exportar', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Leads (CRM)</h2>
            <p className="text-sm text-muted-foreground">Vista de lista con filtros avanzados.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {loading ? '—' : `${leads.length} resultado(s)`}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border bg-destructive/5 text-destructive px-3 py-2 text-sm flex items-center justify-between gap-3">
            <span>No se pudieron cargar los leads.</span>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-muted/30 p-8 text-center"
            >
              <p className="text-sm text-muted-foreground">Aún no hay leads.</p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/agents/inbox">Ir a Inbox</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/agents/leads">Ver Pipeline</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                      {hg.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        return (
                          <TableHead
                            key={header.id}
                            className={cn('whitespace-nowrap', canSort && 'cursor-pointer select-none')}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            <div className="flex items-center gap-2">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {canSort && (
                                <ArrowUpDown className={cn('h-3.5 w-3.5 text-muted-foreground', sorted && 'text-foreground')} />
                              )}
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => onOpenLead(row.original)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onOpenLead(row.original);
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`Abrir lead ${row.original.firstName} ${row.original.lastName || ''}`.trim()}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
