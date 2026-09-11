import type { AffectedRowsResponse } from '@/types/api/common';
import type { Category } from '@/types/entities/store/deliveries/category';
import type { SubCategory } from '@/types/entities/store/deliveries/sub-category';

export interface GetSubCategoriesQueryParams {
  page: number;
  limit: number;
  search?: string;
  storeId: string;
}

export interface GetSubCategoriesResponse {
  subCategories: SubCategory[];
  total: number;
  currentPage: number;
  totalPages: number;
  isEnd: boolean;
}

export interface CreateSubCategoryPayload {
  name: string;
  categoryId: string;
  storeId: string;
  image?: File;
}

export type CreateSubCategoryResponse = SubCategory;

export interface UpdateSubCategoryPayload {
  id: string;
  name: string;
  categoryId: string;
  image?: File | string;
}

export type UpdateSubCategoryResponse = SubCategory;

export interface ToggleSubCategoryResponse {
  message: string;
  category: SubCategory;
}

export type DeleteSubCategoryResponse = AffectedRowsResponse;

export interface GetSubCategoryParentOptionsQueryParams {
  offset: number;
  size: number;
  search?: string;
  storeId: string;
}

export interface GetSubCategoryParentOptionsResponse {
  data: Category[];
  total: number;
  offset: number;
  size: number;
  hasMore: boolean;
}
