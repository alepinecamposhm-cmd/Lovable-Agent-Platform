import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockLeads } from '@/lib/agents/fixtures';
import { isPreviewEnabled, getEffectiveRole } from '@/lib/permissions/previewRole';
import { getPreviewAgentId, setPreviewAgentId } from '@/lib/permissions/previewAgent';
import { getPreviewLeaderId, setPreviewLeaderId } from '@/lib/permissions/previewLeader';
import { getCurrentUser } from '@/lib/agents/team/store';
import { normalizeRole } from '@/lib/permissions/types';
import {
  getAgentPreviewOptions,
  getLeaderPreviewOptions,
  getPreviewPersonById,
} from '@/lib/permissions/mockPeopleCatalog';

export function PersonaPreviewSelect() {
  const [enabled, setEnabled] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<'agent' | 'leader' | 'admin'>('agent');
  const [selectedId, setSelectedId] = useState<string>('');

  const agentOptions = useMemo(() => getAgentPreviewOptions(), []);
  const leaderOptions = useMemo(() => getLeaderPreviewOptions(), []);

  useEffect(() => {
    const refresh = () => {
      const canShow = isPreviewEnabled();
      setEnabled(canShow);
      if (!canShow) return;

      const realRole = normalizeRole(getCurrentUser().role);
      const role = getEffectiveRole(realRole);
      setEffectiveRole(role);

      if (role === 'agent') {
        const selected = getPreviewAgentId();
        const fallback = agentOptions[0]?.id ?? getCurrentUser().id;
        const valid = selected && getPreviewPersonById(selected) ? selected : fallback;
        if (valid) setPreviewAgentId(valid);
        setSelectedId(valid);
        return;
      }

      const selected = getPreviewLeaderId();
      const fallback = leaderOptions[0]?.id ?? getCurrentUser().id;
      const valid = selected && getPreviewPersonById(selected) ? selected : fallback;
      if (valid) setPreviewLeaderId(valid);
      setSelectedId(valid);
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('preview-role-changed', refresh);
    window.addEventListener('preview-agent-changed', refresh);
    window.addEventListener('preview-leader-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('preview-role-changed', refresh);
      window.removeEventListener('preview-agent-changed', refresh);
      window.removeEventListener('preview-leader-changed', refresh);
    };
  }, [agentOptions, leaderOptions]);

  if (!enabled) return null;

  const isAgentPerspective = effectiveRole === 'agent';
  const options = isAgentPerspective ? agentOptions : leaderOptions;
  const activeLeads = mockLeads.filter(
    (l) =>
      l.assignedTo === selectedId &&
      l.stage !== 'closed' &&
      l.stage !== 'closed_lost'
  ).length;

  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground">
        {isAgentPerspective ? 'Ver como agente' : 'Ver como líder'}
      </Label>
      <Select
        value={selectedId}
        onValueChange={(v) => {
          if (isAgentPerspective) setPreviewAgentId(v);
          else setPreviewLeaderId(v);
          setSelectedId(v);
        }}
      >
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Selecciona perfil" />
        </SelectTrigger>
        <SelectContent>
          {options.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge variant="outline" className="text-[11px]">
        {isAgentPerspective ? `${activeLeads} leads activos` : 'Vista líder'}
      </Badge>
    </div>
  );
}
