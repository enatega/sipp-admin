import type { Category } from './category';

export interface SubCategory extends Record<string, unknown> {
  id: string;
  store_id: string;
  categoryName: string;
  imageURL?: string | null;
  parentId?: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt?: string;
  parent?: Category | null;
}

export interface SubCategoryFormData {
  name: string;
  image?: File | string;
  categoryId: string;
}
