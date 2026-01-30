import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { useContactStore } from '@/lib/agents/contacts/store';
import { track } from '@/lib/analytics';
import { Plus, Search } from 'lucide-react';
import { findDuplicateGroups } from '@/lib/contacts/dedupe';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function AgentContacts() {
  const navigate = useNavigate();
  const { contacts } = useContactStore();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'loading' | 'success' | 'empty'>('loading');

  const [duplicatesOpen, setDuplicatesOpen] = useState(false);
  const [dedupeDismissed, setDedupeDismissed] = useState(() => typeof window !== 'undefined' && localStorage.getItem('agenthub_dedupe_dismissed') === '1');

  useEffect(() => {
    if (contacts.length === 0) setState('empty');
    else setState('success');
  }, [contacts]);

  useEffect(() => {
    track('contact.list_view');
    track('navigation.page_view', { properties: { path: '/agents/contacts' } });
  }, []);

  // Compute duplicate suggestion groups (exact email / normalized phone)
  const duplicateGroups = useMemo(() => findDuplicateGroups(contacts), [contacts]);

  useEffect(() => {
    if (duplicateGroups.length > 0) {
      track('dedupe_suggestion_shown', { count: duplicateGroups.length });
    }
  }, [duplicateGroups.length]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.firstName, c.lastName, ...(c.emails || []), ...(c.phones || [])]
        .filter(Boolean)
        .some((f) => f!.toString().toLowerCase().includes(q))
    );
  }, [contacts, query]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contactos</h1>
          <p className="text-muted-foreground text-sm">Lista base de clientes; convierte en lead con un clic.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/agents/contacts/new')}>
          <Plus className="h-4 w-4" /> Nuevo contacto
        </Button>
      </motion.div>

      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {state === 'loading' && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border">
              <CardContent className="p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-1/3 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-3 w-2/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {state === 'empty' && (
        <motion.div variants={staggerItem} className="text-center py-16 border rounded-lg bg-card">
          <p className="text-muted-foreground">Aún no tienes contactos cargados.</p>
          <Button className="mt-4" onClick={() => navigate('/agents/contacts/new')}>Crear contacto</Button>
        </motion.div>
      )}

      {state === 'success' && (
        <>
          {/* Dedupe suggestion banner */}
          {duplicateGroups.length > 0 && !dedupeDismissed && (
            <motion.div variants={staggerItem} className="p-4 rounded-lg border bg-yellow-50 text-sm flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="font-medium">Sugerencias de duplicados: {duplicateGroups.length} grupo(s) detectado(s)</p>
                <p className="text-xs text-muted-foreground">Revisá y unificá contactos para mantener historial limpio.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setDuplicatesOpen(true); track('dedupe_suggestion_clicked', { count: duplicateGroups.length }); }}>Ver sugerencias</Button>
                <Button size="sm" onClick={() => { track('dedupe_suggestion_dismissed'); localStorage.setItem('agenthub_dedupe_dismissed', '1'); setDedupeDismissed(true); }}>Omitir</Button>
              </div>
            </motion.div>
          )}

          <motion.div variants={staggerItem} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="border hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  track('contact.view', { properties: { contactId: c.id } });
                  navigate(`/agents/contacts/${c.id}`);
                }}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{c.firstName[0]}{c.lastName?.[0] || ''}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.emails?.[0] || c.phones?.[0] || 'Sin email'}</p>
                    </div>
                    {c.leadId && <Badge variant="secondary">Tiene lead</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {c.emails?.slice(0, 2).map((e) => <Badge key={e} variant="outline">{e}</Badge>)}
                    {c.phones?.slice(0, 1).map((p) => <Badge key={p} variant="outline">Tel: {p}</Badge>)}
                    {(!c.emails || c.emails.length === 0) && (!c.phones || c.phones.length === 0) && (
                      <Badge variant="outline">Sin datos de contacto</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-10 text-center text-muted-foreground">
                  No encontramos coincidencias para “{query}”.
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Duplicates modal */}
          <Dialog open={duplicatesOpen} onOpenChange={setDuplicatesOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Sugerencias de duplicados</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {duplicateGroups.map((g) => {
                  const master = contacts.find(c => c.id === g.masterId);
                  const dupList = g.duplicates.map(id => contacts.find(c => c.id === id)).filter(Boolean);
                  return (
                    <div key={g.masterId} className="p-3 border rounded-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">Master: {master?.firstName} {master?.lastName}</div>
                          <div className="text-xs text-muted-foreground">{master?.emails?.[0] || master?.phones?.[0]}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { navigate(`/agents/contacts/${g.masterId}/merge`); setDuplicatesOpen(false); }}>Abrir Merge</Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm font-medium">Duplicados:</div>
                        <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                          {dupList.map((d) => (
                            <li key={d!.id}>{d!.firstName} {d!.lastName} — {d!.emails?.[0] || d!.phones?.[0]}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setDuplicatesOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </motion.div>
  );
}
