'use client';

import { useTranslations } from 'next-intl';
import type { ProductVariationSettings } from '@/types';
import { getVariationStockState } from '@/lib/product-variation-settings';
import { cn } from '@/lib/utils';

interface Props {
  settings: ProductVariationSettings;
  /** Names of the add-on groups offered with the variation; a count is shown without them. */
  addOnNames?: string[];
  /** Show the quantity and the in-stock state separately instead of one stock value. */
  showAvailability?: boolean;
  className?: string;
}

/** One line with a variation's SKU, stock and add-ons, for read-only lists. */
export function VariationSettingsSummary({
  settings,
  addOnNames,
  showAvailability,
  className,
}: Props) {
  const t = useTranslations('products.variationSettings');
  const stock = getVariationStockState(settings);
  const isOutOfStock = stock.kind === 'outOfStock';
  const quantityText =
    settings.stockQuantity === null ? t('unlimited') : String(settings.stockQuantity);
  const stockText = isOutOfStock && !showAvailability ? t('outOfStock') : quantityText;

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs', className)}>
      <span className="text-muted-foreground">
        {t('skuLabel')}:{' '}
        <span className="font-medium text-foreground">{settings.sku || '-'}</span>
      </span>
      <span className="text-muted-foreground">
        {t('stockLabel')}:{' '}
        <span
          className={cn(
            'font-medium',
            isOutOfStock && !showAvailability ? 'text-destructive' : 'text-foreground',
          )}
        >
          {stockText}
        </span>
      </span>
      {showAvailability ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-medium',
            isOutOfStock
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary',
          )}
        >
          {isOutOfStock ? t('outOfStock') : t('inStock')}
        </span>
      ) : null}
      <span className="text-muted-foreground">
        {addOnNames ? (
          <>
            {t('addonsLabel')}:{' '}
            <span className="font-medium text-foreground">
              {addOnNames.length ? addOnNames.join(', ') : t('noAddons')}
            </span>
          </>
        ) : (
          t('addonGroupsCount', { count: settings.addOnGroupIds.length })
        )}
      </span>
    </div>
  );
}
