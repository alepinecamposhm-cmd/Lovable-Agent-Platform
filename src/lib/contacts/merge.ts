import type { Contact } from '@/types/agents';

export type MergeDecision = {
  masterId: string;
  mergedIds: string[];
  // fieldsOverride maps fieldName -> chosenValue
  fieldsOverride?: Partial<Contact>;
};

/**
 * Merge two or more contacts into a single contact.
 * Strategy: start from master contact, then fill empty fields from others (in order),
 * then apply explicit overrides from fieldsOverride.
 */
export function mergeContacts(master: Contact, others: Contact[], fieldsOverride: Partial<Contact> = {}): Contact {
  const result: Contact = {
    ...master,
    emails: master.emails ? [...master.emails] : [],
    phones: master.phones ? [...master.phones] : [],
    linkedLeadIds: master.linkedLeadIds ? [...master.linkedLeadIds] : [],
    tags: master.tags ? [...master.tags] : [],
    notes: master.notes ?? '',
    createdAt: master.createdAt ?? new Date(),
    updatedAt: new Date(),
    mergedWith: Array.isArray(master.mergedWith) ? [...master.mergedWith] : [],
  } as Contact;

  for (const other of others) {
    // merge emails/phones/linkedLeadIds/tags
    if (other.emails) {
      for (const e of other.emails) if (!result.emails.includes(e)) result.emails.push(e);
    }
    if (other.phones) {
      for (const p of other.phones) if (!result.phones.includes(p)) result.phones.push(p);
    }
    if (other.linkedLeadIds) {
      for (const id of other.linkedLeadIds) if (!result.linkedLeadIds.includes(id)) result.linkedLeadIds.push(id);
    }
    if (other.tags) {
      for (const t of other.tags) if (!result.tags.includes(t)) result.tags.push(t);
    }
    if (other.notes) {
      if (!result.notes) result.notes = other.notes;
      else if (other.notes !== result.notes) result.notes += `\n\nMerged note from ${other.id}: ${other.notes}`;
    }
    result.mergedWith = Array.from(new Set([...result.mergedWith, other.id]));
  }

  // Apply explicit overrides
  Object.assign(result, fieldsOverride);

  // Normalize: if empty arrays become undefined
  if (result.emails.length === 0) delete result.emails;
  if (result.phones.length === 0) delete result.phones;
  if (result.linkedLeadIds.length === 0) delete result.linkedLeadIds;
  if (result.tags.length === 0) delete result.tags;

  return result;
}
