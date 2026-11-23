import {
  CreateVendorChainMenuResponse,
  VendorChainMenu,
  VendorChainMenuStore,
} from '@/types/entities/vendor/deliveries/menu-template';

export interface GetVendorChainMenusQueryParams {
  page?: number;
  offset?: number;
  limit?: number;
  search?: string;
  filter?: string;
  isActive?: boolean;
  vendorId?: string;
}

export interface GetVendorChainMenusResponse {
  data: VendorChainMenu[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GetVendorChainMenuStoresQueryParams {
  page?: number;
  offset?: number;
  limit?: number;
  vendorId?: string;
}

export interface GetVendorChainMenuStoresResponse {
  data: VendorChainMenuStore[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreateVendorChainMenuPayload {
  name: string;
  description: string;
  image?: File | null;
  isActive?: boolean;
  vendorId: string;
  storeIds: string[];
}

export type CreateVendorChainMenuApiResponse = CreateVendorChainMenuResponse;

export interface UpdateVendorChainMenuPayload
  extends CreateVendorChainMenuPayload {
  menuId: string;
}
