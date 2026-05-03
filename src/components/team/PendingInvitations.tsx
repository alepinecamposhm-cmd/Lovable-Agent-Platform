import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, RefreshCw, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { TeamMemberRole } from '@/types';

export interface PendingInvitation {
  id: string;
  email: string;
  role: TeamMemberRole;
  sentAt: Date;
}

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
  variant?: 'default' | 'compact';
}

export function PendingInvitations({
  invitations,
  onCancel,
  onResend,
  variant = 'default',
}: PendingInvitationsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const isCompact = variant === 'compact';

  if (invitations.length === 0) {
    return null;
  }

  const handleCancel = () => {
    if (cancelId) {
      onCancel(cancelId);
      setCancelId(null);
      toast.success('Invitación cancelada');
    }
  };

  const handleResend = async (id: string) => {
    setResendingId(id);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    onResend(id);
    setResendingId(null);
    const invitation = invitations.find((i) => i.id === id);
    toast.success(`Invitación reenviada a ${invitation?.email}`);
  };

  const getRoleLabel = (role: TeamMemberRole) => {
    const labels: Record<TeamMemberRole, string> = {
      lider: 'Líder',
      admin: 'Admin',
      agente: 'Agente',
    };
    return labels[role];
  };

  const renderInvitationRows = () => (
    <div className={isCompact ? 'divide-y' : 'space-y-3'}>
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className={
            isCompact
              ? 'flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between'
              : 'flex items-center justify-between p-3 bg-muted/50 rounded-lg'
          }
        >
          <div className="flex min-w-0 items-center gap-3">
            {!isCompact && (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className={isCompact ? 'truncate text-sm font-medium' : 'font-medium'}>
                {invitation.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {getRoleLabel(invitation.role)}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Enviada {formatDistanceToNow(invitation.sentAt, {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResend(invitation.id)}
              disabled={resendingId === invitation.id}
              className={isCompact ? 'h-8 px-2 text-xs' : undefined}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${
                  resendingId === invitation.id ? 'animate-spin' : ''
                }`}
              />
              {resendingId === invitation.id ? 'Enviando...' : 'Reenviar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-destructive hover:text-destructive ${
                isCompact ? 'h-8 px-2 text-xs' : ''
              }`}
              onClick={() => setCancelId(invitation.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {isCompact ? (
          <div className="rounded-lg border bg-muted/10">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Invitaciones pendientes
                    <Badge variant="secondary">{invitations.length}</Badge>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    Enlaces enviados que aún no se aceptan.
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>{renderInvitationRows()}</CollapsibleContent>
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Invitaciones Pendientes
                      <Badge variant="secondary">{invitations.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Agentes que aún no han aceptado la invitación
                    </CardDescription>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">{renderInvitationRows()}</CardContent>
            </CollapsibleContent>
          </Card>
        )}
      </Collapsible>

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              La invitación será cancelada y el enlace dejará de funcionar.
              Puedes enviar una nueva invitación en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar Invitación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
