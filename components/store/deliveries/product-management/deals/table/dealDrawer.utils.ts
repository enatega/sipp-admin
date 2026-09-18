import type { Deal, DealFormValues } from '@/types';

export const DISCOUNT_TYPE_OPTIONS = [
  { key: 'Percentage', value: 'percentage' },
  { key: 'Fixed', value: 'fixed' },
] as const;

export const DEAL_DROPDOWN_PAGE_SIZE = 100;

export const EMPTY_DEAL_FORM_VALUES: DealFormValues = {
  dealName: '',
  product: '',
  variation: '',
  discountType: 'percentage',
  discountValue: '',
  startDate: '',
  endDate: '',
  status: true,
};

export const getDiscountTypeFromDealType = (
  dealType?: string,
): 'percentage' | 'fixed' =>
  dealType?.toLowerCase() === 'fixed' ? 'fixed' : 'percentage';

export const toNumberOrNull = (
  value?: string | number | null,
): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const calculateFinalDealPrice = (
  basePrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
): number => {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    return 0;
  }

  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return basePrice;
  }

  const finalPrice =
    discountType === 'percentage'
      ? basePrice - (basePrice * discountValue) / 100
      : basePrice - discountValue;

  return Math.max(finalPrice, 0);
};

export const getInitialValues = (deal: Deal): DealFormValues => ({
  dealName: deal.dealName,
  product: deal.productId || '',
  productId: deal.productId,
  variation: deal.variationId || '',
  variationId: deal.variationId,
  discountType:
    deal.discountType || getDiscountTypeFromDealType(deal.dealType),
  discountValue: deal.discount,
  startDate: deal.startDate || '',
  endDate: deal.endDate || '',
  status: deal.status === 'active',
});

export const buildApiPayload = (
  values: DealFormValues,
  variationId: string | null,
) => ({
  dealName: values.dealName.trim(),
  productId: values.product,
  variationId,
  discountType: values.discountType,
  discountValue: Number(values.discountValue),
  startDate: new Date(values.startDate).toISOString(),
  endDate: new Date(values.endDate).toISOString(),
  isActive: values.status,
});

export const getDiscountDisplayValue = (
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  currencyCode: string,
) => {
  const numericDiscount = Number.isFinite(discountValue) ? discountValue : 0;

  return discountType === 'percentage'
    ? `${numericDiscount}%`
    : `${currencyCode || 'CRC'} ${numericDiscount.toFixed(2)}`;
};
