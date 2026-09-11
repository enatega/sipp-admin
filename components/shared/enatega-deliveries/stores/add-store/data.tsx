import {
  Apple,
  Bath,
  Clock,
  Home,
  Pill,
  Pizza,
  Settings,
  Sparkles,
  SprayCan,
  Store,
  UtensilsCrossed,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import type {
  Step2Data,
  Step3Data,
  Step5Data,
  Step6Data,
} from '@/types/entities/vendor/store';
import { ShopTypeOption } from './types';

// step 1 shared data (zone and minimum order options)
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

// step 2 data
export const EMPTY_STEP2: Step2Data = {
  shopType: '',
};

export const shopTypes: ShopTypeOption[] = [
  {
    key: 'Restaurant',
    value: 'restaurant',
    icon: <Pizza className="size-6" />,
  },
  { key: 'Grocery', value: 'grocery', icon: <Apple className="size-6" /> },
  { key: 'Pharmacy', value: 'pharmacy', icon: <Pill className="size-6" /> },
  {
    key: 'Convenience',
    value: 'convenience',
    icon: <Store className="size-6" />,
  },
  {
    key: 'Bakery',
    value: 'bakery',
    icon: <UtensilsCrossed className="size-6" />,
  },
  {
    key: 'Electronics',
    value: 'electronics',
    icon: <Settings className="size-6" />,
  },
  { key: 'Plumber', value: 'plumber', icon: <Wrench className="size-6" /> },
  {
    key: 'Electrician',
    value: 'electrician',
    icon: <Zap className="size-6" />,
  },
  { key: 'AC Repair', value: 'ac_repair', icon: <Wind className="size-6" /> },
  {
    key: 'Window / Glass Cleaning',
    value: 'window_cleaning',
    icon: <SprayCan className="size-6" />,
  },
  {
    key: 'Home Maintenance',
    value: 'home_maintenance',
    icon: <Home className="size-6" />,
  },
  {
    key: 'Home Cleaning',
    value: 'home_cleaning',
    icon: <Sparkles className="size-6" />,
  },
  {
    key: 'Kitchen Cleaning',
    value: 'kitchen_cleaning',
    icon: <UtensilsCrossed className="size-6" />,
  },
  {
    key: 'Bathroom Cleaning',
    value: 'bathroom_cleaning',
    icon: <Bath className="size-6" />,
  },
  {
    key: 'Photography',
    value: 'photography',
    icon: <Clock className="size-6" />,
  },
];

// step 3 data

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

// step 4 data

export const days = [
  { id: '1', day: 'MON' },
  { id: '2', day: 'TUE' },
  { id: '3', day: 'WED' },
  { id: '4', day: 'THU' },
  { id: '5', day: 'FRI' },
  { id: '6', day: 'SAT' },
  { id: '7', day: 'SUN' },
];

// step 5 data

export const getEmptyStep5 = (): Step5Data => ({
  // Common
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

// step 6 data

export const emptyStep6Data: Step6Data = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  branchCode: '',
};
