import { findDuplicateGroups } from './dedupe';

const mockContacts = [
  { id: 'c1', emails: ['alice@example.com'], phones: ['+1 (555) 111-2222'] },
  { id: 'c2', emails: ['ALICE@EXAMPLE.COM'], phones: [] },
  { id: 'c3', emails: ['bob@example.com'], phones: ['5551113333'] },
  { id: 'c4', emails: [], phones: ['+1-555-111-2222'] },
  { id: 'c5', emails: ['carol@example.com'], phones: [] },
];

test('finds duplicates by email (case-insensitive) and phone (normalized)', () => {
  const groups = findDuplicateGroups(mockContacts as any);
  // Expect 2 groups: c1/c2 (email) and c1/c4 (phone) => groups may overlap
  expect(groups.length).toBeGreaterThanOrEqual(2);

  const emailGroup = groups.find(g => g.masterId === 'c1' && g.duplicates.includes('c2'));
  expect(emailGroup).toBeDefined();

  const phoneGroup = groups.find(g => g.masterId === 'c1' && g.duplicates.includes('c4'));
  expect(phoneGroup).toBeDefined();
});
