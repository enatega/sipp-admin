'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { UNIT_OF_MEASURE_OPTIONS } from '@/constants/product-form.constants';
import type { Step1Data } from '@/contexts/store/deliveries/product-management/product-form-context';
import { useProductFormContext } from '@/contexts/store/deliveries/product-management/product-form-context';
import { productFormStep1Schema } from '@/schemas/store/deliveries/product-form';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import {
  calculatePriceAfterDeal,
  findDealSummaryById,
} from '@/lib/deal-pricing';
import { formatCurrency } from '@/lib/formatCurrency';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import { useCurrency } from '@/hooks/use-currency';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppMultiFileInput } from '@/components/shared/form/AppMultiFileInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import AddonsAsyncMultiSelect from '@/components/store/deliveries/product-management/common/AddonsAsyncMultiSelect';
import CategoryAsyncSelect from '@/components/store/deliveries/product-management/common/CategoryAsyncSelect';
import DealsAsyncMultiSelect from '@/components/store/deliveries/product-management/common/DealsAsyncMultiSelect';
import SubCategoryAsyncSelect from '@/components/store/deliveries/product-management/common/SubCategoryAsyncSelect';

const EMPTY_STEP1: Step1Data = {
  name: '',
  categoryId: '',
  subcategoryId: '',
  price: '',
  stockQuantity: '',
  addOnIds: [],
  dealId: '',
  unitOfMeasure: '',
  description: '',
  image: undefined,
  images: null,
};

const UNLIMITED_STOCK_VALUE = '2147483647';
const UNLIMITED_STOCK_THRESHOLD = 1000000;

export const Step1Form: React.FC = () => {
  const { nextStep, setStep1Data, formData } = useProductFormContext();
  const { storeId } = useParams() as { storeId?: string };
  const t = useTranslations('products.addProduct.step1');
  const tSchema = useTranslations();
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';

  const initialValues = React.useMemo<Step1Data>(
    () => formData.step1 ?? EMPTY_STEP1,
    [formData.step1],
  );

  const [isUnlimitedStock, setIsUnlimitedStock] = React.useState(
    Number(initialValues.stockQuantity || 0) >= UNLIMITED_STOCK_THRESHOLD,
  );

  React.useEffect(() => {
    setIsUnlimitedStock(
      Number(initialValues.stockQuantity || 0) >= UNLIMITED_STOCK_THRESHOLD,
    );
  }, [initialValues.stockQuantity]);
  const handleSubmit = (values: Step1Data) => {
    setStep1Data(values);
    nextStep();
  };

  return (
    <div className="md:min-w-[700px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={productFormStep1Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Step1Content
            isSubmitting={isSubmitting}
            values={values}
            storeId={storeId}
            t={t}
            resolvedCurrencySymbol={resolvedCurrencySymbol}
            isUnlimitedStock={isUnlimitedStock}
            setIsUnlimitedStock={setIsUnlimitedStock}
          />
        )}
      </Formik>
    </div>
  );
};

type Step1ContentProps = {
  isSubmitting: boolean;
  values: Step1Data;
  storeId?: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  resolvedCurrencySymbol: string;
  isUnlimitedStock: boolean;
  setIsUnlimitedStock: React.Dispatch<React.SetStateAction<boolean>>;
};

const Step1Content: React.FC<Step1ContentProps> = ({
  isSubmitting,
  values,
  storeId,
  t,
  resolvedCurrencySymbol,
  isUnlimitedStock,
  setIsUnlimitedStock,
}) => {
  const { setFieldValue } = useFormikContext<Step1Data>();
  const { data: activeDeals } = useGetActiveDeals(
    storeId
      ? {
          store_id: storeId,
          offset: 0,
          limit: 200,
        }
      : null,
    {
      enabled: !!storeId,
    },
  );

  const selectedDealSummary = findDealSummaryById(
    activeDeals?.data,
    values.dealId,
  );
  const basePrice = Number(values.price);
  const priceAfterDeal = calculatePriceAfterDeal(
    basePrice,
    selectedDealSummary,
  );

  return (
    <Form className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInputField
          label={t('nameLabel')}
          name="name"
          type="text"
          placeholder={t('namePlaceholder')}
          requiredAsterisk
        />

        <CategoryAsyncSelect
          label={t('categoryLabel')}
          name="categoryId"
          placeholder={t('categoryPlaceholder')}
          storeId={storeId}
          requiredAsterisk
        />

        <SubCategoryAsyncSelect
          label={t('subcategoryLabel')}
          name="subcategoryId"
          placeholder={t('subcategoryPlaceholder')}
          storeId={storeId}
          parentCategoryId={values.categoryId}
        />

        <AppInputField
          label={`${t('priceLabel')} (${resolvedCurrencySymbol})`}
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder={t('pricePlaceholder')}
          prefix={
            <span className="font-semibold text-primary">
              {resolvedCurrencySymbol}
            </span>
          }
          requiredAsterisk
        />

        <div className="space-y-2">
          <AppInputField
            label={t('stockQuantityLabel')}
            name="stockQuantity"
            type="number"
            min="0"
            placeholder={t('stockQuantityPlaceholder')}
            requiredAsterisk
            disabled={isUnlimitedStock}
            value={isUnlimitedStock ? '' : undefined}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Unlimited Stock</label>
            <Switch
              checked={isUnlimitedStock}
              onCheckedChange={(checked) => {
                setIsUnlimitedStock(checked);
                if (checked) {
                  setFieldValue('stockQuantity', UNLIMITED_STOCK_VALUE);
                  return;
                }
                if (
                  Number(values.stockQuantity || 0) >= UNLIMITED_STOCK_THRESHOLD
                ) {
                  setFieldValue('stockQuantity', '');
                }
              }}
            />
          </div>
        </div>

        <AppSelect
          label={t('unitOfMeasureLabel')}
          name="unitOfMeasure"
          placeholder={t('unitOfMeasurePlaceholder')}
          options={UNIT_OF_MEASURE_OPTIONS}
          showInputOnOtherSelect
        />

        <AddonsAsyncMultiSelect
          label={t('addonsLabel')}
          name="addOnIds"
          placeholder={t('addonsPlaceholder')}
          storeId={storeId}
        />

        <DealsAsyncMultiSelect
          label={t('dealsLabel')}
          name="dealId"
          placeholder={t('dealsPlaceholder')}
          storeId={storeId}
        />
      </div>

      {selectedDealSummary && Number.isFinite(basePrice) ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-medium text-foreground">
            {t('priceAfterDealLabel')}:{' '}
            {priceAfterDeal === null
              ? t('priceAfterDealNotAvailable')
              : formatCurrency(priceAfterDeal, resolvedCurrencySymbol)}
          </p>
          <p className="text-muted-foreground mt-1">
            {t('priceAfterDealDescription', {
              deal: selectedDealSummary.dealName,
            })}
          </p>
        </div>
      ) : null}

      <AppTextarea
        label={t('descriptionLabel')}
        name="description"
        placeholder={t('descriptionPlaceholder')}
        rows={4}
      />

      <AppMultiFileInput
        name="images"
        syncPrimaryFieldName="image"
        label={t('imageLabel')}
        helperText={t('imageHelper')}
        requiredAsterisk
        maxSizeMB={5}
        acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
      />

      <div className="flex items-end justify-end">
        <AppButton
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="px-12 h-10 rounded-[12px] mt-6"
        >
          {t('nextButton')}
        </AppButton>
      </div>
    </Form>
  );
};
