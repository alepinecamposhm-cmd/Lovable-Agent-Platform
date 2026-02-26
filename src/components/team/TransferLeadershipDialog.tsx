import { useState } from 'react';
import { Crown, ArrowRight, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { TeamMemberRole, TeamMemberStatus } from '@/types';

interface TeamAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
}

interface TransferLeadershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLeader: TeamAgent;
  eligibleMembers: TeamAgent[];
  onConfirm: (newLeaderId: string) => void;
}

export function TransferLeadershipDialog({
  open,
  onOpenChange,
  currentLeader,
  eligibleMembers,
  onConfirm,
}: TransferLeadershipDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedMemberId) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm(selectedMemberId);
    setIsLoading(false);
    setSelectedMemberId('');
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMemberId('');
    }
    onOpenChange(open);
  };

  const selectedMember = eligibleMembers.find((m) => m.id === selectedMemberId);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <Crown className="h-5 w-5 text-yellow-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Transferir Liderazgo
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Perderás privilegios de líder y pasarás a ser Admin.
                </span>
              </div>
              <p className="text-muted-foreground">
                El miembro seleccionado se convertirá en el nuevo líder del
                equipo con todos los permisos asociados.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Nuevo líder del equipo</Label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un miembro" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && (
            <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="text-center">
                <Avatar className="h-12 w-12 mx-auto mb-1">
                  <AvatarImage src={currentLeader.avatar} />
                  <AvatarFallback>
                    {currentLeader.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{currentLeader.name}</p>
                <p className="text-xs text-muted-foreground">Líder → Admin</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <Avatar className="h-12 w-12 mx-auto mb-1">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback>
                    {selectedMember.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{selectedMember.name}</p>
                <p className="text-xs text-yellow-600 font-medium">
                  Nuevo Líder
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!selectedMemberId || isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Transfiriendo...
              </span>
            ) : (
              'Transferir Liderazgo'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
