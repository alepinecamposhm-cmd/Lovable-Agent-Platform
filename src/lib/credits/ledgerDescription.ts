import type { CreditAction } from '@/types/agents';

export type LedgerDescriptionInput = {
  action: CreditAction | string;
  referenceType?: 'lead' | 'listing' | 'recharge' | 'refund' | string;
  leadName?: string;
  listingLabel?: string;
  paymentMethodLast4?: string;
};

export function formatLedgerDescription(input: LedgerDescriptionInput): string {
  const { action, referenceType, leadName, listingLabel, paymentMethodLast4 } = input;

  if (referenceType === 'recharge') {
    if (paymentMethodLast4) return `Compra vía tarjeta ****${paymentMethodLast4}`;
    return 'Compra de créditos';
  }

  if (action === 'lead_premium') return `Lead premium: ${leadName || '—'}`;
  if (action === 'lead_basic') return `Lead básico: ${leadName || '—'}`;
  if (action === 'boost_24h') return `Boost 24h: ${listingLabel || '—'}`;
  if (action === 'boost_7d') return `Boost 7 días: ${listingLabel || '—'}`;
  if (action === 'featured_listing') return `Listing destacado: ${listingLabel || '—'}`;
  if (action === 'verification_request') return `Solicitud de verificación: ${listingLabel || '—'}`;

  return `Acción: ${String(action)}`;
}

