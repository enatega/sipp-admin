import type {
  DealDeleteResult,
  DealDropdownProduct,
  DealDropdownVariation,
  DealRecord,
} from '../../entities/store/deliveries/deal';

export interface RawVariation {
  id: string;
  name: string;
  price?: number | string | null;
}

export interface RawProduct {
  id: string;
  name: string;
  price?: number | string | null;
  variations?: RawVariation[];
}

export interface RawDeal {
  id: string;
  dealName: string;
  productId: string;
  variationId: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  product?: RawProduct;
}

export interface RawGetDealsResponse {
  data: RawDeal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface GetDealsQueryParams {
  page: number;
  limit: number;
  search?: string;
  productId?: string;
  discountType?: 'percentage' | 'fixed';
  isActive?: boolean;
}

export type GetDealsResponse = RawGetDealsResponse;

export interface GetDealDropdownProductsResponse {
  data: DealDropdownProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetDealDropdownProductsQueryParams {
  storeId: string;
  limit: number;
  offset: number;
  search?: string;
}

export interface GetDealDropdownVariationsResponse {
  data: DealDropdownVariation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetDealDropdownVariationsQueryParams {
  storeId: string;
  limit: number;
  offset: number;
  search?: string;
  productId: string;
}

export interface ActiveDealOption {
  id: string;
  deal_name: string;
  discountType?: 'percentage' | 'fixed' | string;
  discountValue?: number | string | null;
  discount_type?: 'percentage' | 'fixed' | string;
  discount_value?: number | string | null;
}

export interface GetActiveDealsQueryParams {
  store_id: string;
  offset?: number;
  limit?: number;
  search?: string;
}

export interface GetActiveDealsResponse {
  data: ActiveDealOption[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateDealPayload {
  dealName: string;
  productId: string;
  variationId?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type CreateDealResponse = DealRecord;

export type DeleteDealResponse = DealDeleteResult;

export interface UpdateDealPayload extends CreateDealPayload {
  id: string;
}

export interface UpdateDealResponse extends DealRecord {
  product?: RawProduct & {
    customization_group?: string[];
  };
}
