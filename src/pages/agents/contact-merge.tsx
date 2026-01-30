import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { track } from '@/lib/analytics';

type Contact = {
  id: string;
  firstName: string;
  lastName?: string;
  emails?: string[];
  phones?: string[];
  notes?: string;
};

export default function AgentContactMerge() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => setContacts(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const main = useMemo(() => contacts?.find((c) => c.id === contactId) ?? null, [contacts, contactId]);

  const candidates = useMemo(() => {
    if (!contacts || !main) return [];
    const candidatesList = contacts.filter((c) => c.id !== main.id && ((c.emails || []).some(e => (main.emails || []).includes(e)) || (c.phones || []).some(p => (main.phones || []).includes(p))));
    return candidatesList;
  }, [contacts, main]);

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((s) => ({ ...s, [id]: !s[id] }));
  };

  const submitMerge = async () => {
    if (!main) return;
    const mergedIds = Object.entries(selectedCandidates).filter(([, v]) => v).map(([k]) => k);
    if (mergedIds.length === 0) {
      setError('Selecciona al menos un contacto a mergear.');
      return;
    }
    try {
      setLoading(true);
      track('contact_merge_started', { masterId: main.id, mergedIds });
      const res = await fetch('/api/contacts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterId: main.id, mergedIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error('merge failed');
      track('contact_merged', { masterId: main.id, mergedId: json.merged.id });
      navigate(`/agents/contacts/${json.merged.id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Merge Contactos</h1>
        <div className="ml-auto">
          <Link to="/agents/contacts" className="text-sm">Volver a contactos</Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona duplicados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {error && <div className="text-sm text-destructive">{error}</div>}

          {main && (
            <div className="mb-4">
              <div className="font-medium">Master: {main.firstName} {main.lastName}</div>
              <div className="text-xs text-muted-foreground">{main.emails?.[0] ?? main.phones?.[0]}</div>
            </div>
          )}

          {candidates.length === 0 && <div className="text-sm text-muted-foreground">No se encontraron duplicados.</div>}

          {candidates.length > 0 && (
            <ul className="grid gap-2">
              {candidates.map((c) => (
                <li key={c.id} className="p-3 rounded-md border flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-muted-foreground">{c.emails?.[0] ?? c.phones?.[0]}</div>
                  </div>
                  <div>
                    <input type="checkbox" checked={!!selectedCandidates[c.id]} onChange={() => toggleCandidate(c.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => navigate(`/agents/contacts/${contactId}`)}>Cancelar</Button>
            <Button disabled={loading} onClick={submitMerge}>Confirmar Merge</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
