'use client';

import * as React from 'react';
import Image from 'next/image';
import { StoreFormStep2Schema } from '@/schemas/enatega-deliveries/stores/store-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import type { Step2Data } from '@/types/entities/super-admin/enatega-deliveries/store-form';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import { useGetAllShopTypesSimple } from '@/hooks/api/deliveries/shop-type';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { EMPTY_STEP2 } from './data';

interface SharedStep2FormProps {
  initialData: Step2Data | null;
  onSubmit: (data: Step2Data) => void;
  onBack: () => void;
  translationNamespace: string;
}

export const SharedStep2Form: React.FC<SharedStep2FormProps> = ({
  initialData,
  onSubmit,
  onBack,
  translationNamespace,
}) => {
  const t = useTranslations(`${translationNamespace}.step2`);
  const tErrors = useTranslations(`${translationNamespace}.step2.errors`);
  const tSchema = useTranslations('Schemas.storeForm');
  const { data: shopTypes, isLoading, isError, error, refetch } =
    useGetAllShopTypesSimple();

  const initialValues = React.useMemo<Step2Data>(
    () => initialData ?? EMPTY_STEP2,
    [initialData],
  );

  const handleSubmit = (values: Step2Data) => {
    onSubmit(values);
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={StoreFormStep2Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => {
          return (
            <Form className="space-y-6">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div className="w-16 h-4 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : isError ? (
                  <DisplayError
                    title={tErrors('fetchFailedTitle')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      tErrors('fetchFailed')
                    }
                    onRetry={refetch}
                  />
                ) : !shopTypes || shopTypes.length === 0 ? (
                  <NoDataFound title={tErrors('noShopTypes')} />
                ) : (
                  <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {shopTypes.map((shopType) => {
                      const isSelected = values.shopType === shopType.id;
                      return (
                        <button
                          key={shopType.id}
                          type="button"
                          onClick={() => {
                            setFieldValue('shopType', shopType.id);
                          }}
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                            isSelected
                              ? 'border-primary bg-primary text-white hover:bg-primary/90'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary/5',
                          )}
                        >
                          {shopType.image ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={shopType.image}
                                alt={shopType.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                'w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold transition-colors',
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-primary',
                              )}
                            >
                              {shopType.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-medium text-center">
                            {shopType.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={onBack}
                  className="px-8 h-10 rounded-[12px]"
                >
                  {t('backButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || isLoading || isError}
                  className="px-8 h-10 rounded-[12px]"
                >
                  {t('saveNextButton')}
                </AppButton>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
