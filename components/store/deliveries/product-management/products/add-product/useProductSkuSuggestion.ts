import * as React from 'react';
import { useSuggestProductSku } from '@/hooks/api/store/deliveries/product-management/products';

interface Options {
  /** Store the product is added to. Left out, the server uses the store of the login. */
  storeId?: string;
  /** Hold the request back until this is true, e.g. until the store id is known. */
  enabled?: boolean;
}

/**
 * The product SKU an add-product form is prefilled with. The server reserves
 * a number on every call, so it is asked once and the answer is kept for as
 * long as the form is open. Stays `null` while loading and when the server
 * has no suggestion; the SKU is then created on save.
 */
export function useProductSkuSuggestion({ storeId, enabled = true }: Options = {}) {
  const { mutateAsync: suggestSku } = useSuggestProductSku();
  const [suggestedSku, setSuggestedSku] = React.useState<string | null>(null);
  const requested = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || requested.current) return;
    requested.current = true;
    suggestSku(storeId ? { store_id: storeId } : {})
      .then((result) => setSuggestedSku(result.sku?.trim() || null))
      .catch(() => {
        // No suggestion: the field stays blank and the SKU is created on save.
      });
  }, [enabled, storeId, suggestSku]);

  return suggestedSku;
}
