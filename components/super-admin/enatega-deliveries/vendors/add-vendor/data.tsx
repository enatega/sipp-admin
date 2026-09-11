import type { VendorStep1Data, VendorStep2Data } from '@/contexts/super-admin/enatega-deliveries/vendors/vendor-form-context';

export const EMPTY_STEP1: VendorStep1Data = {
  name: '',
  email: '',
  phone: '',
  password: '',
  zone_id: '',
  autoGeneratePassword: false,
  mailLoginCredentials: false,
  changePasswordAllowed: false,
};

export const EMPTY_STEP2: VendorStep2Data = {
  logo: null,
  business_license_front: null,
  business_license_back: null,
  national_id_passport_front: null,
  national_id_passport_back: null,
};
