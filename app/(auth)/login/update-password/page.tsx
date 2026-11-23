'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema } from '@/schemas/auth/reset-password.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  getAdminProfiles,
  getUser,
  resolvePostLoginPath,
  storeUser,
} from '@/lib/user';
import { useUpdatePasswordRequired } from '@/hooks/api/auth';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { BackBtn } from '@/components/shared/BackBtn';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';

const initialValues = {
  previousPassword: '',
  password: '',
  confirmPassword: '',
};

const UpdatePassword: React.FC = () => {
  const router = useRouter();
  const updatePasswordMutation = useUpdatePasswordRequired();

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      const currentUser = getUser();
      if (!currentUser || !currentUser.id) {
        toast.error('User not found. Please log in again.');
        router.push('/login');
        return;
      }

      await updatePasswordMutation.mutateAsync({
        userId: currentUser.id,
        previous_password: values.previousPassword,
        new_password: values.password,
      });

      // Update user in local storage
      const updatedUser = { ...currentUser, must_change_pass: false };
      storeUser(updatedUser);

      toast.success('Password successfully updated.');
      router.push(resolvePostLoginPath(getAdminProfiles()));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <BackBtn href="/login" label="Back to Login" />
        <div className="rounded-[12px] border bg-white shadow-lg p-8 mt-2">
          <AuthCardHeader
            title="Password Update Required!"
            description="You’re almost in! Please update your password to activate your account and keep it safe."
          />

          <Formik
            initialValues={initialValues}
            validationSchema={resetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mt-6 space-y-4">
                <AppPasswordField
                  label="Previous Password"
                  name="previousPassword"
                  placeholder="••••••••••"
                  requiredAsterisk
                />

                <AppPasswordField
                  label="New Password"
                  name="password"
                  placeholder="••••••••••"
                  requiredAsterisk
                />

                <AppPasswordField
                  label="Confirm New Password"
                  name="confirmPassword"
                  placeholder="••••••••••"
                  requiredAsterisk
                />

                <AppButton
                  type="submit"
                  isLoading={isSubmitting || updatePasswordMutation.isPending}
                  disabled={isSubmitting || updatePasswordMutation.isPending}
                  className="w-full h-11 rounded-[12px] mt-2"
                >
                  Update Password
                </AppButton>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
