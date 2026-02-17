import { useState, useMemo } from 'react';
import { ArrowLeftRight, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TeamMemberRole, TeamMemberStatus } from '@/types';

interface TeamAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  leadsThisMonth?: number;
}

interface ReassignLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceAgent: TeamAgent | null;
  targetAgents: TeamAgent[];
  activeLeadsCount: number;
  uncontactedLeadsCount: number;
  onConfirm: (fromAgentId: string, toAgentId: string, onlyUncontacted: boolean) => void;
}

export function ReassignLeadsDialog({
  open,
  onOpenChange,
  sourceAgent,
  targetAgents,
  activeLeadsCount,
  uncontactedLeadsCount,
  onConfirm,
}: ReassignLeadsDialogProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [onlyUncontacted, setOnlyUncontacted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedTargetId('');
      setOnlyUncontacted(false);
    }
    onOpenChange(open);
  };

  const handleConfirm = async () => {
    if (!sourceAgent || !selectedTargetId) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm(sourceAgent.id, selectedTargetId, onlyUncontacted);
    setIsLoading(false);
    handleOpenChange(false);
  };

  const leadsToReassign = onlyUncontacted ? uncontactedLeadsCount : activeLeadsCount;
  const targetAgent = targetAgents.find((a) => a.id === selectedTargetId);

  if (!sourceAgent) return null;

  const hasNoLeads = activeLeadsCount === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Reasignar Leads</DialogTitle>
              <DialogDescription>de {sourceAgent.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {hasNoLeads ? (
          <div className="py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Sin leads activos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Este agente no tiene leads activos para reasignar
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* Leads count */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">
                Leads activos
              </span>
              <Badge variant="secondary" className="text-base">
                {activeLeadsCount}
              </Badge>
            </div>

            {/* Target agent select */}
            <div className="space-y-2">
              <Label>Reasignar a</Label>
              <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un agente" />
                </SelectTrigger>
                <SelectContent>
                  {targetAgents.map((agent) => (
                    <SelectItem
                      key={agent.id}
                      value={agent.id}
                      disabled={agent.status !== 'activo'}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="text-xs">
                            {agent.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{agent.name}</span>
                        {agent.status !== 'activo' && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Pausado
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter option */}
            {uncontactedLeadsCount > 0 && uncontactedLeadsCount < activeLeadsCount && (
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <Checkbox
                  id="only-uncontacted"
                  checked={onlyUncontacted}
                  onCheckedChange={(checked) =>
                    setOnlyUncontacted(checked === true)
                  }
                />
                <div className="grid gap-1 leading-none">
                  <label
                    htmlFor="only-uncontacted"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Solo leads sin contactar
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {uncontactedLeadsCount} de {activeLeadsCount} leads
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedTargetId && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">
                  Se reasignarán{' '}
                  <span className="font-semibold">{leadsToReassign} leads</span>{' '}
                  a <span className="font-semibold">{targetAgent?.name}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          {!hasNoLeads && (
            <Button
              onClick={handleConfirm}
              disabled={!selectedTargetId || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Reasignando...
                </span>
              ) : (
                `Reasignar ${leadsToReassign} Leads`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
