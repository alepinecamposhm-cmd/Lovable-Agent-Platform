import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AgentHoverPreview } from './AgentHoverPreview';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Lead, LeadStage } from '@/types';
import { cn } from '@/lib/utils';

interface TeamAgent {
  id: string;
  name: string;
  avatar?: string;
}

interface TeamLeadsOverviewProps {
  agents: TeamAgent[];
  leads: Lead[];
}

const activeStages: LeadStage[] = ['nuevo', 'contactado', 'calificado', 'cita', 'visitado', 'oferta'];

export function TeamLeadsOverview({ agents, leads }: TeamLeadsOverviewProps) {
  const navigate = useNavigate();

  const data = useMemo(() => {
    const activeLeads = leads.filter((l) => activeStages.includes(l.stage));
    const totalActive = activeLeads.length;

    const agentData = agents.map((agent) => {
      const agentLeads = activeLeads.filter((l) => l.assignedAgentId === agent.id);
      const nuevo = agentLeads.filter((l) => l.stage === 'nuevo').length;
      const contactado = agentLeads.filter((l) => l.stage === 'contactado').length;
      const calificado = agentLeads.filter((l) => l.stage === 'calificado').length;
      const cita = agentLeads.filter((l) => l.stage === 'cita' || l.stage === 'visitado').length;
      const total = agentLeads.length;
      const isOverloaded = totalActive > 0 && total / totalActive > 0.5;

      return {
        ...agent,
        nuevo,
        contactado,
        calificado,
        cita,
        total,
        isOverloaded,
      };
    });

    const totals = {
      nuevo: agentData.reduce((s, a) => s + a.nuevo, 0),
      contactado: agentData.reduce((s, a) => s + a.contactado, 0),
      calificado: agentData.reduce((s, a) => s + a.calificado, 0),
      cita: agentData.reduce((s, a) => s + a.cita, 0),
      total: agentData.reduce((s, a) => s + a.total, 0),
    };

    return { agentData, totals };
  }, [agents, leads]);

  if (data.totals.total === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No hay leads asignados al equipo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Los leads aparecerán aquí cuando se asignen a miembros del equipo
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distribución de Leads del Equipo
        </CardTitle>
        <CardDescription>
          Resumen de leads activos por agente y etapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agente</TableHead>
              <TableHead className="text-center">Nuevos</TableHead>
              <TableHead className="text-center">Contactados</TableHead>
              <TableHead className="text-center">Calificados</TableHead>
              <TableHead className="text-center">Citas</TableHead>
              <TableHead className="text-center">Total Activos</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.agentData.map((agent) => (
              <TableRow
                key={agent.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/agents/team/member/${agent.id}`)}
              >
                <TableCell>
                  <AgentHoverPreview agent={{ id: agent.id, name: agent.name, avatar: agent.avatar, role: 'agente', status: 'activo', metrics: { leadsReceived: agent.total, responseRate: 0, appointments: 0, score: 0 } }}>
                    <div className="flex items-center gap-3 cursor-default">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback className="text-xs">
                          {agent.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </AgentHoverPreview>
                </TableCell>
                <TableCell className="text-center font-bold">{agent.nuevo}</TableCell>
                <TableCell className="text-center font-bold">{agent.contactado}</TableCell>
                <TableCell className="text-center font-bold">{agent.calificado}</TableCell>
                <TableCell className="text-center font-bold">{agent.cita}</TableCell>
                <TableCell className="text-center font-bold">{agent.total}</TableCell>
                <TableCell>
                  {agent.isOverloaded && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Sobrecarga
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-center font-bold">{data.totals.nuevo}</TableCell>
              <TableCell className="text-center font-bold">{data.totals.contactado}</TableCell>
              <TableCell className="text-center font-bold">{data.totals.calificado}</TableCell>
              <TableCell className="text-center font-bold">{data.totals.cita}</TableCell>
              <TableCell className="text-center font-bold">{data.totals.total}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
