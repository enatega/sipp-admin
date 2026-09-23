// Global Commission Table Types
export interface GlobalCommissionData {
  id: string;
  city: string;
  defaultCommission: string;
  settlementCycle: string;
  shopTypeCommission: string;
  minimumPayout: string;
}

// Zone-Based Commission Table Types
export interface ZoneCommissionData {
  id: string;
  zone: string;
  defaultCommission: string;
  shopTypeCommission: string;
  minimumPayout: string;
  status: 'Active' | 'Inactive';
}


// Store Level Commission Table Types
export interface StoreCommissionData {
  id: string;
  storeName: string;
  vendor: string;
  zone: string;
  defaultCommission: string;
  commissionVatRate?: string;
  status: 'Active' | 'Inactive';

}
