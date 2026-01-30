import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Globe2, Loader2, Share2, Sparkles, Star } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { listAgents, getAgent, getProfileState, toggleChecklist } from '@/lib/agents/profile/store';
import type { Agent } from '@/types/agents';

export default function AgentProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');
  const [agent, setAgent] = useState<Agent | undefined>();
  const [completion, setCompletion] = useState(getProfileState().completion);
  const [checklist, setChecklist] = useState(getProfileState().checklist);

  useEffect(() => {
    const found = getAgent(params.agentId);
    if (!found) {
      setState('error');
      return;
    }
    setAgent(found);
    setState('success');
    window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'profile.view', agentId: found.id } }));
  }, [params.agentId]);

  const isPublic = Boolean(params.agentId);

  const handleToggle = (id: string) => {
    toggleChecklist(id);
    const next = getProfileState();
    setChecklist(next.checklist);
    setCompletion(next.completion);
    window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'profile.complete_step', step: id } }));
  };

  const shareLink = useMemo(() => `${window.location.origin}/agents/profile/${agent?.id || ''}`, [agent?.id]);

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando perfil...
      </div>
    );
  }

  if (state === 'error' || !agent) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>Volver</Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Perfil no encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const missing = checklist.filter((c) => !c.done).length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={agent.avatarUrl} />
            <AvatarFallback>{agent.firstName[0]}{agent.lastName?.[0] || ''}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{agent.firstName} {agent.lastName}</h1>
            <p className="text-muted-foreground text-sm">{agent.bio || 'Agente inmobiliario'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{agent.licenseNumber}</Badge>
              <Badge variant="outline">{agent.specialties?.[0] || 'Especialista'}</Badge>
              <Badge variant="outline">{agent.zones?.[0]?.name || 'Zona principal'}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(shareLink)}>
            <Share2 className="h-4 w-4" /> Copiar enlace público
          </Button>
          {!isPublic && (
            <Button className="gap-2" onClick={() => navigate(`/agents/profile/${agent.id}`)}>
              <Globe2 className="h-4 w-4" /> Ver vista pública
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Progreso de perfil</CardTitle>
              <p className="text-sm text-muted-foreground">Checklist para llegar al 100%.</p>
            </div>
            <Badge variant={completion === 100 ? 'default' : 'secondary'} className="gap-1">
              <Sparkles className="h-4 w-4" /> {completion}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completion} className="h-2" />
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id)} />
                    <p className="text-sm">{item.label}</p>
                  </div>
                  {item.done && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
              ))}
              {missing === 0 && (
                <div className="p-3 rounded-lg bg-success/10 text-success text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Perfil completo al 100% (mock guardado).
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reseñas (mock)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[{ name: 'Cliente A', rating: 5, text: 'Muy atento y rápido.' }, { name: 'Cliente B', rating: 4, text: 'Buen seguimiento.' }].map((r, i) => (
              <div key={i} className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="flex items-center gap-1 text-warning">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3 w-3 fill-warning text-warning" />
                    ))}
                  </span>
                </div>
                <p className="text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos públicos</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <InfoItem label="Email" value={agent.email} />
            <InfoItem label="Teléfono" value={agent.phone} />
            <InfoItem label="Idiomas" value={agent.languages?.join(', ')} />
            <InfoItem label="Zonas" value={agent.zones?.map((z) => z.name).join(', ')} />
            <InfoItem label="Especialidades" value={agent.specialties?.join(', ')} />
            <InfoItem label="Estado" value={agent.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oportunidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Compartir link público con leads calientes.</p>
            <p>• Añadir video corto del agente.</p>
            <p>• Pedir reseñas post-cierre.</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  );
}
