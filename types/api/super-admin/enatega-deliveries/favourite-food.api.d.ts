import type { FavouriteFood } from '@/types';

export interface GetFavouriteFoodsResponse {
  data: FavouriteFood[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FavouriteFoodPayload {
  name: string;
  nameTranslations: Record<string, string>;
  shopTypeIds: string[];
  displayOrder: number;
  isActive: boolean;
  image?: File | null;
  removeImage?: boolean;
}
