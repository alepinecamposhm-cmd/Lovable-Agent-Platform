import { useState } from 'react';
import { Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMemberRole } from '@/types';
import { cn } from '@/lib/utils';

interface TeamAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
}

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamAgent | null;
  onConfirm: (memberId: string, newRole: TeamMemberRole) => void;
}

const roleOptions: {
  value: TeamMemberRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Puede invitar miembros, ver todos los leads y gestionar ruteo',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-blue-500',
  },
  {
    value: 'agente',
    label: 'Agente',
    description: 'Solo ve sus propios leads y métricas personales',
    icon: <User className="h-5 w-5" />,
    color: 'text-muted-foreground',
  },
];

export function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRole(null);
    } else if (member) {
      setSelectedRole(member.role);
    }
    onOpenChange(open);
  };

  const handleConfirm = async () => {
    if (!member || !selectedRole || selectedRole === member.role) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm(member.id, selectedRole);
    setIsLoading(false);
    setSelectedRole(null);
    onOpenChange(false);
  };

  if (!member) return null;

  const hasChanged = selectedRole && selectedRole !== member.role;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Rol</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo rol para este miembro del equipo
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Member info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <Label>Rol</Label>
            <RadioGroup
              value={selectedRole || member.role}
              onValueChange={(value) => setSelectedRole(value as TeamMemberRole)}
              className="space-y-2"
            >
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedRole === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex-1">
                    <div className={cn('flex items-center gap-2', option.color)}>
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!hasChanged || isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Cambiando...
              </span>
            ) : (
              'Cambiar Rol'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
