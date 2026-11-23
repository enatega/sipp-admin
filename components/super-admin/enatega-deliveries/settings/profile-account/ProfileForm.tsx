'use client';

import { useMemo, useRef, useState } from 'react';
import { Formik, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  useGetAdminSettings,
  useToggleTwoFactor,
  useUpdateProfile,
} from '@/hooks/api/super-admin/enatega-deliveries/settings-profile';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSwitch } from '@/components/shared/form/AppSwitch';
import { initialSettingsValues, SettingsFormValues } from './types';

const PHONE_MAX_DIGITS = 15;

const getPhoneDigitCount = (value: unknown) => {
  return String(value ?? '').replace(/\D/g, '').length;
};

const createProfileFormSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    firstName: Yup.string().trim().required(t('fullNameRequired')),
    email: Yup.string()
      .email(t('emailInvalid'))
      .required(t('emailRequired')),
    phone: Yup.string()
      .trim()
      .required(t('phoneRequired'))
      .test('phoneMaxDigits', t('phoneInvalid'), (value) =>
        getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
      ),
    avatar: Yup.mixed().nullable(),
    twoFactor: Yup.boolean(),
  });

export const ProfileForm: React.FC = () => {
  const t = useTranslations('settings.profileAccount.profileForm');
  const tValidation = useTranslations(
    'settings.profileAccount.profileForm.validation',
  );
  const tToasts = useTranslations(
    'settings.profileAccount.profileForm.toasts',
  );
  const tErrors = useTranslations(
    'settings.profileAccount.profileForm.errors',
  );
  const tFullName = useTranslations(
    'settings.profileAccount.profileForm.fields.fullName',
  );
  const tEmail = useTranslations(
    'settings.profileAccount.profileForm.fields.email',
  );
  const tPhone = useTranslations(
    'settings.profileAccount.profileForm.fields.phone',
  );
  const tConfirmDialog = useTranslations(
    'settings.profileAccount.profileForm.confirmDialog',
  );
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const formikRef = useRef<FormikProps<SettingsFormValues>>(null);
  const validationSchema = useMemo(
    () => createProfileFormSchema(tValidation),
    [tValidation],
  );

  // Fetch admin settings
  const {
    data: adminSettings,
    isLoading,
    isError,
    error,
  } = useGetAdminSettings();
  const normalizedSettings = useMemo<Record<string, unknown> | null>(() => {
    if (!adminSettings) return null;
    const raw = adminSettings as unknown as Record<string, unknown> & {
      data?: Record<string, unknown>;
    };
    return raw.data ?? raw;
  }, [adminSettings]);

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: () => {
      toast.success(tToasts('updateSuccess'));
      setOpen(false);
    },
    onError: (error) => {
      const errorMsg = returnErrorMessage(error);
      toast.error(errorMsg || tToasts('updateFailed'));
      setOpen(false);
    },
  });

  // Toggle 2FA mutation
  const { mutate: toggleTwoFactor } = useToggleTwoFactor({
    onSuccess: (data) => {
      setTwoFactorLoading(false);
      toast.success(
        data.two_factor_enabled
          ? tToasts('twoFactorEnabled')
          : tToasts('twoFactorDisabled'),
      );
    },
    onError: (error) => {
      setTwoFactorLoading(false);
      const errorMsg = returnErrorMessage(error);
      toast.error(errorMsg || tToasts('twoFactorFailed'));
    },
  });

  // Map API response to form values
  const initialValues = useMemo<SettingsFormValues>(() => {
    if (!normalizedSettings) return initialSettingsValues;

    const name =
      (normalizedSettings.name as string | undefined) ||
      `${(normalizedSettings.first_name as string | undefined) || ''} ${(normalizedSettings.last_name as string | undefined) || ''}`.trim();

    return {
      firstName: name,
      lastName: '',
      email: (normalizedSettings.email as string | undefined) || '',
      phone:
        (normalizedSettings.phone as string | undefined) ||
        (normalizedSettings.phone_number as string | undefined) ||
        '',
      avatar: null, // File will be selected by user
      twoFactor:
        (normalizedSettings.two_factor_enabled as boolean | undefined) ??
        (normalizedSettings.twoFactor as boolean | undefined) ??
        false,
      storeType: 'single',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }, [normalizedSettings]);

  // Handle form submission
  const handleSubmit = (values: SettingsFormValues) => {
    const nameParts = values.firstName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    updateProfile({
      first_name: firstName,
      last_name: lastName,
      email: values.email,
      phone: values.phone,
      profile_image: values.avatar,
      // Note: two_factor_auth is handled separately via toggle
    });
  };

  const handleConfirm = async () => {
    if (isUpdating) return;
    await formikRef.current?.submitForm();
  };

  // Handle 2FA toggle separately
  const handleTwoFactorToggle = () => {
    setTwoFactorLoading(true);
    toggleTwoFactor();
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <section className="relative rounded-xl border bg-white p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error
  if (isError) {
    return (
      <section className="relative rounded-xl border bg-white p-4 md:p-6">
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
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values }) => {
        const hasProfileChanges =
          values.firstName !== initialValues.firstName ||
          values.email !== initialValues.email ||
          values.phone !== initialValues.phone ||
          Boolean(values.avatar);

        return (
          <>
            <section className="relative rounded-xl border bg-white p-4 md:p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {t('sectionTitle')}
              </h3>

              <div className="mt-4 grid gap-6 md:grid-cols-1">
                <div>
                  <AppFileInput
                    name="avatar"
                    label={t('avatarLabel')}
                    className="max-w-md"
                    dropAreaClassName="w-full"
                    previewUrl={
                      (normalizedSettings?.profile as string | undefined) ||
                      (normalizedSettings?.profile_image as string | undefined)
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AppInputField
                    name="firstName"
                    label={tFullName('label')}
                    placeholder={tFullName('placeholder')}
                  />
                  <AppInputField
                    name="email"
                    label={tEmail('label')}
                    type="email"
                    placeholder={tEmail('placeholder')}
                  />
                  <AppInputField
                    name="phone"
                    label={tPhone('label')}
                    placeholder={tPhone('placeholder')}
                  />

                  <div className="col-span-2">
                    <AppSwitch
                      name="twoFactor"
                      label={t('twoFactorLabel')}
                      disabled={twoFactorLoading}
                      onChange={() => {
                        handleTwoFactorToggle();
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4">
                <AppButton
                  type="button"
                  size="sm"
                  isLoading={isUpdating}
                  disabled={isUpdating || !hasProfileChanges}
                  className="text-white px-4 py-2 rounded-[8px]"
                  onClick={() => setOpen(true)}
                >
                  {t('updateButton')}
                </AppButton>
              </div>
            </section>

            <AppAlertDialog
              open={open}
              onOpenChange={setOpen}
              loading={isUpdating}
              title={tConfirmDialog('title')}
              subTitle={tConfirmDialog('subTitle')}
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

export default ProfileForm;
