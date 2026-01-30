import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafeBack } from '@/lib/hooks/use-safe-back';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { addContact } from '@/lib/agents/contacts/store';
import { track } from '@/lib/analytics';
import { toast } from '@/components/ui/use-toast';

export default function AgentContactNew() {
  const navigate = useNavigate();
  const safeBack = useSafeBack();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = () => {
    if (!firstName.trim()) {
      toast({ title: 'Nombre requerido', description: 'Ingresa al menos el nombre.' });
      return;
    }
    setSaving(true);
    const contact = addContact({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      emails: email ? [email.trim()] : [],
      phones: phone ? [phone.trim()] : [],
      notes: notes.trim() || undefined,
    });
    track('contact.created', { properties: { contactId: contact.id } });
    toast({ title: 'Contacto creado', description: `${contact.firstName} agregado a tu base.` });
    navigate(`/agents/contacts/${contact.id}`);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo contacto</h1>
          <p className="text-muted-foreground text-sm">Captura rápida para convertir después en lead.</p>
        </div>
        <Button variant="outline" onClick={() => safeBack('/agents/contacts')}>Cancelar</Button>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Datos básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nombre *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="María" />
              </div>
              <div className="space-y-1">
                <Label>Apellido</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="García" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@email.com" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 1234 5678" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notas</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferencias, canal, presupuesto..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => safeBack('/agents/contacts')}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>Guardar</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
