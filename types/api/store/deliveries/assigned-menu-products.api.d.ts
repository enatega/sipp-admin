export interface StoreAssignedMenuProductApi extends Record<string, unknown> {
  id: string;
  image: string | null;
  name: string;
  category: string;
  categoryId: string;
  subcategoryId: string | null;
  subcategory: string | null;
  price: string | number;
  unitOfMeasure: string | null;
  stockQuantity: number;
  inStock: boolean;
  description: string | null;
  isActive: boolean;
}

export interface StoreAssignedMenuStoreSummary extends Record<string, unknown> {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  image: string | null;
}

export interface StoreAssignedMenuProductsMenu extends Record<string, unknown> {
  assignedStores: StoreAssignedMenuStoreSummary[];
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  availability: boolean;
  products: StoreAssignedMenuProductApi[];
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAssignedMenuProductsQueryParams {
  storeId: string;
  page: number;
  offset: number;
}

export interface GetAssignedMenuProductsSummary extends Record<string, unknown> {
  totalMenus: number;
  availableMenus: number;
  unavailableMenus: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
}

export interface GetAssignedMenuProductsResponse extends Record<string, unknown> {
  data: StoreAssignedMenuProductsMenu[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  summary: GetAssignedMenuProductsSummary;
}
