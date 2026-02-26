import { useState } from 'react';
import { Pause, AlertTriangle } from 'lucide-react';
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

interface PauseMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamAgent | null;
  activeLeadsCount: number;
  otherActiveAgents: TeamAgent[];
  onConfirm: (memberId: string, reassignTo?: string) => void;
}

export function PauseMemberDialog({
  open,
  onOpenChange,
  member,
  activeLeadsCount,
  otherActiveAgents,
  onConfirm,
}: PauseMemberDialogProps) {
  const [reassignTo, setReassignTo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!member) return;
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onConfirm(member.id, reassignTo || undefined);
    setIsLoading(false);
    setReassignTo('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setReassignTo('');
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-yellow-500" />
            ¿Pausar a {member.name}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Este agente dejará de recibir nuevos leads mientras esté pausado.
              </p>

              {activeLeadsCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {member.name} tiene {activeLeadsCount} leads activos
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Puedes reasignarlos a otro agente (opcional).
                    </p>
                  </div>
                </div>
              )}

              {activeLeadsCount > 0 && otherActiveAgents.length > 0 && (
                <div className="space-y-2">
                  <Label>Reasignar leads a (opcional)</Label>
                  <Select value={reassignTo} onValueChange={setReassignTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mantener con el agente pausado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Mantener con el agente pausado</SelectItem>
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
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isLoading ? 'Pausando...' : 'Pausar Agente'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ActivateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamAgent | null;
  onConfirm: (memberId: string) => void;
}

export function ActivateMemberDialog({
  open,
  onOpenChange,
  member,
  onConfirm,
}: ActivateMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!member) return;
    setIsLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onConfirm(member.id);
    setIsLoading(false);
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Activar a {member.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Este agente comenzará a recibir nuevos leads según su peso de ruteo configurado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Activando...' : 'Activar Agente'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
