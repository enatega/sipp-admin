import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step5Data,
  Step6Data,
} from '@/types/entities/super-admin/enatega-deliveries/store-form';

export const EMPTY_STEP1: Step1Data = {
  name: '',
  vendorId: '',
  phone: '',
  logo: null,
  banner: null,
  email: '',
  password: '',
  autoGeneratePassword: true,
  changePassword: true,
  mailLoginCredentials: true,
  zoneId: '',
  minimumOrderValue: '',
  tagLine: '',
  description: '',
  address: '',
};

export const EMPTY_STEP2: Step2Data = {
  shopType: '',
};

export const getEmptyStep3 = (): Step3Data => ({
  prepareTime: '',
  pickupAllowed: true,
  deliveryAllowed: true,
  scheduleBooking: true,
  baseFee: '',
  perKmFee: '',
  freeDeliveryThreshold: '',
  packingCharges: '',
});

export const getEmptyStep5 = (): Step5Data => ({
  businessLicenseFront: null,
  businessLicenseBack: null,
  identityCardFront: null,
  identityCardBack: null,
  storeRegistrationDoc: null,
  taxCertificate: null,
});

export const Step5Lables = [
  { name: 'businessLicenseFront', labelKey: 'businessLicenseFront' },
  { name: 'businessLicenseBack', labelKey: 'businessLicenseBack' },
  { name: 'identityCardFront', labelKey: 'identityCardFront' },
  { name: 'identityCardBack', labelKey: 'identityCardBack' },
  { name: 'storeRegistrationDoc', labelKey: 'storeRegistrationDoc' },
  { name: 'taxCertificate', labelKey: 'taxCertificate' },
];

export const emptyStep6Data: Step6Data = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  branchCode: '',
};
