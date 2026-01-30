import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useContactStore, mergeContacts } from '@/lib/agents/contacts/store';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { track } from '@/lib/analytics';

export default function AgentContactMerge() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { contacts } = useContactStore();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const main = useMemo(() => contacts.find((c) => c.id === contactId), [contacts, contactId]);
  const duplicates = useMemo(() => {
    if (!main) return [];
    return contacts.filter((c) => {
      if (c.id === main.id) return false;
      const shareEmail = (c.emails || []).some((e) => main.emails?.includes(e));
      const sharePhone = (c.phones || []).some((p) => main.phones?.includes(p));
      return shareEmail || sharePhone;
    });
  }, [contacts, main]);

  useEffect(() => {
    track('navigation.page_view', { properties: { path: '/agents/contacts/:contactId/merge', contactId } });
  }, [contactId]);

  if (!main) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate('/agents/contacts')}>Volver</Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Contacto no encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const handleMerge = () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) {
      toast({ title: 'Selecciona duplicados', description: 'Marca al menos un contacto.' });
      return;
    }
    mergeContacts(main.id, ids);
    track('contact.merge_success', { properties: { contactId: main.id, mergedIds: ids } });
    toast({ title: 'Contactos combinados', description: 'Unificamos los datos en el master.' });
    navigate(`/agents/contacts/${main.id}`);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Merge de Contactos</h1>
          <p className="text-muted-foreground text-sm">Unifica duplicados por email o teléfono.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/agents/contacts/${main.id}`)}>Volver a contacto</Button>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Master: {main.firstName} {main.lastName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-xs text-muted-foreground">{main.emails?.[0] || main.phones?.[0] || 'Sin email/teléfono'}</div>
            <div className="space-y-2">
              {duplicates.length === 0 && (
                <p className="text-muted-foreground">No hay duplicados detectados.</p>
              )}
              {duplicates.map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded border">
                  <Checkbox id={c.id} checked={!!selected[c.id]} onCheckedChange={() => toggle(c.id)} />
                  <label htmlFor={c.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-muted-foreground">{c.emails?.[0] || c.phones?.[0] || 'Sin datos'}</div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelected({})}>Limpiar</Button>
              <Button onClick={handleMerge} disabled={duplicates.length === 0}>Merge seleccionados</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
