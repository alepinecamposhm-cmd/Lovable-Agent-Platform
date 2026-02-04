import type { Listing, ListingActivityEvent } from '@/types/agents';
import { isWithinPeriod, type ReportsPeriod } from './period';

export interface ListingPerformanceRow {
  listingId: string;
  addressLabel: string;
  zip?: string;
  inquiries: number;
}

export function buildListingPerformance(
  listings: Listing[],
  activities: ListingActivityEvent[],
  period: ReportsPeriod,
  now: Date,
): ListingPerformanceRow[] {
  const inquiriesByListing = new Map<string, number>();

  for (const act of activities) {
    if (act.type !== 'inquiry') continue;
    if (!isWithinPeriod(act.createdAt, now, period)) continue;
    inquiriesByListing.set(act.listingId, (inquiriesByListing.get(act.listingId) ?? 0) + 1);
  }

  const listingById = new Map(listings.map((l) => [l.id, l] as const));
  const rows: ListingPerformanceRow[] = [];

  for (const [listingId, inquiries] of inquiriesByListing.entries()) {
    const listing = listingById.get(listingId);
    if (!listing) continue;
    const addressLabel = `${listing.address.street}${listing.address.unit ? ` ${listing.address.unit}` : ''}, ${listing.address.city}`;
    rows.push({ listingId, addressLabel, zip: listing.address.zip, inquiries });
  }

  return rows.sort((a, b) => b.inquiries - a.inquiries || a.addressLabel.localeCompare(b.addressLabel));
}

