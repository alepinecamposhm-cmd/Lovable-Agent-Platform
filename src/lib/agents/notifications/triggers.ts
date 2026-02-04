import { add, NotificationType } from './store';

export function triggerLeadAssigned(leadName: string, leadId?: string) {
  add({
    type: 'lead',
    title: 'Nuevo lead asignado',
    body: leadName ? `${leadName} está interesado` : 'Se asignó un nuevo lead',
    actionUrl: leadId ? `/agents/leads/${leadId}` : '/agents/leads',
  });
}

export function triggerNewMessage(from: string, conversationId?: string) {
  add({
    type: 'message',
    title: 'Nuevo mensaje',
    body: `${from} te envió un mensaje`,
    actionUrl: conversationId ? `/agents/inbox/${conversationId}` : '/agents/inbox',
  });
}

export function triggerAppointment(title: string, when: string, appointmentId?: string) {
  add({
    type: 'appointment',
    title: 'Cita confirmada',
    body: `${title} · ${when}`,
    actionUrl: appointmentId ? `/agents/calendar?apt=${appointmentId}` : '/agents/calendar',
  });
}

export function triggerListingActivity(listingTitle: string, delta: string, listingId?: string) {
  add({
    type: 'listing',
    title: 'Actividad en listing',
    body: `${listingTitle}: ${delta}`,
    actionUrl: listingId ? `/agents/listings/${listingId}` : '/agents/listings',
  });
}

export function triggerCreditLow(balance: number) {
  add({
    type: 'credit',
    title: 'Saldo bajo',
    body: `Te quedan ${balance} créditos. Considera recargar.`,
    actionUrl: '/agents/credits?purchase=1',
  });
}
