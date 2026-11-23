'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetStoreProducts } from '@/hooks/api/store/deliveries/coupons';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { AppInputField } from '@/components/shared/form/AppInput';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';

export function AppliedTo({
  hideStoreFields = false,
}: {
  hideStoreFields?: boolean;
}) {
  const t = useTranslations('lumiFood.discountsOffers.editCoupon.appliedTo');
  const { data: storesData, isLoading } = useGetAllSimpleStores({
    refetchOnWindowFocus: false,
    enabled: !hideStoreFields,
  });

  const { storeId } = useParams();

  const { data: productsData, isLoading: productsLoading } =
    useGetStoreProducts(storeId as string, {
      enabled: true,
    });

  const productsOptions = useMemo(() => {
    return (
      productsData?.data.map((product) => ({
        key: product.name, // required
        value: product.id, // display text
      })) || []
    );
  }, [productsData]);

  const storeOptions = useMemo(() => {
    return (
      storesData?.map((store) => ({
        key: store.storename, // required
        value: store.id, // display text
      })) || []
    );
  }, [storesData]);

  return (
    <div className="bg-white p-10 rounded-md shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>
      <div className="grid grid-cols-1  gap-7">
        {hideStoreFields ? (
          <MultiSelect
            name="products"
            label={t('productsLabel')}
            options={productsOptions}
            requiredAsterisk
            placeholder={
              productsLoading ? t('productsLoading') : t('productsPlaceholder')
            }
            className="shadow-sm mt-1"
          />
        ) : (
          <MultiSelect
            name="stores"
            label={t('storesLabel')}
            options={storeOptions}
            requiredAsterisk
            placeholder={
              isLoading ? t('storesLoading') : t('storesPlaceholder')
            }
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
      </div>
    </div>
  );
}
