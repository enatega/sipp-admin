'use client';

import * as React from 'react';
import { Form, Formik } from 'formik';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { createMenuValidationSchema } from '@/schemas/enatega-deliveries/vendor/menu-template';
import {
  useGetVendorChainMenuById,
  useGetVendorChainMenuStores,
  useUpdateVendorChainMenu,
} from '@/hooks/api/vendor/deliveries/menu-template';
import { ApiErrorResponse } from '@/types';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import StoreMultiSelect from '../add-menu/StoreMultiSelect';
import { type AddMenuFormValues } from '../add-menu/data';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function VendorEditMenuForm() {
  const router = useRouter();
  const t = useTranslations('vendorMenuTemplate.form');
  const tErrors = useTranslations('vendorMenuTemplate.errors');
  const tValidation = useTranslations('vendorMenuTemplate.validation');
  const { vendorId, id } = useParams() as { vendorId: string; id: string };

  const {
    data: selectedMenu,
    isLoading: isMenuLoading,
    isError: isMenuError,
    error: menuError,
    refetch: refetchMenu,
  } = useGetVendorChainMenuById(id);

  const {
    data: storesResponse,
    isLoading: isStoresLoading,
    isError: isStoresError,
    error: storesError,
    refetch: refetchStores,
  } = useGetVendorChainMenuStores();

  const storeOptions = React.useMemo(
    () =>
      (storesResponse?.data || []).map((store) => ({
        id: store.id,
        label: store.address,
        description: store.status,
      })),
    [storesResponse?.data],
  );

  const initialValues = React.useMemo<AddMenuFormValues>(() => {
    if (!selectedMenu) {
      return {
        title: '',
        description: '',
        stores: [],
        image: null,
        isAvailable: true,
      };
    }

    return {
      title: selectedMenu.name,
      description: selectedMenu.description,
      stores: selectedMenu.assignedStores.map((store) => store.id),
      image: null,
      isAvailable: selectedMenu.isActive,
    };
  }, [selectedMenu]);

  const { mutate: updateChainMenu } = useUpdateVendorChainMenu({
    onSuccess: () => {
      toast.success(t('success.update'));
      router.push(`/vendor/deliveries/${vendorId}/menu-template`);
    },
    onError: (error) => {
      handleApiError(error as ApiErrorResponse);
    },
  });

  const handleSubmit = async (values: AddMenuFormValues) => {
    updateChainMenu({
      menuId: id,
      name: values.title,
      description: values.description,
      image: values.image,
      isActive: values.isAvailable,
      vendorId,
      storeIds: values.stores,
    });
  };

  if (isMenuError || isStoresError) {
    return (
      <div className="bg-accent p-10 rounded-md my-5">
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          {isMenuError && (
            <DisplayError
              title={tErrors('fetchMenuFailed')}
              message={
                returnErrorMessage(menuError as ApiErrorResponse) ||
                tErrors('fetchMenuFailed')
              }
              onRetry={refetchMenu}
            />
          )}
          {isStoresError && (
            <DisplayError
              title={tErrors('fetchStoresFailed')}
              message={
                returnErrorMessage(storesError as ApiErrorResponse) ||
                tErrors('fetchStoresFailed')
              }
              onRetry={refetchStores}
            />
          )}
        </div>
      </div>
    );
  }

  if (!isMenuLoading && !selectedMenu) {
    return (
      <div className="bg-accent p-10 rounded-md my-5">
        <div className="bg-white p-6 rounded-xl shadow border">
          <NoDataFound title={tErrors('menuNotFound')} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent p-10 rounded-md my-5">
      <Formik
        initialValues={initialValues}
        validationSchema={createMenuValidationSchema(tValidation, {
          imageRequired: false,
        })}
        onSubmit={handleSubmit}
        enableReinitialize
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
              previewUrl={selectedMenu?.imageUrl}
            />

            <AppSwitch name="isAvailable" label={t('availabilityLabel')} />

            <div className="flex justify-end gap-x-5 pt-4">
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="w-fit px-12"
                disabled={isSubmitting}
              >
                {t('cancelButton')}
              </AppButton>
              <AppButton
                type="submit"
                className="w-fit px-12"
                isLoading={isSubmitting}
                disabled={
                  isSubmitting ||
                  isMenuLoading ||
                  isStoresLoading ||
                  storeOptions.length === 0
                }
              >
                {t('updateButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
