import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useContactStore, mergeContacts, linkLead } from '@/lib/agents/contacts/store';
import { addLead } from '@/lib/agents/leads/store';
import { track } from '@/lib/analytics';
import { addAuditEvent } from '@/lib/audit/store';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Link2, ShieldAlert, UserPlus2, GitMerge } from 'lucide-react';

export default function AgentContactDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const { contacts } = useContactStore();
  const contact = contacts.find((c) => c.id === params.contactId);
  const [merging, setMerging] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (contact) track('contact.view', { properties: { contactId: contact.id } });
  }, [contact?.id]);

  const duplicates = useMemo(() => {
    if (!contact) return [];
    return contacts.filter((c) => {
      if (c.id === contact.id) return false;
      const shareEmail = (c.emails || []).some((e) => contact.emails?.includes(e));
      const sharePhone = (c.phones || []).some((p) => contact.phones?.includes(p));
      return shareEmail || sharePhone;
    });
  }, [contact, contacts]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const handleMerge = () => {
    if (!contact) return;
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) {
      toast({ title: 'Selecciona duplicados', description: 'Marca al menos un contacto para mergear.' });
      return;
    }
    setMerging(true);
    mergeContacts(contact.id, ids);
    track('contact.merge_success', { properties: { contactId: contact.id, mergedIds: ids } });
    toast({ title: 'Contactos combinados', description: 'Unificamos los datos en un solo contacto.' });
    setSelected({});
    setMerging(false);
  };

  const handleCreateLead = () => {
    if (!contact) return;
    const lead = addLead({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.emails?.[0],
      phone: contact.phones?.[0],
      notes: contact.notes,
      source: 'contact',
    });
    linkLead(contact.id, lead.id);
    addAuditEvent({ action: 'contact.create_lead', payload: { contactId: contact.id, leadId: lead.id } });
    track('contact.lead_created_from_contact', { properties: { contactId: contact.id, leadId: lead.id } });
    toast({ title: 'Lead creado', description: 'Convertimos el contacto en lead.' });
    navigate(`/agents/leads/${lead.id}`);
  };

  if (!contact) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Contacto no encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{contact.firstName[0]}{contact.lastName?.[0] || ''}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{contact.firstName} {contact.lastName}</h1>
            <p className="text-sm text-muted-foreground">{contact.emails?.[0] || contact.phones?.[0] || 'Sin datos de contacto'}</p>
            <div className="flex gap-2 mt-2">
              {contact.leadId ? (
                <Badge variant="secondary" className="gap-1">
                  <Link2 className="h-3 w-3" /> Lead vinculado
                </Badge>
              ) : (
                <Badge variant="outline">Sin lead</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {contact.leadId ? (
            <Button variant="outline" onClick={() => navigate(`/agents/leads/${contact.leadId}`)}>Ver lead</Button>
          ) : (
            <Button className="gap-2" onClick={handleCreateLead}>
              <UserPlus2 className="h-4 w-4" /> Crear lead
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/agents/contacts/${contact.id}/merge`)}>
            <GitMerge className="h-4 w-4" /> Merge duplicados
          </Button>
          <Button variant="outline" onClick={() => navigate('/agents/contacts')}>Volver</Button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">Emails</p>
              <div className="flex flex-wrap gap-2">
                {contact.emails?.length
                  ? contact.emails.map((e) => <Badge key={e} variant="outline">{e}</Badge>)
                  : <span className="text-muted-foreground">No hay emails</span>}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">Teléfonos</p>
              <div className="flex flex-wrap gap-2">
                {contact.phones?.length
                  ? contact.phones.map((p) => <Badge key={p} variant="outline">{p}</Badge>)
                  : <span className="text-muted-foreground">No hay teléfonos</span>}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">Notas</p>
              <p className="text-muted-foreground">{contact.notes || 'Sin notas'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" /> Duplicados
            </CardTitle>
            <Badge variant="outline">{duplicates.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {duplicates.length === 0 && (
              <p className="text-muted-foreground text-sm">No encontramos duplicados por email/teléfono.</p>
            )}
            {duplicates.length > 0 && (
              <div className="space-y-2">
                {duplicates.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded border">
                    <Checkbox id={d.id} checked={!!selected[d.id]} onCheckedChange={() => toggle(d.id)} />
                    <label htmlFor={d.id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{d.firstName} {d.lastName}</div>
                      <div className="text-xs text-muted-foreground">{d.emails?.[0] || d.phones?.[0]}</div>
                    </label>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleMerge} disabled={merging}>Merge seleccionados</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelected({})}>Limpiar</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
