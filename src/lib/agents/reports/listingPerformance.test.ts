import { describe, it, expect } from 'vitest';
import type { Listing, ListingActivityEvent } from '@/types/agents';
import { buildListingPerformance } from './listingPerformance';

describe('listingPerformance', () => {
  it('counts inquiry events within period and maps to listings', () => {
    const listings: Listing[] = [
      {
        id: 'listing-1',
        agentId: 'agent-1',
        address: { street: 'Av. Uno', city: 'CDMX', state: 'CDMX', zip: '01000', country: 'MX' },
      } as Listing,
      {
        id: 'listing-2',
        agentId: 'agent-1',
        address: { street: 'Calle Dos', city: 'CDMX', state: 'CDMX', zip: '02000', country: 'MX' },
      } as Listing,
    ];

    const activities: ListingActivityEvent[] = [
      { id: 'a1', listingId: 'listing-1', type: 'inquiry', metadata: {}, createdAt: new Date('2026-01-31T12:00:00Z') } as ListingActivityEvent,
      { id: 'a2', listingId: 'listing-1', type: 'view', metadata: {}, createdAt: new Date('2026-01-31T12:05:00Z') } as ListingActivityEvent,
      { id: 'a3', listingId: 'listing-1', type: 'inquiry', metadata: {}, createdAt: new Date('2026-01-20T12:00:00Z') } as ListingActivityEvent, // out of 7d
      { id: 'a4', listingId: 'listing-2', type: 'inquiry', metadata: {}, createdAt: new Date('2026-01-30T12:00:00Z') } as ListingActivityEvent,
      { id: 'a5', listingId: 'missing', type: 'inquiry', metadata: {}, createdAt: new Date('2026-01-30T12:00:00Z') } as ListingActivityEvent,
    ];

    const rows = buildListingPerformance(listings, activities, '7d', new Date('2026-02-01T00:00:00Z'));
    expect(rows).toEqual([
      { listingId: 'listing-1', addressLabel: 'Av. Uno, CDMX', zip: '01000', inquiries: 1 },
      { listingId: 'listing-2', addressLabel: 'Calle Dos, CDMX', zip: '02000', inquiries: 1 },
    ]);
  });
});

