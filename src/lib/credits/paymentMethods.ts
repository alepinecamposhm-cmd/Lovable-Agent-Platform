export type PaymentMethodId = 'card_4242' | 'card_5555';

export type PaymentMethod = {
  id: PaymentMethodId;
  brand: 'Visa' | 'Mastercard';
  last4: string;
  label: string; // e.g. "Visa ****4242"
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card_4242', brand: 'Visa', last4: '4242', label: 'Visa ****4242' },
  { id: 'card_5555', brand: 'Mastercard', last4: '5555', label: 'Mastercard ****5555' },
];

export function getPaymentMethod(id?: string | null): PaymentMethod {
  const match = PAYMENT_METHODS.find((m) => m.id === id);
  return match ?? PAYMENT_METHODS[0];
}

