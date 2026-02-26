import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/agents/team/store';
import { normalizeRole, type Role } from './types';
import { getEffectiveRole } from './previewRole';
import { can as canRole } from './rbac';
import type { Capability } from './capabilities';
import { getEffectiveAgentId } from './previewAgent';
import { getEffectiveLeaderId } from './previewLeader';

export function useAccess() {
  const [version, setVersion] = useState(0);
  const user = getCurrentUser();

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
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
  }, []);

  void version;
  const realRole: Role = normalizeRole(user.role);
  const role = getEffectiveRole(realRole);
  const effectiveAgentId = getEffectiveAgentId(user.id, realRole);
  const effectiveLeaderId = getEffectiveLeaderId(user.id, realRole);
  const effectivePersonaId = role === 'agent' ? effectiveAgentId : effectiveLeaderId;

  return {
    user,
    realRole,
    role,
    effectiveAgentId,
    effectiveLeaderId,
    effectivePersonaId,
    can: (cap: Capability) => canRole(role, cap),
  };
}
