import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'activo' | 'pausado' | 'invitado';
}

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamAgent | null;
  activeLeadsCount: number;
  otherActiveAgents: TeamAgent[];
  onConfirm: (memberId: string, reassignTo: string | null) => void;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
  activeLeadsCount,
  otherActiveAgents,
  onConfirm,
}: RemoveMemberDialogProps) {
  const [reassignTo, setReassignTo] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!member) return;
    if (activeLeadsCount > 0 && !reassignTo) return;
    if (activeLeadsCount === 0 && !confirmed) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onConfirm(member.id, reassignTo || null);
    setIsLoading(false);
    setReassignTo('');
    setConfirmed(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setReassignTo('');
    setConfirmed(false);
    onOpenChange(false);
  };

  const canRemove = activeLeadsCount > 0 ? !!reassignTo : confirmed;

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            ¿Remover a {member.name} del equipo?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Esta acción no se puede deshacer. El agente perderá acceso al equipo.
              </p>

              {activeLeadsCount > 0 ? (
                <>
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        ⚠ {activeLeadsCount} leads activos
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Debes reasignar los leads antes de remover a este miembro.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reasignar leads a *</Label>
                    <Select value={reassignTo} onValueChange={setReassignTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un agente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {otherActiveAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={agent.avatar} />
                                <AvatarFallback className="text-xs">
                                  {agent.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {agent.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirm"
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  />
                  <Label htmlFor="confirm" className="text-sm cursor-pointer">
                    Confirmo que deseo remover a {member.name} del equipo
                  </Label>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canRemove || isLoading}
          >
            {isLoading ? 'Removiendo...' : 'Remover del Equipo'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
