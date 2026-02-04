import { test, expect } from 'vitest';
import { createInvoicePdf } from './pdf';

test('createInvoicePdf generates a valid PDF byte stream', async () => {
  const bytes = await createInvoicePdf({
    id: 'RCPT-TEST',
    amount: 90,
    credits: 100,
    paymentMethod: 'Visa ****4242',
    description: 'Paquete 100 créditos',
    createdAt: new Date('2026-02-04T10:00:00'),
  });

  expect(bytes.length).toBeGreaterThan(1024);
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  expect(header).toBe('%PDF-');
});

