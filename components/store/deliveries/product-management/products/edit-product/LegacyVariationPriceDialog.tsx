'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';
import {
  variationSkuSchema,
  variationStockSchema,
} from '@/schemas/store/deliveries/product-management/product-customization.schema';
import type {
  Addon,
  ProductCustomizationOption,
  ProductVariationSettings,
  ProductVariationSettingsFormValues,
} from '@/types';
import type { ReactNode } from 'react';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as Yup from 'yup';
import { toVariationSettingsFormValues } from '@/lib/product-variation-settings';
import { resolveProductTaxRate } from '@/lib/tax-inclusive';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';
import { useCurrency } from '@/hooks/use-currency';
import type { TaxRate } from '@/types/tax';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField } from '@/components/shared/form/AppInput';
import { ProductVariationTaxBreakdown } from '../ProductVariationTaxBreakdown';
import { VariationSettingsFields } from '../variation-settings/VariationSettingsFields';

interface Props {
  option: ProductCustomizationOption | null;
  storeId?: string;
  taxRateId?: string | null;
  currentTaxRate?: TaxRate | null;
  isSaving: boolean;
  onClose: () => void;
  /** `settings` is passed only when the dialog was given the saved `settings`. */
  onSave: (
    price: number,
    settings?: ProductVariationSettingsFormValues,
  ) => Promise<void>;
  productId?: string;
  /** Saved SKU, stock and add-ons of this size; adds those fields to the dialog. */
  settings?: ProductVariationSettings | null;
  /** The product's add-on groups, so the chosen ones show by name. */
  knownAddons?: Addon[] | null;
  /** Replaces the store add-on picker, e.g. with the vendor panel's own. */
  addonsField?: ReactNode;
  /** Store the SKU is checked in, when it is not `storeId` (vendor panel). */
  skuStoreId?: string;
}

export function LegacyVariationPriceDialog({
  option,
  storeId,
  taxRateId,
  currentTaxRate,
  isSaving,
  onClose,
  onSave,
  productId,
  settings,
  knownAddons,
  addonsField,
  skuStoreId,
}: Props) {
  const tStep = useTranslations('products.addProduct.step2');
  const tMessages = useTranslations('products.detail.messages');
  const { currencySymbol } = useCurrency();
  const symbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const storeProfile = useGetStoreProfile(storeId ?? '');
  const productTaxRates = useTaxRates('product');
  const selectedTaxRate = resolveProductTaxRate(
    storeProfile.data?.basicInformation,
    productTaxRates.data ?? [],
    taxRateId,
    currentTaxRate,
  );
  const requireSku = Boolean(settings?.sku);
  const title = !option
    ? undefined
    : settings
      ? tMessages('editSizeTitle', { size: option.title })
      : tMessages('editSizePriceTitle', { size: option.title });

  return (
    <AppDialog
      open={Boolean(option)}
      onClose={onClose}
      title={title}
      size={settings ? 'xl' : 'md'}
      showDefaultFooter={false}
    >
      {option ? (
        <Formik
          key={option.id}
          initialValues={{
            price: String(option.price),
            ...(settings ? toVariationSettingsFormValues(settings) : {}),
          }}
          validationSchema={Yup.object({
            price: Yup.number()
              .typeError(tStep('errors.priceRequired'))
              .moreThan(0, tStep('errors.priceRequired'))
              .required(tStep('errors.priceRequired')),
            ...(settings
              ? {
                  sku: variationSkuSchema(tStep, requireSku),
                  stockQuantity: variationStockSchema(tStep),
                }
              : {}),
          })}
          onSubmit={async (values, helpers) => {
            const { price, ...settingsValues } = values;
            try {
              await onSave(Number(price), settings ? settingsValues : undefined);
              onClose();
            } catch (error) {
              helpers.setStatus(error instanceof Error ? error.message : tMessages('sizePriceSaveError'));
            } finally {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status, values }) => (
            <Form className="space-y-4 p-6">
              <AppInputField
                label={`${tStep('priceLabel')} (${symbol})`}
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                requiredAsterisk
              />
              <ProductVariationTaxBreakdown
                price={values.price}
                rate={selectedTaxRate}
                currencySymbol={symbol}
              />
              {settings ? (
                <VariationSettingsFields
                  storeId={skuStoreId ?? storeId}
                  productId={productId}
                  variationId={option.id}
                  requireSku={requireSku}
                  disabled={isSubmitting || isSaving}
                  knownAddons={knownAddons}
                  addonsField={addonsField}
                />
              ) : null}
              {status ? <p role="alert" className="text-sm text-destructive">{status}</p> : null}
              <div className="flex justify-end gap-2">
                <AppButton type="button" variant="mute" onClick={onClose}>
                  {tStep('cancelButton')}
                </AppButton>
                <AppButton type="submit" isLoading={isSubmitting || isSaving}>
                  {tStep('saveButton')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
      ) : null}
    </AppDialog>
  );
}
