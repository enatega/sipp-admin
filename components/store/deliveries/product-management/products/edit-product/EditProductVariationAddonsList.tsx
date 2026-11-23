'use client';

import type { ProductCustomizationGroup, ProductVariationSettings } from '@/types';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  getAddonVariationNames,
  type ProductVariationName,
} from '@/lib/product-variation-settings';
import { AppButton } from '@/components/shared/AppButton';

interface Props {
  addOns: ProductCustomizationGroup[];
  variationSettings: ProductVariationSettings[];
  variationNames: ProductVariationName[];
  disabled?: boolean;
  editLabel: string;
  onEdit: (group: ProductCustomizationGroup) => void;
}

/**
 * Add-on groups a product with variations uses, and the variations each one
 * is offered with. Which variation gets which group is chosen in the
 * variation itself; here a group's own name and options can be edited.
 */
export function EditProductVariationAddonsList({
  addOns,
  variationSettings,
  variationNames,
  disabled,
  editLabel,
  onEdit,
}: Props) {
  const tForm = useTranslations('products.form');
  const t = useTranslations('products.variationSettings');

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tForm('addonsLabel')}</h3>
        <span className="text-sm text-muted-foreground">{addOns.length}</span>
      </div>

      <p className="text-sm text-muted-foreground">{t('addonsListHint')}</p>

      {addOns.length === 0 ? null : (
        <div className="divide-y rounded-xl border bg-light">
          {addOns.map((addOn) => {
            const offeredWith = getAddonVariationNames(
              addOn.id,
              variationSettings,
              variationNames,
            );

            return (
              <div
                key={addOn.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium text-foreground">
                    {addOn.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('offeredWith')}:{' '}
                    <span className="text-foreground">
                      {offeredWith === null
                        ? t('allVariations')
                        : offeredWith.length
                          ? offeredWith.join(', ')
                          : t('noVariation')}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('optionsCount', { count: addOn.options.length })}
                  </p>
                </div>
                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                  disabled={disabled}
                  onClick={() => onEdit(addOn)}
                  leftIcon={<Pencil className="size-4" />}
                >
                  {editLabel}
                </AppButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
