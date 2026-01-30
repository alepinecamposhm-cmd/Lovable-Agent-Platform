import type { CreditAccount, CreditLedgerEntry } from '@/types/agents';

export type ConsumeResult = {
  entry: CreditLedgerEntry;
  account: CreditAccount;
};

export function consumeCredits(
  account: CreditAccount,
  ledger: CreditLedgerEntry[],
  amount: number,
  opts: { action: string; referenceType?: string; referenceId?: string; idempotencyKey?: string }
): ConsumeResult {
  if (amount <= 0) throw new Error('Invalid amount');

  if (account.balance < amount) throw new Error('Insufficient balance');

  const newBalance = account.balance - amount;
  const entry: CreditLedgerEntry = {
    id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountId: account.id,
    type: 'debit',
    amount,
    balance: newBalance,
    description: `${opts.action}: ${opts.referenceId ?? ''}`.trim(),
    referenceType: opts.referenceType,
    referenceId: opts.referenceId,
    createdAt: new Date(),
  } as CreditLedgerEntry;

  // Apply
  ledger.unshift(entry);
  account.balance = newBalance;
  account.updatedAt = new Date();

  return { entry, account };
}
