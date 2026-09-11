import type { ProductStockFilter } from '../../store/deliveries/products.api';

export interface VendorDropdownOption extends Record<string, unknown> {
  id: string;
  name: string;
}

export interface VendorOffsetDropdownResponse extends Record<string, unknown> {
  data: VendorDropdownOption[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface VendorSubCategoryDropdownResponse
  extends Record<string, unknown> {
  subCategories: VendorDropdownOption[];
  total: number;
  currentPage: number;
  totalPages: number;
  isEnd: boolean;
}

export interface GetVendorChainProductsQueryParams {
  vendorId?: string;
  page: number;
  limit: number;
  search?: string;
  stock?: ProductStockFilter;
}

export interface VendorChainOption extends Record<string, unknown> {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number | string;
  unitOfMeasure: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface VendorChainOptionListResponse extends Record<string, unknown> {
  data: VendorChainOption[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface VendorChainOptionListParams {
  vendorId?: string;
  page: number;
  limit: number;
  search?: string;
}

export interface VendorChainOptionDropdownParams {
  vendorId?: string;
  store_id?: string;
  limit: number;
  page: number;
  search?: string;
}

export interface VendorChainOptionCreatePayload {
  vendorId?: string;
  title: string;
  description: string;
  price: number;
  unitOfMeasure: string;
  stockQuantity: number;
  isActive?: boolean;
}

export interface VendorChainOptionUpdatePayload {
  id: string;
  title: string;
  description: string;
  price: number;
  unitOfMeasure: string;
  stockQuantity: number;
  isActive?: boolean;
}

export interface VendorChainOptionDeleteResponse {
  message: string;
}
