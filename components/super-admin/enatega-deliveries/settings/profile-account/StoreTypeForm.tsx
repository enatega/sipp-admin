'use client';

import React, { useMemo } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useGetShopMode, useUpdateShopMode } from '@/hooks/api/super-admin/enatega-deliveries/settings-profile';
import { updateStoredShopMode } from '@/lib/user';
import { returnErrorMessage } from '@/lib/toast-error';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { initialSettingsValues, SettingsFormValues } from './types';

export const StoreTypeForm: React.FC = () => {
  const t = useTranslations('settings.profileAccount.storeType');
  const tOptions = useTranslations('settings.profileAccount.storeType.options');
  const tValidation = useTranslations(
    'settings.profileAccount.storeType.validation',
  );
  const tToasts = useTranslations('settings.profileAccount.storeType.toasts');
  const tErrors = useTranslations('settings.profileAccount.storeType.errors');
  const tConfirmDialog = useTranslations(
    'settings.profileAccount.storeType.confirmDialog',
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const formikRef = React.useRef<FormikProps<SettingsFormValues>>(null);
  const options = useMemo(
    () => [
      { label: tOptions('single'), value: 'single' as const },
      { label: tOptions('chain'), value: 'chain' as const },
      { label: tOptions('multi'), value: 'multi' as const },
    ],
    [tOptions],
  );
  const storeTypeSchema = useMemo(
    () =>
      Yup.object().shape({
        storeType: Yup.string()
          .oneOf(['single', 'chain', 'multi'], tValidation('invalid'))
          .required(tValidation('required')),
      }),
    [tValidation],
  );

  // Fetch shop mode
  const { data: shopModeData, isLoading, isError, error } = useGetShopMode();

  // Update shop mode mutation
  const { mutate: updateShopMode, isPending: isUpdating } = useUpdateShopMode({
    onSuccess: (response) => {
      updateStoredShopMode(response.shop_mode);
      toast.success(tToasts('updateSuccess'));
      setOpen(false);
    },
    onError: (error) => {
      const errorMsg = returnErrorMessage(error);
      toast.error(errorMsg || tToasts('updateFailed'));
      setOpen(false);
    },
  });

  // Map API response to form value
  const initialValues = useMemo<SettingsFormValues>(() => {
    if (!shopModeData) return initialSettingsValues;

    // Map API values to form values
    let storeType: 'single' | 'chain' | 'multi' = 'single';
    if (shopModeData.shop_mode === 'MULTI_VENDOR') {
      storeType = 'multi';
    } else if (shopModeData.shop_mode === 'STORE_CHAIN') {
      storeType = 'chain';
    } else if (shopModeData.shop_mode === 'SINGLE_VENDOR') {
      storeType = 'single';
    }

    return {
      ...initialSettingsValues,
      storeType,
    };
  }, [shopModeData]);

  // Initialize shop mode from API on mount
  React.useEffect(() => {
    if (shopModeData?.shop_mode) {
      updateStoredShopMode(shopModeData.shop_mode);
    }
  }, [shopModeData]);

  const handleConfirm = async () => {
    if (isUpdating) return;
    if (formikRef.current) {
      await formikRef.current.submitForm();
    }
  };

  // Handle form submission
  const handleSubmit = (values: SettingsFormValues) => {
    // Map form value to API value
    let shopMode: 'SINGLE_VENDOR' | 'MULTI_VENDOR' | 'STORE_CHAIN' = 'SINGLE_VENDOR';
    if (values.storeType === 'multi') {
      shopMode = 'MULTI_VENDOR';
    } else if (values.storeType === 'chain') {
      shopMode = 'STORE_CHAIN';
    } else {
      shopMode = 'SINGLE_VENDOR';
    }

    if (shopModeData?.shop_mode === shopMode) {
      setOpen(false);
      return;
    }

    updateShopMode({ shop_mode: shopMode });
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <section className="rounded-xl border bg-white p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show error
  if (isError) {
    return (
      <section className="rounded-xl border bg-white p-4 md:p-6">
        <DisplayError
          title={tErrors('loadTitle')}
          message={returnErrorMessage(error) || tErrors('loadMessage')}
        />
      </section>
    );
  }

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      enableReinitialize
      validationSchema={storeTypeSchema}
      onSubmit={handleSubmit}
    >
      {(formikBag) => {
        const { values, setFieldValue } = formikBag;

        const selectedValue = values.storeType;
        const selectedOption =
          options.find((o) => o.value === selectedValue) ?? options[0];
        const hasStoreTypeChanged = values.storeType !== initialValues.storeType;

        return (
          <>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (hasStoreTypeChanged && !isUpdating) setOpen(true);
              }}
            >
              <section className="rounded-xl border bg-white p-4 md:p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('sectionTitle')}
                </h3>

                <div className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {options.map((opt) => {
                      const selected = values.storeType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setFieldValue(
                              'storeType',
                              opt.value,
                            )
                          }
                          className={
                            'flex items-center gap-3 rounded-lg border p-4 text-left transition ' +
                            (selected
                              ? 'border-primary bg-primary/5'
                              : 'border-stroke hover:border-primary')
                          }
                        >
                          <input
                            type="radio"
                            name="storeType"
                            value={opt.value}
                            checked={selected}
                            readOnly
                            className="w-4 h-4 accent-primary"
                          />
                          <div className="text-sm font-medium">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                  <AppButton
                    type="button"
                    size="sm"
                    className="text-white px-4 py-2 rounded-[8px]"
                    onClick={() => setOpen(true)}
                    disabled={isUpdating || !hasStoreTypeChanged}
                  >
                    {t('updateButton')}
                  </AppButton>
                </div>
              </section>
            </Form>

            <AppAlertDialog
              open={open}
              onOpenChange={setOpen}
              loading={isUpdating}
              title={tConfirmDialog('title')}
              subTitle={tConfirmDialog('subTitle', {
                storeType: selectedOption.label.toLowerCase(),
              })}
              description={tConfirmDialog('description')}
              confirmLabel={tConfirmDialog('confirm')}
              cancelLabel={tConfirmDialog('cancel')}
              onConfirm={handleConfirm}
              variant="primary"
              size="2xl"
            />
          </>
        );
      }}
    </Formik>
  );
};

export default StoreTypeForm;
