'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { Addon } from '@/types';
import { ProductSkuField } from './ProductSkuField';
import { VariationAddonsField } from './VariationAddonsField';
import { VariationInStockField } from './VariationInStockField';
import { VariationStockField } from './VariationStockField';

interface Props {
  storeId?: string;
  /** Variation being edited; left out while adding a new one. */
  productId?: string;
  variationId?: string;
  /** An existing variation keeps a SKU once it has one. */
  requireSku?: boolean;
  disabled?: boolean;
  /** Add-on groups whose names are already known, so chosen ones show at once. */
  knownAddons?: Addon[] | null;
  /** Replaces the store add-on picker, e.g. with the vendor panel's own. */
  addonsField?: ReactNode;
}

/**
 * SKU, stock, in-stock switch and add-ons of one variation. Expects the Formik
 * fields `sku`, `stockQuantity`, `inStock` and `addOnIds`.
 */
export function VariationSettingsFields({
  storeId,
  productId,
  variationId,
  requireSku,
  disabled,
  knownAddons,
  addonsField,
}: Props) {
  const t = useTranslations('products.variationSettings');

  return (
    <>
      <ProductSkuField
        name="sku"
        label={t('skuLabel')}
        helperText={requireSku ? t('skuHelper') : t('skuAutoHelper')}
        requiredAsterisk={requireSku}
        disabled={disabled}
        storeId={storeId}
        scope="variation"
        productId={productId}
        variationId={variationId}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <VariationStockField name="stockQuantity" disabled={disabled} />
        <VariationInStockField name="inStock" disabled={disabled} />
      </div>

      {addonsField ?? (
        <VariationAddonsField
          name="addOnIds"
          storeId={storeId}
          disabled={disabled}
          knownAddons={knownAddons}
        />
      )}
    </>
  );
}
