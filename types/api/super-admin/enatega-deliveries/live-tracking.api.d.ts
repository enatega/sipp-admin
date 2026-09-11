import {
  DeliveryLiveTrackingMapMarker,
  DeliveryLiveTrackingOverviewActiveOrder,
  DeliveryLiveTrackingOverviewRider,
  DeliveryLiveTrackingOverviewRouteSnapshot,
  DeliveryLiveTrackingRiderDetail,
  DeliveryLiveTrackingRider,
  DeliveryLiveTrackingStatusCounts,
} from '@/types/entities/super-admin/enatega-deliveries/live-tracking';

export interface GetDeliveryLiveTrackingRidersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  storeId?: string;
  vendorId?: string;
}

export interface GetDeliveryLiveTrackingRidersResponse {
  data: DeliveryLiveTrackingRider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  statusCounts: DeliveryLiveTrackingStatusCounts;
}

export interface GetDeliveryLiveTrackingRidersMapQueryParams {
  search?: string;
  status?: string;
  storeId?: string;
  vendorId?: string;
}

export interface GetDeliveryLiveTrackingRidersMapResponse {
  statusCounts: DeliveryLiveTrackingStatusCounts;
  totalRiders: number;
  totalMarkers: number;
  markers: DeliveryLiveTrackingMapMarker[];
}

export interface GetDeliveryLiveTrackingRiderDetailsResponse {
  rider: DeliveryLiveTrackingRiderDetail;
}

export interface GetDeliveryLiveTrackingRiderOverviewResponse {
  rider: DeliveryLiveTrackingOverviewRider;
  activeOrder: DeliveryLiveTrackingOverviewActiveOrder | null;
  routeSnapshot: DeliveryLiveTrackingOverviewRouteSnapshot | null;
}
