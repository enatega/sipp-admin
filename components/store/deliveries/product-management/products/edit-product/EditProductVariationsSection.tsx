'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import type {
  ProductCustomizationGroup,
  ProductCustomizationOption,
  ProductVariationSettings,
} from '@/types';
import type { AppliedDealRef, DealSummary } from '@/lib/deal-pricing';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import {
  calculatePriceAfterDeal,
  getVariationAppliedDealRef,
  resolveAppliedDealSummary,
} from '@/lib/deal-pricing';
import { formatCurrency } from '@/lib/formatCurrency';
import { hasPersistedVariationOptions } from '@/lib/product-variation-options';
import { findVariationSettings } from '@/lib/product-variation-settings';
import { AppButton } from '@/components/shared/AppButton';
import { VariationSettingsSummary } from '../variation-settings/VariationSettingsSummary';
import { CustomizationRowActions } from './CustomizationRowActions';

interface EditProductVariationsSectionProps {
  variations: ProductCustomizationGroup[];
  /** When given, each row also shows its SKU, stock and add-on count. */
  variationSettings?: ProductVariationSettings[];
  fallbackDealSummary?: DealSummary | null;
  appliedDeals?: AppliedDealRef[];
  dealSummaryIndex?: Map<string, DealSummary>;
  disabled?: boolean;
  addButtonLabel: string;
  editLabel: string;
  deleteLabel: string;
  onCreate: () => void;
  onEdit: (group: ProductCustomizationGroup) => void;
  onEditOption: (group: ProductCustomizationGroup, option: ProductCustomizationOption) => void;
  onDelete: (group: ProductCustomizationGroup) => void;
}

export function EditProductVariationsSection({
  variations,
  variationSettings,
  fallbackDealSummary,
  appliedDeals = [],
  dealSummaryIndex = new Map<string, DealSummary>(),
  disabled,
  addButtonLabel,
  editLabel,
  deleteLabel,
  onCreate,
  onEdit,
  onEditOption,
  onDelete,
}: EditProductVariationsSectionProps) {
  const tForm = useTranslations('products.form');
  const tDetailSections = useTranslations('products.detail.sections');
  const tDetailFields = useTranslations('products.detail.fields');
  const tDetailMessages = useTranslations('products.detail.messages');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const hasLegacyOptionVariations = variations.some(
    (variation) => variation.legacyMigrationMetadata?.legacyProductId
      && hasPersistedVariationOptions(variation),
  );

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tDetailSections('variations')}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{variations.length}</span>
          <AppButton
            type="button"
            variant="secondary"
            onClick={onCreate}
            leftIcon={<Plus className="size-4" />}
            disabled={disabled || Boolean(hasLegacyOptionVariations)}
          >
            {addButtonLabel}
          </AppButton>
        </div>
      </div>

      {variations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tDetailMessages('noVariations')}
        </p>
      ) : (
        <div className="space-y-3">
          {variations.map((variation) => {
            const isOptionBased = hasPersistedVariationOptions(variation);
            const isLegacyOptionBased = isOptionBased && Boolean(variation.legacyMigrationMetadata?.legacyProductId);
            const variationAppliedDeal = getVariationAppliedDealRef(
              appliedDeals,
              variation.id,
            );
            const variationDealSummary =
              resolveAppliedDealSummary(variationAppliedDeal, dealSummaryIndex) ||
              (appliedDeals.length === 0 ? fallbackDealSummary || null : null);
            const settings = findVariationSettings(variationSettings, variation.id);

            return (
            <div
              key={variation.id}
              className="relative rounded-xl border bg-light p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {!isLegacyOptionBased ? <div className="absolute right-3 top-3">
                <CustomizationRowActions
                  disabled={disabled}
                  editLabel={editLabel}
                  deleteLabel={deleteLabel}
                  onEdit={() => onEdit(variation)}
                  onDelete={() => onDelete(variation)}
                />
              </div> : null}

              {isOptionBased ? (
                <div className="md:col-span-3 space-y-3">
                  <div className="pr-10">
                    <p className="font-semibold text-foreground">{variation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tDetailMessages(isLegacyOptionBased ? 'legacySizePriceHint' : 'optionPriceHint')}
                    </p>
                  </div>
                  <div className="divide-y rounded-lg border bg-white">
                    {variation.options.map((option) => {
                      const optionSettings = findVariationSettings(variationSettings, option.id);

                      return (
                      <div key={option.id} className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{option.title}</p>
                          <p className="text-sm tabular-nums text-muted-foreground">
                            {formatCurrency(Number(option.price), resolvedCurrencySymbol)}
                          </p>
                          {optionSettings ? (
                            <VariationSettingsSummary settings={optionSettings} className="mt-1" />
                          ) : null}
                        </div>
                        <AppButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={disabled}
                          onClick={() => onEditOption(variation, option)}
                        >
                          {editLabel}
                        </AppButton>
                      </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {!isOptionBased ? <div>
                <p className="text-xs text-muted-foreground">
                  {tDetailFields('image')}
                </p>
                {variation.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={variation.imageUrl}
                    alt={variation.name}
                    className="mt-1 h-12 w-12 rounded-md border object-cover"
                  />
                ) : (
                  <div className="mt-1 h-12 w-12 rounded-md border bg-white flex items-center justify-center text-sm font-medium">
                    {variation.name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                )}
              </div> : null}

              {!isOptionBased ? <div>
                <p className="text-xs text-muted-foreground">
                  {tForm('nameLabel')}
                </p>
                <p className="font-medium">{variation.name}</p>
                {!settings && variation.sku ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {tDetailFields('sku')}: {variation.sku}
                  </p>
                ) : null}
                {variation.nutritionFacts?.length ? (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    {tDetailFields('nutritionFactsCount', { count: variation.nutritionFacts.length })}
                  </p>
                ) : null}
                {variation.allergens?.length ? (
                  <p className="mt-1 ms-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                    {tDetailFields('allergensCount', { count: variation.allergens.length })}
                  </p>
                ) : null}
              </div> : null}

              {!isOptionBased ? <div>
                <p className="text-xs text-muted-foreground">
                  {`Price (${resolvedCurrencySymbol})`}
                </p>
                <p className="font-medium">
                  {formatCurrency(Number(variation.price), resolvedCurrencySymbol)}
                </p>
                {variationDealSummary ? (
                  <p className="text-xs text-primary mt-1">
                    {tForm('priceAfterDealLabel')}:{' '}
                    {formatCurrency(
                      calculatePriceAfterDeal(
                        Number(variation.price),
                        variationDealSummary,
                      ) ?? Number(variation.price),
                      resolvedCurrencySymbol,
                    )}
                  </p>
                ) : null}
                {variationDealSummary ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {tDetailFields('appliedDeal')}: {variationDealSummary.dealName}
                  </p>
                ) : null}
              </div> : null}

              {!isOptionBased && settings ? (
                <VariationSettingsSummary
                  settings={settings}
                  className="md:col-span-3 border-t pt-3"
                />
              ) : null}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
