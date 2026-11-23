'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { useState } from 'react';
import { variationGroupValidationSchema } from '@/schemas/store/deliveries/product-management/product-customization.schema';
import type {
  Addon,
  EditProductVariationGroupFormValues,
  ProductCustomizationGroup,
  ProductVariationSettings,
} from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { NutritionAllergensField } from '@/components/shared/form/NutritionAllergensField';
import { AllergenNoteTranslations } from '@/components/store/deliveries/product-management/common/AllergenNoteTranslations';
import { NutritionFactTranslations } from '@/components/store/deliveries/product-management/common/NutritionFactTranslations';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import { cleanAllergens } from '@/lib/allergens';
import { resolveProductTaxRate } from '@/lib/tax-inclusive';
import { hasPersistedVariationOptions } from '@/lib/product-variation-options';
import { toVariationSettingsFormValues } from '@/lib/product-variation-settings';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';
import { useCurrency } from '@/hooks/use-currency';
import type { TaxRate } from '@/types/tax';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { CatalogTextTranslationsFields } from '@/components/store/deliveries/product-management/common/CatalogTextTranslationsFields';
import { ProductVariationTaxBreakdown } from '../ProductVariationTaxBreakdown';
import { VariationSettingsFields } from '../variation-settings/VariationSettingsFields';

interface VariationGroupDialogProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  initialGroup?: ProductCustomizationGroup | null;
  storeId?: string;
  taxRateId?: string | null;
  currentTaxRate?: TaxRate | null;
  productId?: string;
  /** Saved SKU, stock and add-ons of the variation being edited. */
  settings?: ProductVariationSettings | null;
  /** The product's add-on groups, so the chosen ones show by name. */
  knownAddons?: Addon[] | null;
  onSubmit: (values: EditProductVariationGroupFormValues) => Promise<void>;
}

export function VariationGroupDialog({
  open,
  onClose,
  isSubmitting,
  initialGroup,
  storeId,
  taxRateId,
  currentTaxRate,
  productId,
  settings,
  knownAddons,
  onSubmit,
}: VariationGroupDialogProps) {
  const tProducts = useTranslations('products');
  const tStep2 = useTranslations('products.addProduct.step2');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditMode = Boolean(initialGroup);
  const hasPricedOptions = hasPersistedVariationOptions(initialGroup);
  // A new variation gets its own stock and add-ons; an existing one only when
  // the product already keeps them per variation.
  const showSettings = !hasPricedOptions && (!isEditMode || Boolean(settings));
  const requireSku = isEditMode && Boolean(settings?.sku);
  const storeProfile = useGetStoreProfile(storeId ?? '');
  const productTaxRates = useTaxRates('product');
  const selectedTaxRate = resolveProductTaxRate(
    storeProfile.data?.basicInformation,
    productTaxRates.data ?? [],
    taxRateId,
    currentTaxRate,
  );

  const initialValues: EditProductVariationGroupFormValues = {
    name: initialGroup?.name || '',
    nameTranslations: initialGroup?.nameTranslations ?? {},
    ...(showSettings
      ? toVariationSettingsFormValues(settings, initialGroup?.sku)
      : { sku: initialGroup?.sku || '' }),
    price: String(initialGroup?.price ?? ''),
    image: initialGroup?.imageUrl || null,
    // Saved rows are normalised so every input starts as a string.
    nutritionFacts: cleanNutritionFacts(initialGroup?.nutritionFacts),
    allergens: cleanAllergens(initialGroup?.allergens),
  };

  const handleClose = () => {
    setApiError(null);
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      showDefaultFooter={false}
      size="2xl"
      title={isEditMode ? tProducts('actions.edit') : tStep2('addVariantTitle')}
    >
      <Formik
        // Remounted per variation and per opening, so the values are not
        // reinitialised while open: the product refetch between the two save
        // calls would otherwise wipe what was typed.
        key={`${initialGroup?.id ?? 'create'}-${open ? 'open' : 'closed'}`}
        initialValues={initialValues}
        validationSchema={variationGroupValidationSchema(tStep2, {
          requireImage: !isEditMode,
          requirePrice: !hasPricedOptions,
          requireSku,
          withStock: showSettings,
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setApiError(null);
          try {
            await onSubmit(values);
            handleClose();
          } catch (error) {
            if (error instanceof Error && error.message) {
              setApiError(error.message);
            } else {
              setApiError(tProducts('errors.fetchFailed'));
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, isSubmitting: isFormSubmitting, errors, touched }) => (
          <Form className="space-y-5">
            <AppInputField
              label={tStep2('nameLabel')}
              name="name"
              type="text"
              placeholder={tStep2('namePlaceholder')}
              requiredAsterisk
            />

            <CatalogTextTranslationsFields
              kind="variationName"
              sourceName="name"
              translationsName="nameTranslations"
            />

            {showSettings ? null : (
              <AppInputField
                label={tStep2('skuLabel')}
                name="sku"
                type="text"
                maxLength={100}
                placeholder={tStep2('skuPlaceholder')}
                helperText={tStep2('skuHelper')}
              />
            )}

            {!hasPricedOptions ? (
              <>
                <AppInputField
                  label={`${tStep2('priceLabel')} (${resolvedCurrencySymbol})`}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={tStep2('pricePlaceholder')}
                  prefix={<span className="font-semibold text-primary">{resolvedCurrencySymbol}</span>}
                  requiredAsterisk
                />
                <ProductVariationTaxBreakdown
                  price={values.price}
                  rate={selectedTaxRate}
                  currencySymbol={resolvedCurrencySymbol}
                />
              </>
            ) : null}

            {showSettings ? (
              <VariationSettingsFields
                storeId={storeId}
                productId={isEditMode ? productId : undefined}
                variationId={initialGroup?.id}
                requireSku={requireSku}
                disabled={isSubmitting || isFormSubmitting}
                knownAddons={knownAddons}
              />
            ) : null}

            <AppFileInput
              name="image"
              label={tStep2('imageLabel')}
              helperText={tStep2('imageHelper')}
              requiredAsterisk={!isEditMode}
              previewUrl={
                typeof initialValues.image === 'string'
                  ? initialValues.image
                  : undefined
              }
              maxSizeMB={5}
              acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
            />

            <NutritionAllergensField
              nutritionName="nutritionFacts"
              allergensName="allergens"
              disabled={isSubmitting || isFormSubmitting}
              renderAllergenExtras={(rowPath) => (
                <AllergenNoteTranslations
                  rowPath={rowPath}
                  disabled={isSubmitting || isFormSubmitting}
                />
              )}
              renderNutritionFactExtras={(factPath) => (
                <NutritionFactTranslations
                  factPath={factPath}
                  disabled={isSubmitting || isFormSubmitting}
                />
              )}
            />

            <FormErrorDisplay
              apiError={apiError}
              formikErrors={errors}
              touched={touched}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting || isFormSubmitting}
              >
                {tProducts('form.cancelButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting || isFormSubmitting}
                disabled={isSubmitting || isFormSubmitting}
              >
                {isEditMode
                  ? tStep2('updateVariationButton')
                  : tStep2('createVariationButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
