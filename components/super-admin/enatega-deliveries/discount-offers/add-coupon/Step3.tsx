'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getStep3Schema } from '@/schemas/enatega-deliveries/discount-offer/discount-offer-schema';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Step3Data } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { useGetStoreProducts } from '@/hooks/api/store/deliveries/coupons';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';

export function Step3({
  initialData,
  onSubmit,
  onBack,
  hideStoreFields = false,
}: {
  initialData: Step3Data;
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  hideStoreFields?: boolean;
}) {
  const t = useTranslations('lumiFood.discountsOffers.addCoupon.step3');
  const tSchema = useTranslations('Schemas.discountOffer');
  const { data: storesData, isLoading } = useGetAllSimpleStores({
    refetchOnWindowFocus: false,
    enabled: !hideStoreFields,
  });

  const { storeId } = useParams();

  const { data: storeProductData, isLoading: storeProductLoading } =
    useGetStoreProducts(storeId as string, {
      enabled: hideStoreFields && !!storeId,
    });

  const productOptions = useMemo(() => {
    if (hideStoreFields) {
      return (
        storeProductData?.data?.map((product) => ({
          key: product.name,
          value: product.id,
        })) || []
      );
    }
  }, [storeProductData?.data, hideStoreFields]);

  const storeOptions = useMemo(() => {
    return (
      storesData?.map((store) => ({
        key: store.storename, // required
        value: store.id, // display text
      })) || []
    );
  }, [storesData]);

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <Formik
        enableReinitialize
        validationSchema={getStep3Schema(tSchema, hideStoreFields)}
        initialValues={initialData}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="flex flex-col gap-4">
            {hideStoreFields ? (
              <MultiSelect
                name="products"
                label={t('productsLabel')}
                options={productOptions ?? []}
                selected={values.products ?? []}
                onChange={(selectedKeys) => {
                  setFieldValue('products', selectedKeys);
                }}
                placeholder={
                  storeProductLoading
                    ? t('productsLoading')
                    : t('productsPlaceholder')
                }
                disabled={storeProductLoading}
                className="shadow-sm mt-1"
              />
            ) : (
              <MultiSelect
                name="stores"
                label={t('storesLabel')}
                options={storeOptions}
                selected={values.stores ?? []}
                onChange={(selectedKeys) => {
                  setFieldValue('stores', selectedKeys);
                }}
                placeholder={
                  isLoading ? t('storesLoading') : t('storesPlaceholder')
                }
                disabled={isLoading}
                className="shadow-sm mt-1"
              />
            )}

            <AppInputField
              name="usagePerUser"
              label={t('usagePerUserLabel')}
              placeholder={t('usagePerUserPlaceholder')}
              requiredAsterisk
              helperText={t('usagePerUserHelper')}
            />

            <div className="flex justify-end gap-3 mt-10">
              <AppButton variant="secondary" onClick={onBack}>
                {t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('saveNextButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
