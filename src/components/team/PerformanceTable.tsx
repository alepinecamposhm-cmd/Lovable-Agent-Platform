import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpDown, Download, Star, BarChart3 } from 'lucide-react';
import { AgentHoverPreview, AgentPreviewData } from './AgentHoverPreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface TeamPerformanceData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leadsReceived: number;
  respondedUnder5Min: number;
  appointmentsScheduled: number;
  conversions: number;
  score: number;
}

export type PerformanceTimeframe = 'day' | 'week' | 'month' | 'year';

interface PerformanceTableProps {
  data: TeamPerformanceData[];
  totalAgents?: number;
  missingMetricsCount?: number;
  onCompare?: () => void;
  compareDisabled?: boolean;
  highlight?: boolean;
  timeframe: PerformanceTimeframe;
  onTimeframeChange: (value: PerformanceTimeframe) => void;
}

export function PerformanceTable({
  data,
  totalAgents,
  missingMetricsCount,
  onCompare,
  compareDisabled,
  highlight,
  timeframe,
  onTimeframeChange,
}: PerformanceTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'score', desc: true }]);

  const topPerformerId = useMemo(() => {
    if (data.length === 0) return null;
    return [...data].sort((a, b) => b.score - a.score)[0]?.id;
  }, [data]);

  const getResponseRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const columns: ColumnDef<TeamPerformanceData>[] = [
    {
      accessorKey: 'name',
      header: 'Agente',
      cell: ({ row }) => {
        const isTop = row.original.id === topPerformerId;
        const agentPreview: AgentPreviewData = {
          id: row.original.id,
          name: row.original.name,
          avatar: row.original.avatar,
          role: 'agente',
          status: 'activo',
          metrics: {
            leadsReceived: row.original.leadsReceived,
            responseRate: row.original.leadsReceived > 0 ? Math.round((row.original.respondedUnder5Min / row.original.leadsReceived) * 100) : 0,
            appointments: row.original.appointmentsScheduled,
            score: row.original.score,
          },
        };
        return (
          <AgentHoverPreview agent={agentPreview}>
            <div className="flex items-center gap-3 cursor-default">
              <Avatar className="h-8 w-8">
                <AvatarImage src={row.original.avatar} />
                <AvatarFallback>
                  {row.original.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{row.original.name}</span>
                  {isTop && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                      Top
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{row.original.email}</span>
              </div>
            </div>
          </AgentHoverPreview>
        );
      },
    },
    {
      accessorKey: 'leadsReceived',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Leads recibidos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.leadsReceived}</span>
      ),
    },
    {
      accessorKey: 'respondedUnder5Min',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Resp. &lt;5min
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rate = row.original.leadsReceived > 0
          ? Math.round((row.original.respondedUnder5Min / row.original.leadsReceived) * 100)
          : 0;
        return (
          <Badge variant="secondary" className={cn('font-medium', getResponseRateColor(rate))}>
            {rate}%
          </Badge>
        );
      },
    },
    {
      accessorKey: 'appointmentsScheduled',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Citas
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.appointmentsScheduled}</span>
      ),
    },
    {
      accessorKey: 'conversions',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Conversiones
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.conversions}</span>
      ),
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-bold">
          {row.original.score}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const exportToCSV = () => {
    const headers = ['Agente', 'Email', 'Leads', 'Resp. <5min', 'Citas', 'Conversiones', 'Score'];
    const rows = data.map((d) => [
      d.name,
      d.email,
      d.leadsReceived,
      d.respondedUnder5Min,
      d.appointmentsScheduled,
      d.conversions,
      d.score,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `performance_equipo_${timeframe}.csv`;
    link.click();
    toast.success('Archivo CSV descargado');
  };

  const handleRowClick = (memberId: string) => {
    navigate(`/agents/team/member/${memberId}`);
  };

  const total = totalAgents ?? data.length;
  const missing = Math.max(missingMetricsCount ?? 0, 0);

  return (
    <Card className={cn("transition duration-300", highlight ? "ring-2 ring-primary/30" : undefined)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance del Equipo
            </CardTitle>
            <CardDescription>
              Métricas de desempeño de cada miembro del equipo
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              Mostrando {total} agentes
              {missing > 0 && <span className="ml-1">(faltan métricas para {missing})</span>}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
              variant="default"
              onClick={onCompare}
              disabled={compareDisabled}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Comparar
            </Button>
            <Select value={timeframe} onValueChange={(v: PerformanceTimeframe) => onTimeframeChange(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Día</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
                <SelectItem value="year">Año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aún no hay datos</h3>
            <p className="text-muted-foreground">
              Las métricas aparecerán cuando el equipo comience a gestionar leads.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
