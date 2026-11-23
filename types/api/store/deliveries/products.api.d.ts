import type {
  Product,
  ProductCustomizationGroup,
  ProductVariationSettings,
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
  nameTranslations?: Record<string, string>;
  sku?: string;
  price: number;
  image?: File;
  /** `null` = unlimited; a whole number = tracked stock (0 = out of stock). */
  stockQuantity?: number | null;
  inStock?: boolean;
  /** Add-on groups offered with this variation. */
  addOnIds?: string[];
  nutritionFacts?: import('@/lib/nutrition-facts').NutritionFact[];
  allergens?: import('@/lib/allergens').VariationAllergen[];
}

export interface CreateProductPayload {
  favouriteFoodIds?: string[];
  taxRateId?: string;
  store_id?: string;
  category_id: string;
  subcategory_id?: string;
  name: string;
  sku?: string;
  nameTranslations?: Record<string, string>;
  stock_quantity: number;
  description?: string;
  descriptionTranslations?: Record<string, string>;
  unit_of_measure?: string;
  image: File;
  images?: File[];
  variations: CreateProductVariationPayload[];
  addOns: string[];
  deal_ids?: string[];
  menu_ids?: string[];
}

/**
 * Store create flow: stock and add-ons are set on each variation, so the
 * product-level fields are left out. A SKU that is left out is generated.
 */
export type CreateStoreProductPayload = Omit<
  CreateProductPayload,
  'stock_quantity' | 'addOns'
> &
  Partial<Pick<CreateProductPayload, 'stock_quantity' | 'addOns'>>;

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
  favouriteFoodIds?: string[];
  useDefaultTax?: boolean;
  taxRateId?: string;
  id: string;
  category_id: string;
  subcategory_id?: string;
  name: string;
  sku?: string;
  nameTranslations?: Record<string, string>;
  price?: number;
  /** Left out for a product with variations; its stock lives on each variation. */
  stock_quantity?: number;
  description?: string;
  descriptionTranslations?: Record<string, string>;
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
    nameTranslations?: Record<string, string>;
    imageUrl: string | null;
    images?: string[] | null;
    productImages?: string[] | null;
    price: number;
  };
}

export interface TranslateProductTitleResponse {
  sourceLanguage: 'en';
  translations: Record<string, string>;
}

export type DeleteProductResponse = MessageResponse;

export interface ToggleProductInStockResponse {
  id: string;
  inStock: boolean;
}

export interface ToggleProductPublishedResponse {
  id: string;
  isPublished: boolean;
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
  nameTranslations?: Record<string, string>;
  description?: string;
  descriptionTranslations?: Record<string, string>;
  requiredCheck?: boolean;
  selectionType?: 'single' | 'multi';
  sku?: string;
  price?: number;
  minSelect?: number;
  maxSelect?: number;
  status?: boolean;
  type: ProductCustomizationGroupType;
  dependsOnVariationId?: string;
  optionIds?: string[];
  newOptions?: ProductCustomizationOptionDraft[];
  variation_image?: File;
  /** New variation only. `null` = unlimited stock. */
  stockQuantity?: number | null;
  inStock?: boolean;
  addOnIds?: string[];
}

export interface UpdateProductCustomizationGroupPayload {
  id: string;
  productId?: string;
  store_id: string;
  name: string;
  nameTranslations?: Record<string, string>;
  description?: string;
  descriptionTranslations?: Record<string, string>;
  requiredCheck?: boolean;
  selectionType?: 'single' | 'multi';
  sku?: string;
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

export interface UpdateProductVariationSettingsPayload {
  productId: string;
  /** Variation group id, or the option id of a migrated variation. */
  variationId: string;
  sku?: string;
  /** `null` = unlimited. */
  stockQuantity?: number | null;
  inStock?: boolean;
  addOnIds?: string[];
}

export type UpdateProductVariationSettingsResponse = ProductVariationSettings;

export type ProductSkuScope = 'product' | 'variation';

export interface ProductSkuAvailabilityParams {
  store_id: string;
  sku: string;
  scope: ProductSkuScope;
  /** Record being edited, so its own SKU does not count as taken. */
  productId?: string;
  variationId?: string;
}

export interface ProductSkuAvailabilityResponse {
  sku: string;
  available: boolean;
}

export interface ProductSkuSuggestionParams {
  /** Left out, the server uses the store of a store login. */
  store_id?: string;
}

/** Next free product SKU of the store; the number is reserved by the call. */
export interface ProductSkuSuggestionResponse {
  sku: string;
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
  status: 'pending';
}

export interface BulkUploadProductsResult {
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
  totalVariations: number;
  totalAddOnGroups: number;
  totalAddOnOptions: number;
  categoriesCreated: number;
  subcategoriesCreated: number;
  errors: Array<{
    rowNumber: number;
    productSku: string;
    errorMessage: string;
  }>;
}

export interface BulkUploadProductsStatusResponse {
  jobId: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress?: number;
  result?: BulkUploadProductsResult;
  error?: string;
  createdAt: number;
  processedAt?: number;
  finishedAt?: number;
}
