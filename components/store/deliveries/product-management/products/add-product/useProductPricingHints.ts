import { findDealSummaryById } from '@/lib/deal-pricing';
import { resolveProductTaxRate } from '@/lib/tax-inclusive';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';

/** Tax rate and deal that the price hints of an add-product form are based on. */
export function useProductPricingHints(
  storeId: string | undefined,
  taxRateId: string | undefined,
  dealId: string | undefined,
) {
  const storeProfile = useGetStoreProfile(storeId ?? '');
  const productTaxRates = useTaxRates('product');
  const { data: activeDeals } = useGetActiveDeals(
    storeId ? { store_id: storeId, offset: 0, limit: 200 } : null,
    { enabled: !!storeId },
  );

  return {
    taxRate: resolveProductTaxRate(
      storeProfile.data?.basicInformation,
      productTaxRates.data ?? [],
      taxRateId,
    ),
    dealSummary: findDealSummaryById(activeDeals?.data, dealId),
  };
}
