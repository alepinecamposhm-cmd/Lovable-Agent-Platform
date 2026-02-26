import type { Role } from './types';
import { getEffectiveRole, isPreviewEnabled } from './previewRole';
import { getAgentPreviewOptions, getPreviewPersonById } from './mockPeopleCatalog';

const KEY = 'agent_portal_preview_agent_id';

export function getPreviewAgentId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY);
}

export function setPreviewAgentId(id: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event('preview-agent-changed'));
}

export function getEffectiveAgentId(realUserId: string, role: Role): string {
  if (!isPreviewEnabled()) return realUserId;
  const effectiveRole = getEffectiveRole(role);
  if (effectiveRole !== 'agent') return realUserId;
  const selected = getPreviewAgentId();
  if (selected && getPreviewPersonById(selected)) return selected;
  const firstAgent = getAgentPreviewOptions()[0];
  return firstAgent?.id ?? realUserId;
}
