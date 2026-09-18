'use client';

import { Form, Formik } from 'formik';
import { dealFormValidationSchema } from '@/schemas/store/deliveries/product-management/deals.schema';
import type {
  DealDropdownProduct,
  DealDropdownVariation,
  DealFormValues,
} from '@/types';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppDateTimeInput } from '@/components/shared/form/AppDateTimeInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  calculateFinalDealPrice,
  toNumberOrNull,
} from '../table/dealDrawer.utils';
import ProductAsyncSelect from '../table/ProductAsyncSelect';
import VariationAsyncSelect from '../table/VariationAsyncSelect';

interface EditDealFormProps {
  storeId?: string;
  initialValues: DealFormValues;
  isSubmitLoading: boolean;
  selectedProduct?: DealDropdownProduct | null;
  selectedVariation?: DealDropdownVariation | null;
  onSubmit: (values: DealFormValues) => Promise<void>;
}

export default function EditDealForm({
  storeId,
  initialValues,
  isSubmitLoading,
  selectedProduct,
  selectedVariation,
  onSubmit,
}: EditDealFormProps) {
  const tForm = useTranslations('deals.form');
  const tDealType = useTranslations('deals.dealType');
  const tSchema = useTranslations('Schemas.deals');
  const { currencyCode, currencySymbol } = useCurrency();
  const resolvedCurrencyCode = currencyCode || 'CRC';
  const resolvedCurrencySymbol = currencySymbol || '$';
  const discountTypeOptions = [
    { key: tDealType('percentage'), value: 'percentage' },
    { key: tDealType('fixed'), value: 'fixed' },
  ];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={dealFormValidationSchema(tSchema)}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ dirty, isSubmitting, values }) => {
        const selectedVariationPrice = toNumberOrNull(
          selectedVariation?.id === values.variation
            ? selectedVariation?.price
            : null,
        );
        const discountValue =
          typeof values.discountValue === 'number'
            ? values.discountValue
            : Number(values.discountValue || 0);
        const finalPrice =
          selectedVariationPrice === null
            ? null
            : calculateFinalDealPrice(
                selectedVariationPrice,
                values.discountType,
                Number.isFinite(discountValue) ? discountValue : 0,
              );

        const discountPrefix =
          values.discountType === 'percentage' ? '%' : resolvedCurrencyCode;
        const discountInputPaddingClass =
          values.discountType === 'fixed' ? '!pl-20' : '!pl-10';

        return (
          <Form className="flex h-full flex-col">
            <SheetHeader className="mb-4 !p-0">
              <SheetTitle className="text-lg font-semibold">
                {tForm('editTitle')}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              <AppInputField
                name="dealName"
                label={tForm('dealNameLabel')}
                placeholder={tForm('dealNamePlaceholder')}
                requiredAsterisk
              />

              <ProductAsyncSelect
                name="product"
                storeId={storeId}
                label={tForm('productLabel')}
                placeholder={tForm('productPlaceholder')}
                disabled
                initialSelectedProduct={selectedProduct}
                currencySymbol={resolvedCurrencySymbol}
                requiredAsterisk
              />

              <VariationAsyncSelect
                name="variation"
                storeId={storeId}
                productId={values.product}
                label={tForm('variationLabel')}
                placeholder={tForm('variationPlaceholder')}
                disabled
                initialSelectedVariation={selectedVariation}
                currencySymbol={resolvedCurrencySymbol}
              />

              <AppSelect
                name="discountType"
                label={tForm('discountTypeLabel')}
                placeholder={tForm('discountTypePlaceholder')}
                options={discountTypeOptions}
                requiredAsterisk
              />

              <AppInputField
                name="discountValue"
                label={tForm('discountValueLabel')}
                placeholder={tForm('discountValuePlaceholder')}
                type="number"
                min="0"
                className={discountInputPaddingClass}
                prefix={
                  <span className="whitespace-nowrap font-semibold text-primary">
                    {discountPrefix}
                  </span>
                }
                requiredAsterisk
              />

              {selectedVariationPrice !== null && finalPrice !== null && (
                <p className="text-sm text-muted-foreground">
                  {tForm('variationPricePreview', {
                    name: selectedVariation?.name || '-',
                    base: formatCurrency(
                      selectedVariationPrice,
                      resolvedCurrencySymbol,
                    ),
                    final: formatCurrency(finalPrice, resolvedCurrencySymbol),
                  })}
                </p>
              )}

              <div className="grid grid-cols-1 gap-3">
                <AppDateTimeInput
                  name="startDate"
                  label={tForm('startDateLabel')}
                  requiredAsterisk
                />
                <AppDateTimeInput
                  name="endDate"
                  label={tForm('endDateLabel')}
                  requiredAsterisk
                />
              </div>

              <AppSwitch name="status" label={tForm('statusLabel')} />
            </div>

            <SheetFooter className="mt-auto pt-4">
              <div className="flex w-full items-end justify-end">
                <AppButton
                  type="submit"
                  disabled={!dirty || isSubmitLoading}
                  isLoading={isSubmitting || isSubmitLoading}
                >
                  {tForm('updateSubmit')}
                </AppButton>
              </div>
            </SheetFooter>
          </Form>
        );
      }}
    </Formik>
  );
}
