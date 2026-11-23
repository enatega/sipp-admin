import { DeliveryStore } from '@/types/entities/super-admin/enatega-deliveries/stores';

export interface GetVendorStoresQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  minRating?: string;
  shopTypeId?: string;
  zoneId?: string;
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}

export interface GetVendorStoresResponse {
  total: number;
  page: number;
  limit: number;
  data: DeliveryStore[];
}
