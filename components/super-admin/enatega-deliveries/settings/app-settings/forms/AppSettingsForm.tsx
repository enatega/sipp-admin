'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'react-hot-toast';
import {
  usePatchAdminSettings,
  usePatchAppSettings,
  usePatchWebSettings,
} from '@/hooks/api/super-admin/enatega-deliveries/settings';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/toast-error';
import {
  AppSettingsFormValues,
  createAppSettingsSchema,
} from '@/schemas/enatega-deliveries/settings/app-settings.schema';
import { ApiErrorResponse } from '@/types/api/common';
import {
  AppSettings,
  WebSettings,
} from '@/types/entities/super-admin/enatega-deliveries/settings';
import GlobalLogoSection from '../sections/GlobalLogoSection';
import MaintenanceMessageSection from '../sections/MaintenanceMessageSection';
import PromotionalBannerSection from '../sections/PromotionalBannerSection';
import SplashScreenSection from '../sections/SplashScreenSection';
import ThemeColorSection from '../sections/ThemeColorSection';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';

interface AppSettingsFormProps {
  appType: string;
  initialValues: AppSettingsFormValues;
  apiData?: AppSettings | WebSettings;
  onSubmit?: (values: AppSettingsFormValues) => Promise<void>;
}

const defaultInitialValues: AppSettingsFormValues = {
  logo: null,
  splashImage: null,
  maintenanceImage: null,
  promotionalBanner: null,
  maintenanceEnabled: false,
  maintenanceMessage: '',
  primaryColor: '#000000',
  secondaryColor: '#666666',
  tertiaryColor: '#CCCCCC',
};

export default function AppSettingsForm({
  appType,
  initialValues,
  apiData,
  onSubmit,
}: AppSettingsFormProps) {
  const t = useTranslations('settings.appSettings');
  const tValidation = useTranslations('settings.appSettings.validation');
  const { mutateAsync: patchAppSettings } = usePatchAppSettings();
  const { mutateAsync: patchWebSettings } = usePatchWebSettings();
  const { mutateAsync: patchAdminSettings } = usePatchAdminSettings();
  const [apiError, setApiError] = React.useState<string | string[] | null>(null);

  const isWebTab = appType === 'web';
  const isAdminTab = appType === 'admin';
  const isCustomerApp = appType === 'customer-app';
  const isMobileApp = ['rider-app', 'store-app', 'customer-app'].includes(
    appType,
  );

  const mergedInitialValues = React.useMemo(
    () => ({ ...defaultInitialValues, ...initialValues }),
    [initialValues],
  );
  const validationSchema = React.useMemo(
    () => createAppSettingsSchema(tValidation),
    [tValidation],
  );

  const handleSubmit = async (values: AppSettingsFormValues) => {
    try {
      setApiError(null);

      const hasFileUploads =
        values.logo instanceof File ||
        values.splashImage instanceof File ||
        values.maintenanceImage instanceof File ||
        values.promotionalBanner instanceof File;

      const logoRemoved = apiData?.global_logo && values.logo === null;
      const splashRemoved = apiData?.splash_screen && values.splashImage === null;
      const maintenanceImageRemoved =
        apiData?.maintenance_message_image && values.maintenanceImage === null;

      let payload: FormData | Record<string, unknown>;

      if (hasFileUploads) {
        const formData = new FormData();

        if (values.logo instanceof File) {
          formData.append('global_logo', values.logo);
        } else if (logoRemoved) {
          formData.append('global_logo', '');
        }

        if (values.splashImage instanceof File) {
          formData.append('splash_screen', values.splashImage);
        } else if (splashRemoved) {
          formData.append('splash_screen', '');
        }

        if (values.maintenanceImage instanceof File) {
          formData.append('maintenance_message_image', values.maintenanceImage);
        } else if (maintenanceImageRemoved) {
          formData.append('maintenance_message_image', '');
        }

        if (values.promotionalBanner instanceof File) {
          formData.append('promotional_banner', values.promotionalBanner);
        }

        formData.append(
          'is_maintenance_mode',
          values.maintenanceEnabled ? 'true' : 'false',
        );
        formData.append('maintenance_message', values.maintenanceMessage || '');
        formData.append('primary_color', values.primaryColor);
        formData.append('secondary_color', values.secondaryColor);
        formData.append('tertiary_color', values.tertiaryColor);

        payload = formData;
      } else {
        payload = {
          is_maintenance_mode: values.maintenanceEnabled,
          maintenance_message: values.maintenanceMessage || '',
          primary_color: values.primaryColor,
          secondary_color: values.secondaryColor,
          tertiary_color: values.tertiaryColor,
          ...(logoRemoved && { global_logo: '' }),
          ...(splashRemoved && { splash_screen: '' }),
          ...(maintenanceImageRemoved && { maintenance_message_image: '' }),
        };
      }

      if (isWebTab) {
        await patchWebSettings({ payload });
      } else if (isAdminTab) {
        await patchAdminSettings({ payload });
      } else {
        await patchAppSettings({ appType, payload });
      }

      if (onSubmit) {
        await onSubmit(values);
      }

      toast.success(t('saveSuccess'));
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      handleApiError(errorResponse);
      setApiError(errorResponse.message || 'An error occurred while saving');
    }
  };

  return (
    <Formik
      initialValues={mergedInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <FormErrorDisplay
            formikErrors={errors}
            touched={touched}
            apiError={apiError}
            apiErrorTitle="Save Failed"
            apiErrorSummary="There was an error saving your settings:"
          />

          <div
            className={cn(
              'grid grid-cols-1 gap-6 md:grid-cols-2',
              isCustomerApp ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
            )}
          >
            <GlobalLogoSection logoUrl={apiData?.global_logo} />

            {isMobileApp && (
              <SplashScreenSection splashImageUrl={apiData?.splash_screen} />
            )}

            <MaintenanceMessageSection
              maintenanceMessageImage={apiData?.maintenance_message_image}
            />

            {isCustomerApp && (
              <PromotionalBannerSection
                appType={appType}
                promotionalBannerUrl={apiData?.promotional_banner}
              />
            )}
          </div>

          <ThemeColorSection
            primaryColor={apiData?.primary_color}
            secondaryColor={apiData?.secondary_color}
            tertiaryColor={apiData?.tertiary_color}
            showSecondary={!isAdminTab}
            showTertiary={!isAdminTab && !isWebTab}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
