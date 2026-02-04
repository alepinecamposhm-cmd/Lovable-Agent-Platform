import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

describe('listings store', () => {
  it('adds, updates and deletes a listing', async () => {
    const store = await import('./store');
    const listing = store.addListing({
      address: {
        street: 'Test 123',
        city: 'CDMX',
        state: 'CDMX',
        zip: '00000',
        country: 'México',
      },
      price: 1000000,
      currency: 'MXN',
      status: 'draft',
      verificationStatus: 'none',
      media: [{ id: 'm1', url: 'https://example.com/a.jpg', type: 'image', order: 1 }],
    });

    expect(store.getListing(listing.id)?.address.street).toBe('Test 123');

    store.updateListing(listing.id, { status: 'active' });
    expect(store.getListing(listing.id)?.status).toBe('active');

    const ok = store.deleteListing(listing.id);
    expect(ok).toBe(true);
    expect(store.getListing(listing.id)).toBeUndefined();
  });

  it('persists deletes to localStorage', async () => {
    const store1 = await import('./store');
    const listing = store1.addListing({
      address: {
        street: 'Persist 1',
        city: 'CDMX',
        state: 'CDMX',
        zip: '00000',
        country: 'México',
      },
      price: 500000,
      currency: 'MXN',
      status: 'draft',
      verificationStatus: 'none',
      media: [],
    });

    expect(store1.getListing(listing.id)).toBeTruthy();
    store1.deleteListing(listing.id);

    vi.resetModules();
    const store2 = await import('./store');
    expect(store2.getListing(listing.id)).toBeUndefined();
  });
});

