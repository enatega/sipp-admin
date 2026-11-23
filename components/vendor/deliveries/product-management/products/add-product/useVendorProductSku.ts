import * as React from 'react';
import { getStoreProfileId } from '@/lib/user';
import { useProductSkuSuggestion } from '@/components/store/deliveries/product-management/products/add-product/useProductSkuSuggestion';

/**
 * SKU suggestion for the vendor (store chain) add-product forms. These
 * screens know the vendor but no store, so the server is asked without a
 * store id and answers for the store of the login. When it has no answer
 * (the login has no store of its own), the SKU field stays blank and the SKU
 * is created on save.
 *
 * `skuStoreId` is the store edited SKUs are checked in: the login's own
 * store, and only once the suggestion has shown the server accepts it.
 * Without it no check is made; saving still validates the SKU.
 */
export function useVendorProductSku() {
  const suggestedSku = useProductSkuSuggestion();
  const skuStoreId = React.useMemo(
    () => (suggestedSku ? (getStoreProfileId() ?? undefined) : undefined),
    [suggestedSku],
  );

  return { suggestedSku, skuStoreId };
}
