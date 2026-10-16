'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';
import type { ProductCustomizationOption } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as Yup from 'yup';
import { resolveProductTaxRate } from '@/lib/tax-inclusive';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';
import { useCurrency } from '@/hooks/use-currency';
import type { TaxRate } from '@/types/tax';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField } from '@/components/shared/form/AppInput';
import { ProductVariationTaxBreakdown } from '../ProductVariationTaxBreakdown';

interface Props {
  option: ProductCustomizationOption | null;
  storeId?: string;
  taxRateId?: string | null;
  currentTaxRate?: TaxRate | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (price: number) => Promise<void>;
}

export function LegacyVariationPriceDialog({ option, storeId, taxRateId, currentTaxRate, isSaving, onClose, onSave }: Props) {
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

  return (
    <AppDialog
      open={Boolean(option)}
      onClose={onClose}
      title={option ? tMessages('editSizePriceTitle', { size: option.title }) : undefined}
      size="md"
      showDefaultFooter={false}
    >
      {option ? (
        <Formik
          key={option.id}
          initialValues={{ price: String(option.price) }}
          validationSchema={Yup.object({
            price: Yup.number()
              .typeError(tStep('errors.priceRequired'))
              .moreThan(0, tStep('errors.priceRequired'))
              .required(tStep('errors.priceRequired')),
          })}
          onSubmit={async (values, helpers) => {
            try {
              await onSave(Number(values.price));
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
