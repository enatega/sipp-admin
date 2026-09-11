export interface VendorStoreTableItem extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  address: string;
  logo: string | null;
  shopTypeId: string;
  shopTypeName: string;
  zoneName: string;
  status: string;
  isAvailable: boolean;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
  activeOrders: number;
  totalOrders: number;
  rating: number;
}
