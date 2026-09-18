export type TaxScope = 'store' | 'product';
export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  scope: TaxScope;
  isActive: boolean;
  isDefault: boolean;
}
export interface TaxConfiguration {
  productTaxMode?: 'store_rate' | 'product_level';
  taxRateId?: string | null;
  taxRate?: TaxRate | null;
}
