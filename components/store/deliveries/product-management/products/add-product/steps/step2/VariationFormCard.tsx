'use client';

import type { ReactNode } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Addon } from '@/types';
import type { DealSummary } from '@/lib/deal-pricing';
import { deriveVariationSku } from '@/lib/product-sku';
import type { TaxRate } from '@/types/tax';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { NutritionAllergensField } from '@/components/shared/form/NutritionAllergensField';
import { AllergenNoteTranslations } from '@/components/store/deliveries/product-management/common/AllergenNoteTranslations';
import { CatalogTextTranslationsFields } from '@/components/store/deliveries/product-management/common/CatalogTextTranslationsFields';
import { NutritionFactTranslations } from '@/components/store/deliveries/product-management/common/NutritionFactTranslations';
import { NewProductSkuField } from '../../../variation-settings/NewProductSkuField';
import { VariationAddonsField } from '../../../variation-settings/VariationAddonsField';
import { VariationStockField } from '../../../variation-settings/VariationStockField';
import { ProductPriceField } from '../../ProductPriceField';

interface Props {
  index: number;
  /** Store of the product: its add-on groups are offered and SKUs are checked there. */
  storeId?: string;
  /** Product SKU of step 1; an untouched variation SKU is `<product SKU>-<card number>`. */
  productSku?: string;
  /** Product SKU the server reserved for this form, if any. */
  suggestedProductSku?: string | null;
  disabled: boolean;
  taxRate?: TaxRate | null;
  dealSummary?: DealSummary | null;
  /** Add-on groups whose names are already known, so copied ones show at once. */
  knownAddons?: Addon[] | null;
  /** Omitted while this is the only variation. */
  onRemove?: () => void;
  /** Omitted on the first variation, or while it has no add-ons to copy. */
  onCopyAddons?: () => void;
  /** Replaces the store add-on picker, e.g. with the vendor panel's own. */
  addonsField?: ReactNode;
  /** Off where names and notes are not translated, e.g. the vendor panel. */
  showTranslations?: boolean;
  /** Off where no tax is shown with the price, e.g. the vendor panel. */
  showTaxBreakdown?: boolean;
}

/** One variation of the "Product with variations" form. */
export function VariationFormCard({
  index,
  storeId,
  productSku,
  suggestedProductSku,
  disabled,
  taxRate,
  dealSummary,
  knownAddons,
  onRemove,
  onCopyAddons,
  addonsField,
  showTranslations = true,
  showTaxBreakdown = true,
}: Props) {
  const t = useTranslations('products.addProduct.step2');
  const path = `variations.${index}`;

  return (
    <div className="rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {t('variantLabel')} {index + 1}
          </p>
          {index === 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t('baseVariationHint.badge')}
            </span>
          ) : null}
        </div>
        {onRemove ? (
          <AppButton
            type="button"
            variant="secondary"
            onClick={onRemove}
            disabled={disabled}
            leftIcon={<Trash2 className="size-4" />}
          >
            {t('deleteButton')}
          </AppButton>
        ) : null}
      </div>

      <AppInputField
        label={t('nameLabel')}
        name={`${path}.name`}
        type="text"
        placeholder={t('namePlaceholder')}
        requiredAsterisk
      />

      {showTranslations ? (
        <CatalogTextTranslationsFields
          kind="variationName"
          sourceName={`${path}.name`}
          translationsName={`${path}.nameTranslations`}
        />
      ) : null}

      <NewProductSkuField
        name={`${path}.sku`}
        scope="variation"
        storeId={storeId}
        prefilledSku={deriveVariationSku(productSku, index + 1)}
        trustedSku={deriveVariationSku(suggestedProductSku, index + 1)}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProductPriceField
          name={`${path}.price`}
          taxRate={taxRate}
          dealSummary={dealSummary}
          showTaxBreakdown={showTaxBreakdown}
        />
        <VariationStockField name={`${path}.stockQuantity`} disabled={disabled} />
      </div>

      <AppFileInput
        name={`${path}.image`}
        label={t('imageLabel')}
        helperText={t('imageHelper')}
        requiredAsterisk
        maxSizeMB={5}
        acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
      />

      <div className="space-y-2">
        {addonsField ?? (
          <VariationAddonsField
            name={`${path}.addOnIds`}
            storeId={storeId}
            disabled={disabled}
            knownAddons={knownAddons}
          />
        )}
        {index > 0 ? (
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCopyAddons}
            disabled={disabled || !onCopyAddons}
            leftIcon={<Copy className="size-4" />}
          >
            {t('copyAddonsButton')}
          </AppButton>
        ) : null}
      </div>

      <NutritionAllergensField
        nutritionName={`${path}.nutritionFacts`}
        allergensName={`${path}.allergens`}
        disabled={disabled}
        renderAllergenExtras={
          showTranslations
            ? (rowPath) => (
                <AllergenNoteTranslations rowPath={rowPath} disabled={disabled} />
              )
            : undefined
        }
        renderNutritionFactExtras={
          showTranslations
            ? (factPath) => (
                <NutritionFactTranslations factPath={factPath} disabled={disabled} />
              )
            : undefined
        }
      />
    </div>
  );
}
