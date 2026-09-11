export type DeliveryLiveTrackingRiderStatus =
  | 'active'
  | 'busy'
  | 'offline'
  | string;

export interface DeliveryLiveTrackingActiveOrder {
  orderId: string;
  orderStatus: string;
  customerName: string;
  customerAddress: string;
  createdAt: string;
  scheduledAt: string | null;
  orderDetailsPath: string;
}

export interface DeliveryLiveTrackingRider {
  riderId: string;
  riderName: string;
  riderUserId?: string;
  riderImage: string;
  riderPhone: string;
  riderEmail?: string;
  status: DeliveryLiveTrackingRiderStatus;
  isOnline?: boolean;
  activeOrdersCount: number;
  rating: number;
  totalReviews: number;
  availabilityStatus?: string;
  riderStatus?: string;
  storeId?: string | null;
  storeName?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
  latitude: number | null;
  longitude: number | null;
  lastLocationUpdatedAt: string;
  lastLocationUpdatedLabel: string;
  activeOrder: DeliveryLiveTrackingActiveOrder | null;
}

export interface DeliveryLiveTrackingRiderDetail extends DeliveryLiveTrackingRider {
  riderUserId: string;
  riderEmail: string;
  isOnline: boolean;
  availabilityStatus: string;
  riderStatus: string;
  storeId: string | null;
  storeName: string | null;
  vendorId: string | null;
  vendorName: string | null;
}

export interface DeliveryLiveTrackingOverviewRider {
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderType: string;
  vehicleType: string;
  rating: number;
  totalReviews: number;
}

export interface DeliveryLiveTrackingOverviewActiveOrder {
  orderId: string;
  customerName: string;
  status: string;
  amount: number;
  paymentMethod: string;
  placedAt: string;
}

export interface DeliveryLiveTrackingOverviewRouteSnapshot {
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  lastLocationUpdatedLabel: string;
}

export interface DeliveryLiveTrackingMapMarker {
  riderId: string;
  riderName: string;
  riderImage: string;
  status: DeliveryLiveTrackingRiderStatus;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  totalReviews: number;
  activeOrder: DeliveryLiveTrackingActiveOrder | null;
}

export interface DeliveryLiveTrackingStatusCounts {
  all: number;
  active: number;
  busy: number;
  offline: number;
}
