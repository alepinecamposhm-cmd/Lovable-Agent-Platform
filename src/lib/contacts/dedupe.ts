export type DupGroup = {
  masterId: string;
  duplicates: string[]; // other contact ids
};

function normalizeEmail(email?: string) {
  return (email || '').trim().toLowerCase();
}

function normalizePhone(phone?: string) {
  // Basic normalization: remove non-digits. For MVP this is sufficient.
  if (!phone) return '';
  return phone.replace(/\D+/g, '');
}

export function findDuplicateGroups(contacts: Array<{ id: string; emails?: string[]; phones?: string[] }>): DupGroup[] {
  const emailIndex = new Map<string, string[]>();
  const phoneIndex = new Map<string, string[]>();

  for (const c of contacts) {
    (c.emails || []).forEach((e) => {
      const key = normalizeEmail(e);
      if (!key) return;
      emailIndex.set(key, (emailIndex.get(key) || []).concat(c.id));
    });
    (c.phones || []).forEach((p) => {
      const key = normalizePhone(p);
      if (!key) return;
      phoneIndex.set(key, (phoneIndex.get(key) || []).concat(c.id));
    });
  }

  const groups: DupGroup[] = [];
  const seen = new Set<string>();

  const addGroupFromIndex = (index: Map<string, string[]>) => {
    for (const [key, ids] of index.entries()) {
      const uniq = Array.from(new Set(ids));
      if (uniq.length <= 1) continue;
      // pick master as first id for now
      const masterId = uniq[0];
      const others = uniq.slice(1);
      // ensure we don't duplicate groups covering same master
      const groupKey = [masterId, ...others].sort().join('|');
      if (seen.has(groupKey)) continue;
      seen.add(groupKey);
      groups.push({ masterId, duplicates: others });
    }
  };

  addGroupFromIndex(emailIndex);
  addGroupFromIndex(phoneIndex);

  return groups;
}
