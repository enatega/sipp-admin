export type RiderTrackingStatus = 'active' | 'busy' | 'offline';

export interface RiderActiveOrder {
  orderId: string;
  customerName: string;
  customerAddress: string;
  statusLabel: string;
  createdAt: string;
}

export interface RiderTrackingItem {
  id: string;
  riderName: string;
  riderAvatar: string;
  riderPhone: string;
  riderEmail?: string | null;
  riderRating: number;
  riderReviews: number;
  isOnline?: boolean | null;
  availabilityStatus?: string | null;
  riderStatus?: string | null;
  storeName?: string | null;
  vendorName?: string | null;
  trackingStatus: RiderTrackingStatus;
  lastUpdatedLabel: string;
  coords: {
    lat: number;
    lng: number;
  } | null;
  order: RiderActiveOrder | null;
}
