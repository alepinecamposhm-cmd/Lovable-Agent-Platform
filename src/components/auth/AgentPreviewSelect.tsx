import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockTeamAgents, mockLeads } from '@/lib/agents/fixtures';
import { isPreviewEnabled, getEffectiveRole } from '@/lib/permissions/previewRole';
import { getPreviewAgentId, setPreviewAgentId } from '@/lib/permissions/previewAgent';
import { getCurrentUser } from '@/lib/agents/team/store';
import { normalizeRole } from '@/lib/permissions/types';

export function AgentPreviewSelect() {
  const [enabled, setEnabled] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<'agent' | 'leader' | 'admin'>('agent');
  const [agentId, setAgentId] = useState<string>('');

  const agentOptions = useMemo(() => {
    return mockTeamAgents
      .map((a) => ({ id: a.id, label: `${a.firstName} ${a.lastName}`.trim() }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  useEffect(() => {
    const refresh = () => {
      const canShow = isPreviewEnabled();
      setEnabled(canShow);
      if (!canShow) return;

      const realRole = normalizeRole(getCurrentUser().role);
      const role = getEffectiveRole(realRole);
      setEffectiveRole(role);

      const selected = getPreviewAgentId() ?? getCurrentUser().id;
      setAgentId(selected);
      if (!getPreviewAgentId()) setPreviewAgentId(selected);
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('preview-role-changed', refresh);
    window.addEventListener('preview-agent-changed', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('preview-role-changed', refresh);
      window.removeEventListener('preview-agent-changed', refresh);
    };
  }, []);

  if (!enabled || effectiveRole !== 'agent') return null;

  const activeLeads = mockLeads.filter((l) => l.assignedTo === agentId && l.stage !== 'closed' && l.stage !== 'closed_lost').length;

  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground">Ver como agente</Label>
      <Select value={agentId} onValueChange={(v) => { setPreviewAgentId(v); setAgentId(v); }}>
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Selecciona agente" />
        </SelectTrigger>
        <SelectContent>
          {agentOptions.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge variant="outline" className="text-[11px]">{activeLeads} leads activos</Badge>
    </div>
  );
}
