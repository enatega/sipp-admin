import type { AffectedRowsResponse } from '@/types/api/common';
import type { Category, CategoryAvailabilityDay } from '@/types/entities/store/deliveries/category';

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
  nameTranslations?: Record<string, string>;
  image: File;
  storeId: string;
  scheduleAvailability: boolean;
  availabilityDays?: CategoryAvailabilityDay[];
}

export type CreateCategoryResponse = Category;

export interface UpdateCategoryPayload {
  id: string;
  name: string;
  nameTranslations?: Record<string, string>;
  image?: File | string;
  scheduleAvailability: boolean;
  availabilityDays?: CategoryAvailabilityDay[];
}

export type UpdateCategoryResponse = Category;

export interface ToggleCategoryResponse {
  message: string;
  category: Category;
}

export type DeleteCategoryResponse = AffectedRowsResponse;

/** Products still filed under a category (or its subcategories) block deleting it. */
export interface CategoryDeleteImpactResponse {
  productCount: number;
  subcategoryCount: number;
}
