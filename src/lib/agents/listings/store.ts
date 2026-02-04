import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';
import { mockListings, mockListingActivities } from '../fixtures';
import type { Listing, ListingActivityEvent } from '@/types/agents';

const LISTINGS_KEY = 'agenthub_listings';
const ACTIVITIES_KEY = 'agenthub_listing_activities';

const listeners = new Set<() => void>();

type StoredListing = Omit<
  Listing,
  'listedAt' | 'expiresAt' | 'featuredUntil' | 'soldAt' | 'createdAt' | 'updatedAt'
> & {
  listedAt?: string;
  expiresAt?: string;
  featuredUntil?: string;
  soldAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type StoredListingActivityEvent = Omit<ListingActivityEvent, 'createdAt'> & { createdAt?: string };

function hydrateListing(raw: StoredListing): Listing {
  return {
    ...raw,
    listedAt: raw.listedAt ? parseISO(raw.listedAt) : undefined,
    expiresAt: raw.expiresAt ? parseISO(raw.expiresAt) : undefined,
    featuredUntil: raw.featuredUntil ? parseISO(raw.featuredUntil) : undefined,
    soldAt: raw.soldAt ? parseISO(raw.soldAt) : undefined,
    createdAt: raw.createdAt ? parseISO(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? parseISO(raw.updatedAt) : new Date(),
  };
}

function hydrateActivity(raw: StoredListingActivityEvent): ListingActivityEvent {
  return {
    ...raw,
    createdAt: raw.createdAt ? parseISO(raw.createdAt) : new Date(),
  };
}

function loadListings(): Listing[] {
  if (typeof window === 'undefined') return mockListings;
  const raw = window.localStorage.getItem(LISTINGS_KEY);
  if (!raw) return mockListings;
  try {
    const parsed = JSON.parse(raw) as StoredListing[];
    return parsed.map(hydrateListing);
  } catch (e) {
    console.error('Failed to parse listings', e);
    return mockListings;
  }
}

function loadActivities(): ListingActivityEvent[] {
  if (typeof window === 'undefined') return mockListingActivities;
  const raw = window.localStorage.getItem(ACTIVITIES_KEY);
  if (!raw) return mockListingActivities;
  try {
    const parsed = JSON.parse(raw) as StoredListingActivityEvent[];
    return parsed.map(hydrateActivity);
  } catch (e) {
    console.error('Failed to parse listing activities', e);
    return mockListingActivities;
  }
}

function saveListings(data: Listing[]) {
  if (typeof window === 'undefined') return;
  const serializable = data.map((l) => ({
    ...l,
    listedAt: l.listedAt ? formatISO(l.listedAt) : undefined,
    expiresAt: l.expiresAt ? formatISO(l.expiresAt) : undefined,
    featuredUntil: l.featuredUntil ? formatISO(l.featuredUntil) : undefined,
    soldAt: l.soldAt ? formatISO(l.soldAt) : undefined,
    createdAt: formatISO(l.createdAt),
    updatedAt: formatISO(l.updatedAt),
  }));
  window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(serializable));
}

function saveActivities(data: ListingActivityEvent[]) {
  if (typeof window === 'undefined') return;
  const serializable = data.map((a) => ({
    ...a,
    createdAt: formatISO(a.createdAt),
  }));
  window.localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(serializable));
}

let listings = loadListings();
let activities = loadActivities();

function emit() {
  cachedSnapshot = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listListings() {
  return listings.slice().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function getListing(id: string) {
  return listings.find((l) => l.id === id);
}

export function addListing(input: Partial<Listing>) {
  const now = new Date();
  const id = `listing-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
  const listing: Listing = {
    id,
    agentId: input.agentId || 'agent-1',
    teamId: input.teamId,
    address: input.address!,
    propertyType: input.propertyType || 'apartment',
    listingType: input.listingType || 'sale',
    price: input.price || 0,
    currency: input.currency || 'MXN',
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    squareFeet: input.squareFeet,
    yearBuilt: input.yearBuilt,
    amenities: input.amenities || [],
    description: input.description || '',
    coverImage: input.coverImage,
    features: input.features,
    media: input.media || [],
    virtualTourUrl: input.virtualTourUrl,
    status: input.status || 'draft',
    verificationStatus: input.verificationStatus || 'none',
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    listedAt: input.listedAt,
    expiresAt: input.expiresAt,
    createdAt: now,
    updatedAt: now,
  } as Listing;
  listings = [listing, ...listings];
  saveListings(listings);
  emit();
  return listing;
}

export function updateListing(id: string, patch: Partial<Listing>) {
  let previous: Listing | undefined;
  listings = listings.map((l) => {
    if (l.id !== id) return l;
    previous = l;
    return { ...l, ...patch, updatedAt: new Date() } as Listing;
  });
  if (previous) {
    saveListings(listings);
    emit();
  }
  return previous;
}

export function addListingActivity(event: ListingActivityEvent) {
  activities = [event, ...activities];
  saveActivities(activities);
  emit();
}

export function listListingActivities(listingId: string) {
  return activities
    .filter((a) => a.listingId === listingId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

type ListingStoreSnapshot = { listings: Listing[]; activities: ListingActivityEvent[] };
type ListingStoreCachedSnapshot = {
  snapshot: ListingStoreSnapshot;
  _rawL: Listing[];
  _rawA: ListingActivityEvent[];
};
let cachedSnapshot: ListingStoreCachedSnapshot | null = null;

function getSnapshot() {
  if (!cachedSnapshot || cachedSnapshot._rawL !== listings || cachedSnapshot._rawA !== activities) {
    cachedSnapshot = {
      snapshot: { listings: listListings(), activities: activities.slice() },
      _rawL: listings,
      _rawA: activities,
    };
  }
  return cachedSnapshot.snapshot;
}

export function useListingStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
