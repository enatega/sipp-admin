import type { ZoneData } from '@/components/shared/maps/InteractiveMap';
import type { DayTimings, StoreTimings } from '@/shared/contracts/store';

export type StoreStatus =
  | 'active'
  | 'pending'
  | 'blocked'
  | 'deactivated'
  | 'approved'
  | 'rejected';
export type ShopType = 'restaurant' | 'grocery' | 'pharmacy' | 'convenience';
export type StoreType = 'dine_in' | 'takeaway' | 'delivery' | 'all';

export interface Store extends Record<string, unknown> {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  shopType: ShopType;
  storeType: StoreType;
  zoneId: string;
  zoneName: string;
  status: StoreStatus;
  isPublished: boolean;
  isAvailable: boolean;
  activeOrders: number;
  totalSales: number;
  rating: number;
}

export interface VendorStep1Data {
  name: string;
  phone: string;
  logo: File | null;
  banner: File | null;
  email: string;
  password?: string;
  autoGeneratePassword?: boolean;
  changePassword?: boolean;
  mailLoginCredentials?: boolean;
  zoneId: string;
  minimumOrderValue: string;
  tagLine: string;
  description: string;
  address: string;
}

export interface Step2Data {
  shopType: string;
}

export interface Step3Data {
  prepareTime: string;
  pickupAllowed: boolean;
  deliveryAllowed: boolean;
  scheduleBooking: boolean;
  baseFee: string;
  perKmFee: string;
  freeDeliveryThreshold: string;
  packingCharges: string;
}

export interface Step4Data {
  location: ZoneData | null;
  exactStoreLocation: { latitude: number; longitude: number } | null;
  storeTimings: StoreTimings;
}

export interface Step5Data {
  businessLicenseFront: File | null;
  businessLicenseBack: File | null;
  identityCardFront: File | null;
  identityCardBack: File | null;
  storeRegistrationDoc: File | null;
  taxCertificate: File | null;
}

export interface Step6Data {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchCode: string;
}

export interface StoreFormData {
  step1: VendorStep1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
  step5: Step5Data | null;
  step6: Step6Data | null;
}

export interface VendorStoreFormData {
  step1: VendorStep1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
  step5: Step5Data | null;
  step6: Step6Data | null;
}

export type { DayTimings, StoreTimings };
