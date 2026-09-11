'use client';

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useChangePassword } from '@/hooks/api/super-admin/enatega-deliveries/settings-profile';
import { returnErrorMessage } from '@/lib/toast-error';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';
import { initialSettingsValues, SettingsFormValues } from './types';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createPasswordSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    currentPassword: Yup.string().required(t('currentPasswordRequired')),
    newPassword: Yup.string()
      .matches(passwordRegex, t('newPasswordComplex'))
      .required(t('newPasswordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('passwordsMustMatch'))
      .required(t('confirmPasswordRequired')),
  });

export const ChangePasswordForm: React.FC = () => {
  const t = useTranslations('settings.profileAccount.changePassword');
  const tValidation = useTranslations(
    'settings.profileAccount.changePassword.validation',
  );
  const tToasts = useTranslations(
    'settings.profileAccount.changePassword.toasts',
  );
  const tCurrentPassword = useTranslations(
    'settings.profileAccount.changePassword.fields.currentPassword',
  );
  const tNewPassword = useTranslations(
    'settings.profileAccount.changePassword.fields.newPassword',
  );
  const tConfirmPassword = useTranslations(
    'settings.profileAccount.changePassword.fields.confirmPassword',
  );
  const tConfirmDialog = useTranslations(
    'settings.profileAccount.changePassword.confirmDialog',
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const formikRef = React.useRef<FormikProps<SettingsFormValues>>(null);
  const validationSchema = React.useMemo(
    () => createPasswordSchema(tValidation),
    [tValidation],
  );

  // Change password mutation
  const { mutate: changePassword, isPending: isUpdating } = useChangePassword({
    onSuccess: () => {
      toast.success(tToasts('updateSuccess'));
      setOpen(false);
      // Reset form
      if (formikRef.current) {
        formikRef.current.resetForm();
      }
    },
    onError: (error) => {
      const errorMsg = returnErrorMessage(error);
      toast.error(errorMsg || tToasts('updateFailed'));
      setOpen(false);
    },
  });

  const handleConfirm = async () => {
    if (formikRef.current) {
      await formikRef.current.submitForm();
    }
  };

  const onUpdateClick = async () => {
    if (formikRef.current) {
      const errors = await formikRef.current.validateForm();
      if (errors && Object.keys(errors).length > 0) {
        formikRef.current.setTouched(
          {
            currentPassword: true,
            newPassword: true,
            confirmPassword: true,
          },
          true,
        );
        return;
      }
      setOpen(true);
    }
  };

  const handleSubmit = (values: SettingsFormValues) => {
    changePassword({
      current_password: values.currentPassword,
      new_password: values.newPassword,
      confirm_password: values.confirmPassword,
    });
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialSettingsValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {(formikBag) => {
        const { handleSubmit: formikHandleSubmit } = formikBag;
        return (
          <>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                formikHandleSubmit();
              }}
            >
              <section className="relative rounded-xl border bg-white p-4 md:p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('sectionTitle')}
                </h3>

                <div className="mt-4 grid gap-6 grid-cols-1 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <AppPasswordField
                      name="currentPassword"
                      label={tCurrentPassword('label')}
                      placeholder={tCurrentPassword('placeholder')}
                    />
                  </div>

                  <AppPasswordField
                    name="newPassword"
                    label={tNewPassword('label')}
                    placeholder={tNewPassword('placeholder')}
                  />
                  <AppPasswordField
                    name="confirmPassword"
                    label={tConfirmPassword('label')}
                    placeholder={tConfirmPassword('placeholder')}
                  />
                </div>

                <div className="flex items-center justify-end pt-4">
                  <AppButton
                    type="button"
                    size="sm"
                    className="text-white px-4 py-2 rounded-[8px]"
                    onClick={onUpdateClick}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                  >
                    {t('updateButton')}
                  </AppButton>
                </div>
              </section>
            </Form>

            <AppAlertDialog
              open={open}
              onOpenChange={setOpen}
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

export default ChangePasswordForm;
