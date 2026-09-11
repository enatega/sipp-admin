export interface EnategaDeliveriesGetBannersQueryParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  modeScope?: string;
}

export type EnategaBannerActionType =
  | 'none'
  | 'store'
  | 'product'
  | 'shop_type';

export interface EnategaBannerStoreRef {
  id: string;
  address?: string | null;
  storeImage?: string | null;
  coverImage?: string | null;
  name?: string | null;
}

export interface EnategaBannerProductRef {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  storeId?: string | null;
}

export interface EnategaBannerShopTypeRef {
  id: string;
  name?: string | null;
  image?: string | null;
}

export interface EnategaDeliveriesBanner {
  id: string;
  title: string;
  description: string;
  actionType: EnategaBannerActionType | string;
  bannerImageLink?: string | null;
  bannerVideoLink?: string | null;
  relatedStore?: string | null;
  relatedProduct?: string | null;
  relatedShopType?: string | null;
  store?: EnategaBannerStoreRef | null;
  product?: EnategaBannerProductRef | null;
  shopType?: EnategaBannerShopTypeRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnategaDeliveriesGetBannersResponse {
  data: EnategaDeliveriesBanner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EnategaDeliveriesPostBannerPayload {
  title: string;
  description: string;
  action_type: EnategaBannerActionType;
  related_store?: string | null;
  related_product?: string | null;
  related_shop_type?: string | null;
  image?: File | null;
  video?: File | null;
}

export type EnategaDeliveriesPostBannerResponse = EnategaDeliveriesBanner;

export interface EnategaDeliveriesPatchBannerPayload {
  id: string;
  title?: string;
  description?: string;
  action_type?: EnategaBannerActionType;
  related_store?: string | null;
  related_product?: string | null;
  related_shop_type?: string | null;
  image?: File | null;
  video?: File | null;
}

export type EnategaDeliveriesPatchBannerResponse = EnategaDeliveriesBanner;

export interface EnategaDeliveriesDeleteBannerResponse {
  message: string;
}

export interface EnategaDeliveriesBannerDropdownQueryParams {
  offset?: number;
  limit?: number;
  page?: number;
  search?: string;
  modeScope?: string;
}

export interface EnategaDeliveriesBannerDropdownItem {
  id: string;
  name: string;
}

export interface EnategaDeliveriesBannerDropdownResponse {
  data: EnategaDeliveriesBannerDropdownItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}
