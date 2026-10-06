'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { useEffect, useState } from 'react';
import { variationGroupValidationSchema } from '@/schemas/store/deliveries/product-management/product-customization.schema';
import type {
  EditProductVariationGroupFormValues,
  ProductCustomizationGroup,
} from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { resolveProductTaxRate } from '@/lib/tax-inclusive';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';
import { useCurrency } from '@/hooks/use-currency';
import type { TaxRate } from '@/types/tax';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { ProductVariationTaxBreakdown } from '../ProductVariationTaxBreakdown';

interface VariationGroupDialogProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  initialGroup?: ProductCustomizationGroup | null;
  storeId?: string;
  taxRateId?: string | null;
  currentTaxRate?: TaxRate | null;
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
  onSubmit,
}: VariationGroupDialogProps) {
  const tProducts = useTranslations('products');
  const tStep2 = useTranslations('products.addProduct.step2');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditMode = Boolean(initialGroup);
  const storeProfile = useGetStoreProfile(storeId ?? '');
  const productTaxRates = useTaxRates('product');
  const selectedTaxRate = resolveProductTaxRate(
    storeProfile.data?.basicInformation,
    productTaxRates.data ?? [],
    taxRateId,
    currentTaxRate,
  );

  useEffect(() => {
    if (open) {
      setApiError(null);
    }
  }, [open, initialGroup?.id]);

  const initialValues: EditProductVariationGroupFormValues = {
    name: initialGroup?.name || '',
    price: String(initialGroup?.price ?? ''),
    image: initialGroup?.imageUrl || null,
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
        key={`${initialGroup?.id ?? 'create'}-${open ? 'open' : 'closed'}`}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={variationGroupValidationSchema(tStep2, {
          requireImage: !isEditMode,
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
