import { useState, useEffect } from 'react';
import { StickyNote, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface MemberNotesCardProps {
  memberId: string;
}

const MAX_CHARS = 500;

function getStorageKey(memberId: string) {
  return `team_note_${memberId}`;
}

function getTimestampKey(memberId: string) {
  return `team_note_ts_${memberId}`;
}

export function getNoteForMember(memberId: string): string {
  return localStorage.getItem(getStorageKey(memberId)) || '';
}

export function MemberNotesCard({ memberId }: MemberNotesCardProps) {
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [lastEdited, setLastEdited] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(memberId)) || '';
    const ts = localStorage.getItem(getTimestampKey(memberId));
    setNote(stored);
    setSavedNote(stored);
    setLastEdited(ts ? new Date(ts) : null);
  }, [memberId]);

  const hasChanges = note !== savedNote;
  const charCount = note.length;
  const isNearLimit = charCount > 480;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    localStorage.setItem(getStorageKey(memberId), note);
    const now = new Date();
    localStorage.setItem(getTimestampKey(memberId), now.toISOString());
    setSavedNote(note);
    setLastEdited(now);
    setIsSaving(false);
    toast.success('Nota guardada');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Notas del Líder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Escribe una nota sobre este agente..."
          value={note}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) setNote(e.target.value);
          }}
          rows={4}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={cn('text-xs', isNearLimit ? 'text-destructive' : 'text-muted-foreground')}>
              {charCount}/{MAX_CHARS}
            </p>
            {lastEdited && (
              <p className="text-xs text-muted-foreground">
                Última edición: {formatDistanceToNow(lastEdited, { addSuffix: true, locale: es })}
              </p>
            )}
          </div>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="transition-opacity duration-200">
              {isSaving ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Save className="mr-2 h-3 w-3" />
              )}
              Guardar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
