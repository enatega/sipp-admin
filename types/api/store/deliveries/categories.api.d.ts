import type { AffectedRowsResponse } from '@/types/api/common';
import type { Category } from '@/types/entities/store/deliveries/category';

export interface AllAvailableCategory {
  id: string;
  categoryName: string;
}

export interface GetAllAvailableCategoriesResponse {
  categories: AllAvailableCategory[];
  total: number;
}

export interface GetAllAvailableCategoriesQueryParams {
  search?: string;
  includeInactive?: boolean;
}

export interface GetCategoriesQueryParams {
  page: number;
  limit: number;
  search?: string;
  storeId: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
  total: number;
  currentPage: number;
  totalPages: number;
  isEnd: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  image: File;
  storeId: string;
}

export type CreateCategoryResponse = Category;

export interface UpdateCategoryPayload {
  id: string;
  name: string;
  image?: File | string;
}

export type UpdateCategoryResponse = Category;

export interface ToggleCategoryResponse {
  message: string;
  category: Category;
}

export type DeleteCategoryResponse = AffectedRowsResponse;
