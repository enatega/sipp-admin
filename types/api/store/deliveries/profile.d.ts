// types/entities/super-admin/enatega-deliveries/store-profile.ts

import {
  AssociatedVendor,
  StoreTimingsPayload,
} from '@/types/entities/store/deliveries/store-profile';

export interface StoreProfileResponse {
  isLegacyMigrated?: boolean;
  profile: {
    image: string;
    name: string;
    email: string;
    rating: number;
    totalReviews: number;
    activeStatus: boolean;
    blockStatus: boolean;
    approvalStatus: string;
  };

  basicInformation: {
    productTaxMode?: 'store_rate' | 'product_level';
    taxRateId?: string | null;
    taxRate?: import('@/types/tax').TaxRate | null;
    productDefaultTaxRateId?: string | null;
    productDefaultTaxRate?: import('@/types/tax').TaxRate | null;
    storeId: string;
    vendor: AssociatedVendor;
    tagLine: string;
    minimumOrderValue: number;
    createdDate: string;
    city: string;
    zoneId: string;
    description: string;
  };

  contactInformation: {
    email: string;
    phoneNumber: string;
    showContactOnStorePage: boolean;
  };

  settings: {
    pickupAllowed: boolean;
    deliveryAllowed: boolean;
    cardPaymentAllowed: boolean;
    codPaymentAllowed: boolean;
  };

  additionalNotes: string;

  kycDocuments: {
    businessLicenseFront: string;
    businessLicenseBack: string;
    nationalIdFront: string;
    nationalIdBack: string;
    registeredStoreDocs: string;
    taxIdCertificate: string;
  };
}

export interface UpdateStoreSettingPayload {
  storeId: string;
  field: string;
  value: boolean;
}

export interface UpdateStoreSettingResponse {
  message: string;
  store_id: string;
  field: string;
  value: boolean;
}

export interface UpdateStoreDataPayload {
  storeId: string;
  storeName?: string;
  email?: string;
  phone?: string;
  storeImage?: string;
  coverImage?: string;
  address?: string;
  deliveryTime?: string;
  minimumOrder?: number;
  salesTax?: number;

  cuisines?: string[];
  keywords?: string[];

  latitude?: number;
  longitude?: number;

  tagLine?: string;
  description?: string;
  notes?: string;

  shopTypeId?: string;
  zoneId?: string;

  storeTimings?: StoreTimingsPayload;
  storeAvailable?: boolean;
  address_zone?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  branchCode?: string;

  businessLicenseFront?: string;
  businessLicenseBack?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  registeredStoreDocs?: string;
  taxIdCertificate?: string;
}

export interface UpdateStoreDataResponse {
  message: string;
  store_id: string;
}

// Block Status Response
export interface UpdateStoreBlockStatusResponse {
  message: string;
  store_id: string;
  block_status: boolean;
}

// Approval Status Payload
export interface UpdateStoreApprovalStatusPayload {
  storeId: string;
  status: 'approved' | 'rejected';
}

// Approval Status Response
export interface UpdateStoreApprovalStatusResponse {
  message: string;
  store_id: string;
  status: string;
}
