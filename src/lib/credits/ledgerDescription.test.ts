import { test, expect } from 'vitest';
import { formatLedgerDescription } from './ledgerDescription';

test('formatLedgerDescription formats lead premium', () => {
  expect(formatLedgerDescription({ action: 'lead_premium', referenceType: 'lead', leadName: 'Juan Perez' })).toBe(
    'Lead premium: Juan Perez'
  );
});

test('formatLedgerDescription formats boost 7d', () => {
  expect(formatLedgerDescription({ action: 'boost_7d', referenceType: 'listing', listingLabel: 'Calle X' })).toBe(
    'Boost 7 días: Calle X'
  );
});

test('formatLedgerDescription formats recharge with last4', () => {
  expect(formatLedgerDescription({ action: 'purchase', referenceType: 'recharge', paymentMethodLast4: '4242' })).toBe(
    'Compra vía tarjeta ****4242'
  );
});

