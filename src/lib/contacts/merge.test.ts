import { test, expect } from 'vitest';
import { mergeContacts } from './merge';
import type { Contact } from '@/types/agents';

const a = {
  id: 'a',
  firstName: 'John',
  emails: ['john@example.com'],
  phones: ['+1'],
  linkedLeadIds: ['lead-1'],
  notes: 'note A',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
} satisfies Contact;
const b = {
  id: 'b',
  firstName: 'Johnny',
  emails: ['johnny@example.com', 'john@example.com'],
  phones: ['+2'],
  linkedLeadIds: ['lead-2'],
  notes: 'note B',
  createdAt: new Date('2026-01-02'),
  updatedAt: new Date('2026-01-02'),
} satisfies Contact;

test('mergeContacts merges emails, phones and linked leads and notes', () => {
  const merged = mergeContacts(a, [b]);
  expect(merged.emails).toContain('john@example.com');
  expect(merged.emails).toContain('johnny@example.com');
  expect(merged.phones).toContain('+1');
  expect(merged.phones).toContain('+2');
  expect(merged.linkedLeadIds).toContain('lead-1');
  expect(merged.linkedLeadIds).toContain('lead-2');
  expect(merged.mergedWith).toContain('b');
  expect(merged.notes).toContain('note B');
});
