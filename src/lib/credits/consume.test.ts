import { test, expect } from 'vitest';
import { consumeCredits } from './consume';
import type { CreditAccount, CreditLedgerEntry } from '@/types/agents';

const account: CreditAccount = {
  id: 'credit-1',
  ownerId: 'agent-1',
  ownerType: 'agent',
  balance: 100,
  currency: 'credits',
  lowBalanceThreshold: 20,
  dailyLimit: 50,
  rules: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} satisfies CreditAccount;

const ledger: CreditLedgerEntry[] = [];

test('consumeCredits reduces balance and inserts ledger entry', () => {
  const { entry, account: acc } = consumeCredits(account, ledger, 10, { action: 'boost_24h', referenceType: 'listing', referenceId: 'listing-1' });
  expect(entry.amount).toBe(10);
  expect(acc.balance).toBe(90);
  expect(ledger[0].id).toBe(entry.id);
});

test('consumeCredits throws on insufficient balance', () => {
  const acc: CreditAccount = { ...account, balance: 5 };
  expect(() => consumeCredits(acc, ledger, 10, { action: 'boost_24h' })).toThrow('Insufficient balance');
});
