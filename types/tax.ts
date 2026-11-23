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
  productDefaultTaxRateId?: string | null;
  productDefaultTaxRate?: TaxRate | null;
}

export interface StoreTaxAssignment {
  id: string;
  name: string;
  status: string;
  productTaxMode: 'store_rate' | 'product_level';
  taxRate: Pick<TaxRate, 'id' | 'name' | 'rate' | 'isActive'> | null;
}

export interface StoreTaxAssignmentsResponse {
  items: StoreTaxAssignment[];
  total: number;
  modeTotal: number;
  page: number;
  limit: number;
  totalPages: number;
}
