import type { Role } from './types';

export function canViewBilling(role: Role): boolean {
  return role === 'admin' || role === 'leader';
}

export function canViewBillingSelf(role: Role): boolean {
  return role === 'agent';
}

export function canManagePaymentMethod(role: Role): boolean {
  return role === 'admin';
}

export function canIncreaseBudget(role: Role): boolean {
  return role === 'admin' || role === 'leader';
}

export function canDecreaseBudget(role: Role): boolean {
  return role === 'admin';
}
