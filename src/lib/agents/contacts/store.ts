import { useSyncExternalStore } from 'react';
import { formatISO, parseISO } from 'date-fns';
import { mockContacts } from '@/lib/agents/fixtures';
import { addAuditEvent } from '@/lib/audit/store';

export type Contact = {
  id: string;
  firstName: string;
  lastName?: string;
  emails?: string[];
  phones?: string[];
  notes?: string;
  tags?: string[];
  leadId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const STORAGE_KEY = 'agenthub_contacts';
const listeners = new Set<() => void>();

function load(): Contact[] {
  if (typeof window === 'undefined') return mockContacts.map(seedToContact);
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockContacts.map(seedToContact);
  try {
    const parsed = JSON.parse(raw) as any[];
    return parsed.map(deserializeContact);
  } catch (e) {
    console.warn('contacts: parse error, using seeds', e);
    return mockContacts.map(seedToContact);
  }
}

function save(data: Contact[]) {
  if (typeof window === 'undefined') return;
  const serializable = data.map(serializeContact);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

let contacts = load();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listContacts(): Contact[] {
  return contacts.slice().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function getContact(id: string | undefined) {
  if (!id) return undefined;
  return contacts.find((c) => c.id === id);
}

type ContactInput = Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> & { firstName: string };

export function addContact(input: ContactInput): Contact {
  const now = new Date();
  const contact: Contact = {
    id: `contact-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    emails: input.emails || [],
    phones: input.phones || [],
    notes: input.notes,
    tags: input.tags || [],
    leadId: input.leadId,
    createdAt: now,
    updatedAt: now,
  };
  contacts = [contact, ...contacts];
  save(contacts);
  emit();
  addAuditEvent({ action: 'contact.created', payload: { id: contact.id, leadId: contact.leadId } });
  return contact;
}

export function updateContact(id: string, patch: Partial<Contact>): Contact | undefined {
  let updated: Contact | undefined;
  contacts = contacts.map((c) => {
    if (c.id !== id) return c;
    updated = { ...c, ...patch, updatedAt: new Date() };
    return updated;
  });
  if (updated) {
    save(contacts);
    emit();
    addAuditEvent({ action: 'contact.updated', payload: { id, fields: Object.keys(patch) } });
  }
  return updated;
}

export function linkLead(contactId: string, leadId: string) {
  updateContact(contactId, { leadId });
}

export function mergeContacts(masterId: string, mergedIds: string[]): Contact | undefined {
  const master = contacts.find((c) => c.id === masterId);
  if (!master || mergedIds.length === 0) return master;
  const toMerge = contacts.filter((c) => mergedIds.includes(c.id));
  const merged = {
    ...master,
    emails: unique([...master.emails || [], ...flatPick(toMerge, 'emails')]),
    phones: unique([...master.phones || [], ...flatPick(toMerge, 'phones')]),
    notes: master.notes || toMerge.find((c) => c.notes)?.notes,
    tags: unique([...(master.tags || []), ...flatPick(toMerge, 'tags')]),
    updatedAt: new Date(),
  } as Contact;

  contacts = contacts
    .filter((c) => c.id === masterId || !mergedIds.includes(c.id))
    .map((c) => (c.id === masterId ? merged : c));

  save(contacts);
  emit();
  addAuditEvent({
    action: 'contact.merged',
    payload: { masterId, mergedIds },
  });
  return merged;
}

export function useContactStore() {
  return useSyncExternalStore(
    subscribe,
    () => ({ contacts: listContacts() }),
    () => ({ contacts: listContacts() })
  );
}

function seedToContact(seed: any): Contact {
  return {
    id: seed.id,
    firstName: seed.firstName,
    lastName: seed.lastName,
    emails: seed.emails || [],
    phones: seed.phones || [],
    notes: seed.notes,
    tags: seed.tags || [],
    leadId: seed.leadId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function serializeContact(c: Contact) {
  return {
    ...c,
    createdAt: formatISO(c.createdAt),
    updatedAt: formatISO(c.updatedAt),
  };
}

function deserializeContact(raw: any): Contact {
  return {
    ...raw,
    createdAt: raw.createdAt ? parseISO(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? parseISO(raw.updatedAt) : new Date(),
    emails: raw.emails || [],
    phones: raw.phones || [],
    tags: raw.tags || [],
  };
}

function flatPick(items: any[], key: string) {
  return items.flatMap((i) => i?.[key] || []).filter(Boolean);
}

function unique(arr: any[]) {
  return Array.from(new Set(arr));
}
