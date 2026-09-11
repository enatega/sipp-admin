export interface Category extends Record<string, unknown> {
  id: string;
  store_id: string;
  categoryName: string;
  imageURL?: string | null;
  parentId?: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  name: string;
  image?: File | string;
}
