import type { Role } from './types';

const KEY = 'agent_portal_preview_role';
const PREVIEW_FLAG_KEY = 'agent_portal_preview_enabled';
export type PreviewRole = 'agent' | 'leader';

function getSearchPreviewParam(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('preview');
}

export function isPreviewEnabled(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true) return true;
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ROLE_PREVIEW === '1') return true;
  if (typeof window === 'undefined') return false;

  const qp = getSearchPreviewParam();
  if (qp === '1') {
    window.localStorage.setItem(PREVIEW_FLAG_KEY, '1');
    return true;
  }
  if (qp === '0') {
    window.localStorage.removeItem(PREVIEW_FLAG_KEY);
    return false;
  }

  return window.localStorage.getItem(PREVIEW_FLAG_KEY) === '1';
}

export function getPreviewRole(): PreviewRole | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEY);
  if (raw === 'agent' || raw === 'leader') return raw;
  return null;
}

export function setPreviewRole(role: PreviewRole): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, role);
  window.dispatchEvent(new Event('preview-role-changed'));
}

export function getEffectiveRole(realRole: Role): Role {
  if (!isPreviewEnabled()) return realRole;
  const previewRole = getPreviewRole() ?? 'agent';
  return previewRole;
}
