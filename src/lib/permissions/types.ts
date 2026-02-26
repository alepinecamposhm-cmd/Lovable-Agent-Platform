export type Role = 'admin' | 'leader' | 'agent';

export type LegacyRole = 'owner' | 'admin' | 'broker' | 'agent' | 'assistant' | 'lider' | 'agente';

export function normalizeRole(role?: string | null): Role {
  if (!role) return 'agent';
  if (role === 'owner' || role === 'admin') return 'admin';
  if (role === 'broker' || role === 'lider') return 'leader';
  if (role === 'agent' || role === 'agente' || role === 'assistant') return 'agent';
  return 'agent';
}
