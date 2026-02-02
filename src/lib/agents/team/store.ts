import { useSyncExternalStore } from 'react';
import { mockTeamAgents, mockAgent } from '../fixtures';
import type { Agent, TeamRole } from '@/types/agents';
import { listLeads, replaceLeads } from '../leads/store';
import { addAuditEvent } from '@/lib/audit/store';

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
}

const MEMBERS_KEY = 'agenthub_team_members';
const INVITES_KEY = 'agenthub_team_invites';
const ROUTING_ALERT_KEY = 'agenthub_routing_alert';
const listeners = new Set<() => void>();

function loadMembers(): Agent[] {
  if (typeof window === 'undefined') return mockTeamAgents;
  const raw = window.localStorage.getItem(MEMBERS_KEY);
  if (!raw) return mockTeamAgents;
  try {
    return JSON.parse(raw) as Agent[];
  } catch (e) {
    return mockTeamAgents;
  }
}

function persistMembers(data: Agent[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(data));
}

function loadInvites(): TeamInvite[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(INVITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TeamInvite[];
  } catch {
    return [];
  }
}

function persistInvites(data: TeamInvite[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVITES_KEY, JSON.stringify(data));
}

let members = loadMembers();
let invites = loadInvites();
let cached: { members: Agent[]; invites: TeamInvite[] } | null = null;

function cleanExpiredInvites() {
  const now = Date.now();
  let changed = false;
  invites = invites.map((i) => {
    if (i.status === 'pending' && new Date(i.expiresAt).getTime() < now) {
      changed = true;
      return { ...i, status: 'expired' };
    }
    return i;
  });
  if (changed) {
    persistInvites(invites);
  }
}

function emit() {
  cached = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listMembers() {
  return members.slice();
}

export function listInvites() {
  cleanExpiredInvites();
  return invites.slice();
}

export function addInvite(email: string, role: TeamRole = 'agent') {
  const token = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const invite: TeamInvite = {
    id: `invite-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    email,
    role,
    status: 'pending',
    createdAt: new Date().toISOString(),
    token,
    expiresAt,
  };
  invites = [invite, ...invites];
  persistInvites(invites);
  addAuditEvent({ action: 'invite_created', actor: mockAgent.id, domain: 'team', payload: { email, role, token } });
  emit();
  return invite;
}

function findInviteByToken(token: string) {
  cleanExpiredInvites();
  return invites.find((i) => i.token === token);
}

export function acceptInvite(id: string) {
  const invite = invites.find((i) => i.id === id);
  return invite ? acceptInviteByToken(invite.token) : undefined;
}

export function acceptInviteByToken(token: string) {
  const invite = findInviteByToken(token);
  if (!invite) return;
  if (invite.status === 'expired' || new Date(invite.expiresAt).getTime() < Date.now()) {
    invites = invites.map((i) => (i.id === invite.id ? { ...i, status: 'expired' } : i));
    persistInvites(invites);
    emit();
    return { error: 'expired' };
  }
  if (invite.status === 'accepted') return { error: 'used' };
  invites = invites.map((i) => (i.id === invite.id ? { ...i, status: 'accepted', acceptedAt: new Date().toISOString() } : i));
  const newMember: Agent = {
    id: `agent-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    email: invite.email,
    phone: '',
    firstName: invite.email.split('@')[0],
    lastName: '',
    specialties: [],
    zones: [],
    languages: ['Español'],
    teamId: 'team-1',
    role: invite.role,
    status: 'active',
    profileCompletion: 10,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
  members = [...members, newMember];
  persistMembers(members);
  persistInvites(invites);
  addAuditEvent({ action: 'invite_accepted', actor: newMember.id, domain: 'team', payload: { email: invite.email } });
  emit();
  return { member: newMember };
}

export function removeInvite(id: string) {
  invites = invites.filter((i) => i.id !== id);
  persistInvites(invites);
  emit();
}

export function updateRole(agentId: string, role: TeamRole) {
  members = members.map((m) =>
    m.id === agentId ? { ...m, role, updatedAt: new Date('2026-01-28') as any } : m
  );
  persistMembers(members);
  addAuditEvent({ action: 'role_changed', actor: mockAgent.id, domain: 'team', payload: { agentId, role } });
  emit();
}

export function removeMember(agentId: string, reassignedTo: string) {
  const leads = listLeads();
  const nextLeads = leads.map((l) =>
    l.assignedTo === agentId ? { ...l, assignedTo: reassignedTo, updatedAt: new Date() } : l
  );
  replaceLeads(nextLeads);
  members = members.filter((m) => m.id !== agentId);
  persistMembers(members);
  addAuditEvent({ action: 'member_removed', actor: mockAgent.id, domain: 'team', payload: { agentId, reassignedTo } });
  emit();
}

export function getCurrentUser() {
  return members.find((m) => m.id === mockAgent.id) || mockAgent;
}

export function setRoutingAlert(flag: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROUTING_ALERT_KEY, flag ? '1' : '0');
}

export function getRoutingAlert(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ROUTING_ALERT_KEY) === '1';
}

function getSnapshot() {
  if (!cached) cached = { members: listMembers(), invites: listInvites() };
  return cached;
}

export function useTeamStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function isLastAdmin(agentId: string) {
  const admins = members.filter((m) => m.role === 'owner' || m.role === 'admin');
  return admins.length <= 1 && admins[0]?.id === agentId;
}

export function transferOwnership(fromId: string, toId: string) {
  members = members.map((m) => {
    if (m.id === toId) return { ...m, role: 'owner', updatedAt: new Date() as any };
    if (m.id === fromId) return { ...m, role: 'admin', updatedAt: new Date() as any };
    return m;
  });
  persistMembers(members);
  addAuditEvent({ action: 'ownership_transferred', actor: fromId, domain: 'team', payload: { toId } });
  emit();
}
