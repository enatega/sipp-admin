'use client';
import {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';

export const EmptyStep1Data: Step1Data = {
  couponName: '',
  couponCode: '',
  couponDescription: '',
};
export const EmptyStep2Data: Step2Data = {
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maxDiscountCap: 0,
  minOrderValue: 0,
  totalUsageLimit: 0,
};

export const EmptyStep3Data: Step3Data = {
  stores: [],
  products: [],
  usagePerUser: 1,
};

export const EmptyStep4Data: Step4Data = {
  startDate: '',
  endDate: '',
  activeImmediately: false,
};

export const EmptyStep5Data: Step5Data = {
  paymentMethod: [] as string[],
  deliveryType: [] as string[],
  forNewUserOnly: false,
  forPremiumShopOnly: false,
  // premiumShop: '',
};

export const discountTypeValues = ['PERCENTAGE', 'FIXED'] as const;

// export const vendorsOptions = [
//     { key: 'Vendor 1', value: 'vendor1' },
//     { key: 'Vendor 2', value: 'vendor2' },
//     { key: 'Vendor 3', value: 'vendor3' },
// ]



// export const productsOptions = [
//     { key: 'Product 1', value: 'product1' },
//     { key: 'Product 2', value: 'product2' },
//     { key: 'Product 3', value: 'product3' },
// ]

export const paymentMethodValues = ['CARD', 'COD'] as const;

export const paymentMethodOptions = paymentMethodValues.map((value) => ({
  key: value,
  value,
}));

export const deliveryTypeValues = ['ALL', 'DELIVERY', 'PICKUP'] as const;

export const deliveryTypeOptions = deliveryTypeValues
  .filter((value) => value !== 'ALL')
  .map((value) => ({ key: value, value }));

export const premiumShopsOptions = [
  { key: 'Golden Spoon Foods', value: 'Golden Spoon Foods' },
  { key: 'Fresh Bite', value: 'Fresh Bite' },
  { key: 'Tasty Trails', value: 'Tasty Trails' },
  { key: 'Urban Harvest Catering', value: 'Urban Harvest Catering' },
  { key: 'Savory Station', value: 'Savory Station' },
];
