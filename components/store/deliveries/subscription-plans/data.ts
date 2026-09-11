export type StorePlan = {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  commission: number;
  freeOrders: string;
  isActive?: boolean;
  isRecommended?: boolean;
  highlighted?: boolean;
  ctaLabel: string;
  ctaDisabled?: boolean;
  groups: {
    title: string;
    items: { label: string; included: boolean }[];
  }[];
};

export type BillingHistoryItem = {
  id: string;
  invoice: string;
  date: string;
  plan: string;
  cycle: 'Monthly' | 'Yearly';
  method: string;
  amount: string;
  status: 'Paid' | 'Failed';
};

export const storePlans: StorePlan[] = [
  {
    id: 'default',
    name: 'Default Plan',
    subtitle: 'Get started with the essentials',
    monthlyPrice: 0,
    yearlyPrice: 0,
    commission: 20,
    freeOrders: '50',
    ctaLabel: 'Switch to Default Plan',
    groups: [
      {
        title: 'Promotions',
        items: [
          { label: 'Featured store placement', included: false },
          { label: 'Homepage promotion', included: false },
          { label: 'Homepage banner promotion', included: false },
          { label: 'Push notification campaigns', included: false },
          { label: 'Priority search ranking', included: false },
        ],
      },
      {
        title: 'Programs',
        items: [
          { label: 'Admin coupons allowed', included: false },
          { label: 'Loyalty program', included: false },
          { label: 'Referral campaigns', included: false },
        ],
      },
      {
        title: 'Support',
        items: [
          { label: 'Priority support', included: false },
          { label: 'Live chat support', included: false },
        ],
      },
    ],
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    subtitle: 'Get started with the essentials',
    monthlyPrice: 99,
    yearlyPrice: 999,
    commission: 10,
    freeOrders: '100',
    isActive: true,
    highlighted: true,
    ctaLabel: 'Current Plan',
    ctaDisabled: true,
    groups: [
      {
        title: 'Promotions',
        items: [
          { label: 'Featured store placement', included: true },
          { label: 'Homepage promotion', included: true },
          { label: 'Homepage banner promotion', included: true },
          { label: 'Push notification campaigns', included: true },
          { label: 'Priority search ranking', included: true },
        ],
      },
      {
        title: 'Programs',
        items: [
          { label: 'Admin coupons allowed', included: false },
          { label: 'Loyalty program', included: false },
          { label: 'Referral campaigns', included: false },
        ],
      },
      {
        title: 'Support',
        items: [
          { label: 'Priority support', included: false },
          { label: 'Live chat support', included: false },
        ],
      },
    ],
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    subtitle: 'Best for growing stores',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    commission: 5,
    freeOrders: '500',
    isRecommended: true,
    ctaLabel: 'Upgrade to Gold Plan',
    groups: [
      {
        title: 'Promotions',
        items: [
          { label: 'Featured store placement', included: true },
          { label: 'Homepage promotion', included: true },
          { label: 'Homepage banner promotion', included: true },
          { label: 'Push notification campaigns', included: true },
          { label: 'Priority search ranking', included: true },
        ],
      },
      {
        title: 'Programs',
        items: [
          { label: 'Admin coupons allowed', included: true },
          { label: 'Loyalty program', included: true },
          { label: 'Referral campaigns', included: true },
        ],
      },
      {
        title: 'Support',
        items: [
          { label: 'Priority support', included: false },
          { label: 'Live chat support', included: false },
        ],
      },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Plan',
    subtitle: 'Maximum reach for premium stores',
    monthlyPrice: 299,
    yearlyPrice: 2999,
    commission: 0,
    freeOrders: 'Unlimited',
    ctaLabel: 'Upgrade to Premium Plan',
    groups: [
      {
        title: 'Promotions',
        items: [
          { label: 'Featured store placement', included: true },
          { label: 'Homepage promotion', included: true },
          { label: 'Homepage banner promotion', included: true },
          { label: 'Push notification campaigns', included: true },
          { label: 'Priority search ranking', included: true },
        ],
      },
      {
        title: 'Programs',
        items: [
          { label: 'Admin coupons allowed', included: true },
          { label: 'Loyalty program', included: true },
          { label: 'Referral campaigns', included: true },
        ],
      },
      {
        title: 'Support',
        items: [
          { label: 'Priority support', included: true },
          { label: 'Live chat support', included: true },
        ],
      },
    ],
  },
];

export const billingHistoryRows: BillingHistoryItem[] = [
  {
    id: '1',
    invoice: 'INV-2026-0418',
    date: 'April 20, 2026',
    plan: 'Basic Plan',
    cycle: 'Monthly',
    method: 'Visa **** 4242',
    amount: '$108.90',
    status: 'Paid',
  },
  {
    id: '2',
    invoice: 'INV-2026-0417',
    date: 'March 20, 2026',
    plan: 'Basic Plan',
    cycle: 'Monthly',
    method: 'Visa **** 4242',
    amount: '$108.90',
    status: 'Failed',
  },
  {
    id: '3',
    invoice: 'INV-2026-0416',
    date: 'February 20, 2026',
    plan: 'Basic Plan',
    cycle: 'Monthly',
    method: 'Visa **** 4242',
    amount: '$108.90',
    status: 'Paid',
  },
  {
    id: '4',
    invoice: 'INV-2026-0415',
    date: 'January 20, 2026',
    plan: 'Default Plan',
    cycle: 'Monthly',
    method: 'Visa **** 4242',
    amount: '$0.00',
    status: 'Paid',
  },
];
