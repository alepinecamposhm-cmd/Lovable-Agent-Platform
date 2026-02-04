import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';
import { mockLeads } from '../fixtures';
import type { Lead, LeadStage } from '@/types/agents';

const STORAGE_KEY = 'agenthub_leads';
const listeners = new Set<() => void>();

function load(): Lead[] {
  if (typeof window === 'undefined') return mockLeads;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockLeads;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return mockLeads;
    return parsed.map((leadRaw) => {
      const lead = leadRaw as Record<string, unknown>;
      return {
        ...(leadRaw as Omit<
          Lead,
          | 'createdAt'
          | 'updatedAt'
          | 'lastContactedAt'
          | 'lastActivityAt'
          | 'nextFollowUpAt'
          | 'closedAt'
          | 'tags'
        >),
        createdAt: typeof lead.createdAt === 'string' ? parseISO(lead.createdAt) : new Date(),
        updatedAt: typeof lead.updatedAt === 'string' ? parseISO(lead.updatedAt) : new Date(),
        lastContactedAt: typeof lead.lastContactedAt === 'string' ? parseISO(lead.lastContactedAt) : undefined,
        lastActivityAt: typeof lead.lastActivityAt === 'string' ? parseISO(lead.lastActivityAt) : undefined,
        nextFollowUpAt: typeof lead.nextFollowUpAt === 'string' ? parseISO(lead.nextFollowUpAt) : undefined,
        closedAt: typeof lead.closedAt === 'string' ? parseISO(lead.closedAt) : undefined,
        tags: Array.isArray(lead.tags) ? (lead.tags as string[]) : [],
      };
    });
  } catch (e) {
    console.error('Failed to parse leads from storage', e);
    return mockLeads;
  }
}

function save(data: Lead[]) {
  if (typeof window === 'undefined') return;
  const serializable = data.map((lead) => ({
    ...lead,
    createdAt: formatISO(lead.createdAt),
    updatedAt: formatISO(lead.updatedAt),
    lastContactedAt: lead.lastContactedAt ? formatISO(lead.lastContactedAt) : undefined,
    lastActivityAt: lead.lastActivityAt ? formatISO(lead.lastActivityAt) : undefined,
    nextFollowUpAt: lead.nextFollowUpAt ? formatISO(lead.nextFollowUpAt) : undefined,
    closedAt: lead.closedAt ? formatISO(lead.closedAt) : undefined,
    tags: lead.tags || [],
  }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let leads = load();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listLeads(): Lead[] {
  return leads.slice().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function replaceLeads(next: Lead[]) {
  leads = next;
  save(leads);
  emit();
}

export function getLeadById(id: string) {
  return leads.find((l) => l.id === id);
}

export function updateLeadStage(id: string, stage: LeadStage) {
  const prev = leads.find((l) => l.id === id);
  if (!prev || prev.stage === stage) return prev;
  leads = leads.map((lead) =>
    lead.id === id ? { ...lead, stage, updatedAt: new Date() } : lead
  );
  save(leads);
  emit();
  return prev;
}

type LeadInput = Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>> & {
  firstName: string;
  stage?: LeadStage;
  assignedTo?: string;
};

export function addLead(input: LeadInput): Lead {
  const id = `lead-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
  const now = new Date();
  const newLead: Lead = {
    id,
    stage: input.stage ?? 'new',
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    score: input.score ?? 70,
    temperature: input.temperature ?? 'warm',
    assignedTo: input.assignedTo ?? 'agent-1',
    source: input.source ?? 'manual',
    interestedIn: input.interestedIn ?? 'buy',
    propertyType: input.propertyType,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    preferredZones: input.preferredZones,
    notes: input.notes,
    tags: input.tags || [],
    lastContactedAt: input.lastContactedAt,
    lastActivityAt: input.lastActivityAt,
    nextFollowUpAt: input.nextFollowUpAt,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    closedAt: input.closedAt,
    closeReason: input.closeReason,
    teamId: input.teamId,
  };

  leads = [newLead, ...leads];
  save(leads);
  emit();
  return newLead;
}

export function updateLeadNotes(id: string, notes: string) {
  leads = leads.map((lead) => (lead.id === id ? { ...lead, notes, updatedAt: new Date() } : lead));
  save(leads);
  emit();
}

export function updateLeadTags(id: string, tags: string[]) {
  leads = leads.map((lead) => (lead.id === id ? { ...lead, tags, updatedAt: new Date() } : lead));
  save(leads);
  emit();
}

export function reassignLead(id: string, toAgentId: string) {
  leads = leads.map((lead) =>
    lead.id === id ? { ...lead, assignedTo: toAgentId, updatedAt: new Date() } : lead
  );
  save(leads);
  emit();
}

export function useLeadStore() {
  return useSyncExternalStore(
    subscribe,
    () => ({ leads: listLeads() }),
    () => ({ leads: listLeads() })
  );
}
