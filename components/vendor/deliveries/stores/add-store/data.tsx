import type { VendorStep1Data } from '@/types/entities/vendor/store';

// Import shared data for Step2-6
export {
  EMPTY_STEP2,
  shopTypes,
  getEmptyStep3,
  days,
  getEmptyStep5,
  Step5Lables,
  emptyStep6Data,
} from '@/components/shared/enatega-deliveries/stores/add-store';

// step 1 data - vendor specific (no vendorId field)

export const EMPTY_VENDOR_STEP1: VendorStep1Data = {
  name: '',
  phone: '',
  logo: null,
  banner: null,
  email: '',
  password: '',
  autoGeneratePassword: false,
  changePassword: true,
  mailLoginCredentials: true,
  zoneId: '',
  minimumOrderValue: '',
  tagLine: '',
  description: '',
  address: '',
};

// No vendor options needed for vendor - they are implicit

export const zoneOptions = [
  { key: 'Downtown', value: 'z1' },
  { key: 'Westside', value: 'z2' },
  { key: 'Suburbs', value: 'z3' },
];

export const minimumOrderOptions = [
  { key: '$0', value: '0' },
  { key: '$5', value: '5' },
  { key: '$10', value: '10' },
  { key: '$15', value: '15' },
  { key: '$20', value: '20' },
  { key: '$25', value: '25' },
  { key: '$50', value: '50' },
];
