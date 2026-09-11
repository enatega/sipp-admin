export interface ChainMenuAssignedStore extends Record<string, unknown> {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  image: string;
}

export interface VendorChainMenu extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  assignedStores: ChainMenuAssignedStore[];
  totalProducts: number;
  availability: boolean;
}

export interface VendorChainMenuStore extends Record<string, unknown> {
  id: string;
  address: string;
  deliveryTime: string | null;
  minimumOrder: string | null;
  status: string;
  cuisines: string | null;
  storeImage: string | null;
  coverImage: string | null;
}

export interface VendorChainMenuStoreLink extends Record<string, unknown> {
  id: string;
  menuId: string;
  storeId: string;
  isActive: boolean;
  createdAt: string;
  store: {
    id: string;
    address: string;
    deliveryTime: string | null;
    minimumOrder: string | null;
    cuisines: string | null;
    storeImage: string | null;
  };
}

export interface CreateVendorChainMenuResponse extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  vendorId: string;
  menuStores: VendorChainMenuStoreLink[];
  vendor: {
    id: string;
    type: string;
    vendor_status: string;
  };
}
