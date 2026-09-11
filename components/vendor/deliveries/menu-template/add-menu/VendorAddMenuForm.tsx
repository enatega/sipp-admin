'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createMenuValidationSchema } from '@/schemas/enatega-deliveries/vendor/menu-template';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import {
  useCreateVendorChainMenu,
  useGetVendorChainMenuStores,
} from '@/hooks/api/vendor/deliveries/menu-template';
import { ApiErrorResponse, type CreateVendorChainMenuApiResponse } from '@/types';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { INITIAL_ADD_MENU_VALUES, type AddMenuFormValues } from './data';
import StoreMultiSelect from './StoreMultiSelect';

type VendorAddMenuFormProps = {
  inlineMode?: boolean;
  onClose?: () => void;
  onCreated?: (menu: CreateVendorChainMenuApiResponse) => void;
};

export default function VendorAddMenuForm({
  inlineMode = false,
  onClose,
  onCreated,
}: VendorAddMenuFormProps) {
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId: string };
  const t = useTranslations('vendorMenuTemplate.form');
  const tErrors = useTranslations('vendorMenuTemplate.errors');
  const tValidation = useTranslations('vendorMenuTemplate.validation');
  const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const {
    data: storesResponse,
    isLoading: isStoresLoading,
    isError: isStoresError,
    error: storesError,
    refetch: refetchStores,
  } = useGetVendorChainMenuStores();

  const storeOptions = useMemo(
    () =>
      (storesResponse?.data || []).map((store) => ({
        id: store.id,
        label: store.address,
        description: store.status,
      })),
    [storesResponse?.data],
  );

  const { mutate: createChainMenu } = useCreateVendorChainMenu({
    onSuccess: (data) => {
      toast.success(t('success.create'));
      onCreated?.(data);

      if (!inlineMode) {
        router.push(`/vendor/deliveries/${vendorId}/menu-template`);
      }
    },
    onError: (error) => {
      handleApiError(error as ApiErrorResponse);
    },
  });

  const handleSubmit = async (values: AddMenuFormValues) => {
    createChainMenu({
      name: values.title,
      description: values.description,
      image: values.image,
      isActive: values.isAvailable,
      vendorId,
      storeIds: values.stores,
    });
  };

  return (
    <div className={inlineMode ? 'p-0' : 'bg-accent p-10 rounded-md my-5'}>
      {isStoresError && (
        <div className="bg-white p-6 rounded-xl shadow border mb-5">
          <DisplayError
            title={tErrors('fetchStoresFailed')}
            message={
              returnErrorMessage(storesError as ApiErrorResponse) ||
              tErrors('fetchStoresFailed')
            }
            onRetry={refetchStores}
          />
        </div>
      )}
      <Formik
        initialValues={INITIAL_ADD_MENU_VALUES}
        validationSchema={createMenuValidationSchema(tValidation, {
          imageRequired: true,
        })}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white p-6 rounded-xl shadow space-y-5 border">
            <h3 className="text-2xl font-semibold">{t('basicInformation')}</h3>

            <AppInputField
              name="title"
              label={t('titleLabel')}
              placeholder={t('titlePlaceholder')}
              requiredAsterisk
            />

            <AppInputField
              name="description"
              label={t('descriptionLabel')}
              placeholder={t('descriptionPlaceholder')}
              requiredAsterisk
            />

            <StoreMultiSelect
              name="stores"
              label={t('storesLabel')}
              placeholder={t('storesPlaceholder')}
              options={storeOptions}
              requiredAsterisk
            />

            <AppFileInput
              name="image"
              label={t('imageLabel')}
              helperText={t('imageHelper')}
              acceptTypes={IMAGE_TYPES}
              maxSizeMB={5}
              previewHeight={120}
              requiredAsterisk
            />

            <AppSwitch name="isAvailable" label={t('availabilityLabel')} />

            <div className="flex justify-end gap-x-5 pt-4">
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => {
                  if (inlineMode) {
                    onClose?.();
                    return;
                  }

                  router.back();
                }}
                className="w-fit px-12"
                disabled={isSubmitting}
              >
                {inlineMode ? t('cancelButton') : t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                className="w-fit px-12"
                isLoading={isSubmitting}
                disabled={isSubmitting || isStoresLoading || storeOptions.length === 0}
              >
                {t('createButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
