import type { Role } from './types';
import { getEffectiveRole, isPreviewEnabled } from './previewRole';
import { getLeaderPreviewOptions, getPreviewPersonById } from './mockPeopleCatalog';

const KEY = 'agent_portal_preview_leader_id';

export function getPreviewLeaderId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY);
}

export function setPreviewLeaderId(id: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event('preview-leader-changed'));
}

export function getEffectiveLeaderId(realUserId: string, role: Role): string {
  if (!isPreviewEnabled()) return realUserId;
  const effectiveRole = getEffectiveRole(role);
  if (effectiveRole !== 'leader') return realUserId;
  const selected = getPreviewLeaderId();
  const person = getPreviewPersonById(selected);
  if (person && (person.role === 'leader' || person.role === 'admin')) return person.id;
  const firstLeader = getLeaderPreviewOptions()[0];
  return firstLeader?.id ?? realUserId;
}

