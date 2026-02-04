import { formatISO, parseISO } from 'date-fns';
import { useSyncExternalStore } from 'react';
import { mockListings, mockListingActivities } from '../fixtures';
import type { Listing, ListingActivityEvent } from '@/types/agents';

const LISTINGS_KEY = 'agenthub_listings';
const ACTIVITIES_KEY = 'agenthub_listing_activities';

const listeners = new Set<() => void>();

function hydrateListing(raw: unknown): Listing {
  const r = raw as Record<string, unknown>;
  return {
    ...(r as Listing),
    listedAt: r.listedAt ? parseISO(String(r.listedAt)) : undefined,
    expiresAt: r.expiresAt ? parseISO(String(r.expiresAt)) : undefined,
    featuredUntil: r.featuredUntil ? parseISO(String(r.featuredUntil)) : undefined,
    soldAt: r.soldAt ? parseISO(String(r.soldAt)) : undefined,
    verificationSubmittedAt: r.verificationSubmittedAt ? parseISO(String(r.verificationSubmittedAt)) : undefined,
    createdAt: r.createdAt ? parseISO(String(r.createdAt)) : new Date(),
    updatedAt: r.updatedAt ? parseISO(String(r.updatedAt)) : new Date(),
  };
}

function hydrateActivity(raw: unknown): ListingActivityEvent {
  const r = raw as Record<string, unknown>;
  return {
    ...(r as ListingActivityEvent),
    createdAt: r.createdAt ? parseISO(String(r.createdAt)) : new Date(),
  };
}

function loadListings(): Listing[] {
  if (typeof window === 'undefined') return mockListings;
  const raw = window.localStorage.getItem(LISTINGS_KEY);
  if (!raw) return mockListings;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return mockListings;
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
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return mockListingActivities;
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
    verificationSubmittedAt: l.verificationSubmittedAt ? formatISO(l.verificationSubmittedAt) : undefined,
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
    media: input.media || [],
    virtualTourUrl: input.virtualTourUrl,
    status: input.status || 'draft',
    archivedFromStatus: input.archivedFromStatus,
    verificationStatus: input.verificationStatus || 'none',
    verificationSubmittedAt: input.verificationSubmittedAt,
    verificationDocs: input.verificationDocs || [],
    verificationReviewNote: input.verificationReviewNote,
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    listedAt: input.listedAt,
    expiresAt: input.expiresAt,
    soldAt: input.soldAt,
    closedPrice: input.closedPrice,
    closedBuyerName: input.closedBuyerName,
    featuredUntil: input.featuredUntil,
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

export function deleteListing(id: string) {
  const before = listings.length;
  listings = listings.filter((l) => l.id !== id);
  if (listings.length !== before) {
    saveListings(listings);
    emit();
    return true;
  }
  return false;
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

type ListingStoreSnapshot = {
  listings: Listing[];
  activities: ListingActivityEvent[];
  _rawListings: Listing[];
  _rawActivities: ListingActivityEvent[];
};

let cachedSnapshot: ListingStoreSnapshot | null = null;

function getSnapshot() {
  if (!cachedSnapshot || cachedSnapshot._rawListings !== listings || cachedSnapshot._rawActivities !== activities) {
    cachedSnapshot = {
      listings: listListings(),
      activities: activities.slice(),
      _rawListings: listings,
      _rawActivities: activities,
    };
  }
  return cachedSnapshot;
}

export function useListingStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
