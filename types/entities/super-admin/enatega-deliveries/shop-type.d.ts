export interface DeliveryShopType {
  id: string;
  name: string;
  image: string | null;
}

export interface BusinessType {
  id: string;
  code: string;
  displayName: string;
}

export interface ShopType {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  is_active: boolean;
  businessType: BusinessType;
}
