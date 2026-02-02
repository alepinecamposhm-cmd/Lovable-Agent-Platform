import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { acceptInviteByToken, listInvites } from '@/lib/agents/team/store';
import { toast } from '@/components/ui/use-toast';

type State = 'loading' | 'success' | 'error' | 'used' | 'expired';

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>('loading');
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    const invite = listInvites().find((i) => i.token === token);
    setEmail(invite?.email);
    if (invite?.status === 'accepted') {
      setState('used');
      return;
    }
    if (invite && new Date(invite.expiresAt).getTime() < Date.now()) {
      setState('expired');
      return;
    }
    setState('success');
  }, [token]);

  const handleAccept = () => {
    if (!token) return;
    setState('loading');
    const res = acceptInviteByToken(token);
    if (res?.error === 'expired') {
      setState('expired');
      return;
    }
    if (res?.error === 'used') {
      setState('used');
      return;
    }
    toast({ title: '¡Bienvenido al equipo!', description: 'Tu acceso fue activado.' });
    setState('success');
    setTimeout(() => navigate('/agents/overview'), 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Invitación al equipo
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {email ? `Te invitó ${email}` : 'Revisa y acepta tu invitación al portal de agentes.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === 'loading' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Validando invitación...
            </div>
          )}
          {state === 'success' && (
            <>
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                Invitación válida
              </div>
              <Button className="w-full" onClick={handleAccept}>
                Aceptar e ingresar
              </Button>
            </>
          )}
          {state === 'used' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Esta invitación ya fue usada.
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/agents/overview')}>Ir al dashboard</Button>
            </div>
          )}
          {state === 'expired' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                La invitación expiró.
              </div>
              <p className="text-sm text-muted-foreground">Pide a tu líder que te envíe una nueva invitación.</p>
            </div>
          )}
          {state === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Token inválido.
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/agents/overview">Volver</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
