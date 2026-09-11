export interface Deal extends Record<string, unknown> {
  id: string;
  dealName: string;
  product: string;
  productId?: string;
  productPrice?: number | null;
  variation: string;
  variationId?: string | null;
  isProductLevelDeal?: boolean;
  dealType: string;
  discountType?: 'percentage' | 'fixed';
  discount: number;
  variationPrice?: number | null;
  priceAfterDiscount?: number | null;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface DealFormValues {
  dealName: string;
  product: string;
  productId?: string;
  variation: string;
  variationId?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number | '';
  startDate: string;
  endDate: string;
  status: boolean;
}

export interface DealDropdownProduct extends Record<string, unknown> {
  id: string;
  name: string;
  price?: number | string | null;
}

export interface DealDropdownVariation extends Record<string, unknown> {
  id: string;
  name: string;
  price?: number | string | null;
}

export interface DealRecord extends Record<string, unknown> {
  id: string;
  dealName: string;
  productId: string;
  variationId: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DealDeleteResult extends Record<string, unknown> {
  message: string;
}
