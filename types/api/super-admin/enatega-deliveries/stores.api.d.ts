import { DeliveryStore } from '@/types/entities/super-admin/enatega-deliveries/stores';

/**
 * Query parameters for fetching stores
 */
export interface GetStoresQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  minRating?: string;
  shopTypeId?: string;
  zoneId?: string;
  startDate?: string;
  endDate?: string;
  modeScope?: string;
}

/**
 * Response type for fetching stores
 */
export interface GetDeliveryStoresResponse {
  total: number;
  page: number;
  limit: number;
  data: DeliveryStore[];
}


export interface GetSimpleStoresResponse {
  id: string;
  storename: string;
}
