import type {
  Product,
  ProductCustomizationGroup,
} from '../../../entities/store/deliveries/product';
import type { SubCategory } from '../../../entities/store/deliveries/sub-category';
import type { MessageResponse } from '../../common';

export type ProductStockFilter = 'all' | 'instock' | 'outofstock';

export interface GetProductsQueryParams {
  store_id: string;
  page: number;
  limit: number;
  stock: ProductStockFilter;
  search?: string;
}

export interface GetProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductVariationPayload {
  name: string;
  price: number;
  image?: File;
}

export interface CreateProductPayload {
  store_id?: string;
  category_id: string;
  subcategory_id?: string;
  name: string;
  price: number;
  stock_quantity: number;
  description?: string;
  unit_of_measure?: string;
  image: File;
  images?: File[];
  variations: CreateProductVariationPayload[];
  addOns: string[];
  deal_ids?: string[];
  menu_ids?: string[];
}

export interface CreateProductResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    unitOfMeasure: string | null;
    stockQuantity: number;
    category_id: string;
    store_id: string;
    price: number;
    customization_group: string[];
    menu_ids?: string[] | null;
    description: string | null;
    imageUrl: string | null;
    images?: string[] | null;
    productImages?: string[] | null;
    shortDescription: string | null;
    id: string;
    inStock: boolean;
  };
}

export type GetProductResponse = Product;

export interface UpdateProductPayload {
  id: string;
  category_id: string;
  subcategory_id?: string;
  name: string;
  price: number;
  stock_quantity: number;
  description?: string;
  unit_of_measure?: string;
  image?: File | string | null;
  images?: Array<File | string> | null;
  prevImages?: string[];
  deal_ids?: string[];
  menu_ids?: string[];
}

export interface UpdateProductResponse {
  updated: {
    id: string;
    store_id: string;
    name: string;
    imageUrl: string | null;
    images?: string[] | null;
    productImages?: string[] | null;
    price: number;
  };
}

export type DeleteProductResponse = MessageResponse;

export interface ToggleProductInStockResponse {
  id: string;
  inStock: boolean;
}

export interface GetProductSubCategoryOptionsParams {
  // Keep both keys for compatibility across store and vendor modules.
  // Store flows send `storeId`; vendor flows send `vendorId`.
  storeId?: string;
  vendorId?: string;
  categoryId: string;
  offset: number;
  size: number;
  search?: string;
}

export interface GetProductSubCategoryOptionsResponse {
  data: SubCategory[];
  total: number;
  offset: number;
  size: number;
  hasMore: boolean;
}

export interface ProductCustomizationGroupsByType {
  variations: ProductCustomizationGroup[];
  addOns: ProductCustomizationGroup[];
}

export type ProductCustomizationGroupType = 'variation' | 'add-on';

export interface ProductCustomizationOptionDraft {
  title: string;
  price: number;
  description?: string;
  unitOfMeasure?: string;
  stockQuantity?: number;
}

export interface CreateProductCustomizationGroupPayload {
  productId: string;
  store_id: string;
  name: string;
  description?: string;
  requiredCheck?: boolean;
  selectionType?: 'single' | 'multi';
  price?: number;
  minSelect?: number;
  maxSelect?: number;
  status?: boolean;
  type: ProductCustomizationGroupType;
  dependsOnVariationId?: string;
  optionIds?: string[];
  newOptions?: ProductCustomizationOptionDraft[];
  variation_image?: File;
}

export interface UpdateProductCustomizationGroupPayload {
  id: string;
  productId?: string;
  store_id: string;
  name: string;
  description?: string;
  requiredCheck?: boolean;
  selectionType?: 'single' | 'multi';
  price?: number;
  minSelect?: number;
  maxSelect?: number;
  status?: boolean;
  type: ProductCustomizationGroupType;
  dependsOnVariationId?: string;
  optionIds?: string[];
  newOptions?: ProductCustomizationOptionDraft[];
  variation_image?: File;
}

export type CreateProductCustomizationGroupResponse = ProductCustomizationGroup;
export type UpdateProductCustomizationGroupResponse = ProductCustomizationGroup;
export type DeleteProductCustomizationGroupResponse = MessageResponse;

export interface DeleteProductCustomizationGroupPayload {
  id: string;
  productId?: string;
}

export type ProductBulkUploadImportMode = 'create' | 'update' | 'skip';

export interface BulkUploadProductsPayload {
  file: File;
  store_id: string;
  importMode?: ProductBulkUploadImportMode;
  autoCreateMasterData?: boolean;
}

export interface BulkUploadProductsResponse {
  jobId: string;
  message: string;
  totalRows: number;
  estimatedProducts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
