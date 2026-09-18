import { StoreTimings } from '@/shared/contracts/store';

export interface ShopTypeOption {
  key: string;
  value: string;
  icon: React.ReactNode;
}

export interface shopTiming {
  id: string;
  day: string;
}

export interface VendorStore {
  id?: string;
  // Basic Information (NO vendorId - it's implicit)
  name: string;
  phone: string;
  email: string;
  password?: string;
  autoGeneratePassword?: boolean;
  changePassword?: boolean;
  mailLoginCredentials?: boolean;
  logo: File | string | null;
  banner: File | string | null;
  zoneId: string;
  minimumOrderValue?: string;
  tagLine: string;
  description: string;
  address: string;

  // Shop Type
  shopType: string;
  productTaxMode?: 'store_rate' | 'product_level';
  taxRateId?: string;
  storeType: string;

  // Store Timings
  storeTimings: StoreTimings;

  // Store Operation
  prepareTime: string;
  packingCharges: string;
  scheduleBooking: boolean;
  pickupAllowed: boolean;
  deliveryAllowed: boolean;
  baseFee: string;
  perKmFee: string;
  freeDeliveryThreshold: string;

  // Location
  location: {
    type: 'circle' | 'polygon' | 'polyline' | 'marker' | null;
    center?: { lat: number; lng: number };
    radius?: number;
    path?: { lat: number; lng: number }[];
  } | null;

  // Bank Details
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchCode: string;

  // Documents
  businessLicenseFront?: File | string | null;
  businessLicenseBack?: File | string | null;
  identityCardFront?: File | string | null;
  identityCardBack?: File | string | null;
  storeRegistrationDoc?: File | string | null;
  taxCertificate?: File | string | null;
}
