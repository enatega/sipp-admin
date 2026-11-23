import type { ActiveDealOption } from '@/types';

export type DealDiscountType = 'percentage' | 'fixed';
export type DealAppliesOn = 'product' | 'variation' | 'both';

export type DealSummary = {
  id: string;
  dealName: string;
  discountType: DealDiscountType;
  discountValue: number;
};

export type AppliedDealRef = {
  id: string;
  dealName: string;
  appliesOn: DealAppliesOn;
  productId?: string | null;
  variationId?: string | null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const normalizeDealDiscountType = (value: unknown): DealDiscountType => {
  return String(value).toLowerCase() === 'fixed' ? 'fixed' : 'percentage';
};

export const calculatePriceAfterDeal = (
  basePrice: number,
  deal: Pick<DealSummary, 'discountType' | 'discountValue'> | null | undefined,
): number | null => {
  if (!Number.isFinite(basePrice)) return null;
  if (!deal) return null;
  if (!Number.isFinite(deal.discountValue) || deal.discountValue <= 0) {
    return basePrice;
  }

  const finalPrice =
    deal.discountType === 'percentage'
      ? basePrice - (basePrice * deal.discountValue) / 100
      : basePrice - deal.discountValue;

  return Math.max(finalPrice, 0);
};

export const extractDealIdFromProduct = (product: Record<string, unknown>): string => {
  const dealIds = product.deal_ids;
  if (Array.isArray(dealIds) && typeof dealIds[0] === 'string') {
    return dealIds[0];
  }

  const dealIdsCamel = product.dealIds;
  if (Array.isArray(dealIdsCamel) && typeof dealIdsCamel[0] === 'string') {
    return dealIdsCamel[0];
  }

  const deals = product.deals;
  if (
    Array.isArray(deals) &&
    deals[0] &&
    typeof deals[0] === 'object' &&
    'id' in deals[0] &&
    typeof (deals[0] as { id?: unknown }).id === 'string'
  ) {
    return (deals[0] as { id: string }).id;
  }

  return '';
};

const normalizeDealAppliesOn = (value: unknown): DealAppliesOn => {
  const normalized = String(value).toLowerCase();
  if (normalized === 'product') return 'product';
  if (normalized === 'variation') return 'variation';
  return 'both';
};

export const extractAppliedDealsFromProduct = (
  product: Record<string, unknown>,
): AppliedDealRef[] => {
  const rawDeals = product.deals;
  if (!Array.isArray(rawDeals)) return [];

  return rawDeals
    .map((deal) => {
      if (!deal || typeof deal !== 'object') return null;
      const casted = deal as Record<string, unknown>;
      const id = typeof casted.id === 'string' ? casted.id : '';
      if (!id) return null;

      const dealNameRaw = casted.deal_name ?? casted.dealName;
      const appliesOnRaw = casted.applies_on ?? casted.appliesOn;
      const productIdRaw = casted.product_id ?? casted.productId;
      const variationIdRaw = casted.variation_id ?? casted.variationId;

      return {
        id,
        dealName:
          typeof dealNameRaw === 'string' && dealNameRaw.trim().length > 0
            ? dealNameRaw
            : id,
        appliesOn: normalizeDealAppliesOn(appliesOnRaw),
        productId: typeof productIdRaw === 'string' ? productIdRaw : null,
        variationId: typeof variationIdRaw === 'string' ? variationIdRaw : null,
      } as AppliedDealRef;
    })
    .filter((item): item is AppliedDealRef => item !== null);
};

export const extractDealSummaryFromProduct = (
  product: Record<string, unknown>,
): DealSummary | null => {
  const deals = product.deals;
  if (!Array.isArray(deals) || !deals[0] || typeof deals[0] !== 'object') {
    return null;
  }

  const firstDeal = deals[0] as Record<string, unknown>;
  const id = typeof firstDeal.id === 'string' ? firstDeal.id : '';
  if (!id) return null;

  const discountTypeRaw = firstDeal.discountType ?? firstDeal.discount_type;
  const discountValueRaw = firstDeal.discountValue ?? firstDeal.discount_value;
  const discountValue = toNumber(discountValueRaw);

  if (discountValue === null) return null;

  const dealNameRaw = firstDeal.deal_name ?? firstDeal.dealName;

  return {
    id,
    dealName:
      typeof dealNameRaw === 'string' && dealNameRaw.trim().length > 0
        ? dealNameRaw
        : id,
    discountType: normalizeDealDiscountType(discountTypeRaw),
    discountValue,
  };
};

export const findDealSummaryById = (
  deals: ActiveDealOption[] | undefined,
  dealId: string | undefined,
): DealSummary | null => {
  if (!dealId || !deals?.length) return null;

  const selectedDeal = deals.find((deal) => deal.id === dealId);
  if (!selectedDeal) return null;

  const discountValue = toNumber(
    selectedDeal.discountValue ?? selectedDeal.discount_value,
  );
  if (discountValue === null) return null;

  return {
    id: selectedDeal.id,
    dealName: selectedDeal.deal_name,
    discountType: normalizeDealDiscountType(
      selectedDeal.discountType ?? selectedDeal.discount_type,
    ),
    discountValue,
  };
};

export const buildDealSummaryIndex = (
  deals: ActiveDealOption[] | undefined,
): Map<string, DealSummary> => {
  const map = new Map<string, DealSummary>();
  (deals ?? []).forEach((deal) => {
    const summary = findDealSummaryById(deals, deal.id);
    if (summary) {
      map.set(deal.id, summary);
    }
  });
  return map;
};

export const resolveAppliedDealSummary = (
  appliedDeal: AppliedDealRef | null | undefined,
  summaryIndex: Map<string, DealSummary>,
): DealSummary | null => {
  if (!appliedDeal) return null;
  const summary = summaryIndex.get(appliedDeal.id);
  if (!summary) return null;
  return {
    ...summary,
    dealName: appliedDeal.dealName || summary.dealName,
  };
};

export const getProductAppliedDealRef = (
  appliedDeals: AppliedDealRef[],
): AppliedDealRef | null => {
  const directProductDeal = appliedDeals.find(
    (deal) => deal.appliesOn === 'product',
  );
  if (directProductDeal) return directProductDeal;

  const bothWithoutVariation = appliedDeals.find(
    (deal) => deal.appliesOn === 'both' && !deal.variationId,
  );
  if (bothWithoutVariation) return bothWithoutVariation;

  return null;
};

export const getVariationAppliedDealRef = (
  appliedDeals: AppliedDealRef[],
  variationId: string,
): AppliedDealRef | null => {
  if (!variationId) return null;

  const directVariationDeal = appliedDeals.find(
    (deal) =>
      deal.variationId === variationId &&
      (deal.appliesOn === 'variation' || deal.appliesOn === 'both'),
  );
  if (directVariationDeal) return directVariationDeal;

  const bothForAllVariations = appliedDeals.find(
    (deal) => deal.appliesOn === 'both' && !deal.variationId,
  );
  if (bothForAllVariations) return bothForAllVariations;

  return null;
};
