'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createNewPasswordSchema } from '@/schemas/auth/reset-password.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { usePostResetPassword } from '@/hooks/api/auth';
import { useQueryParams } from '@/hooks/use-query-params';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { BackBtn } from '@/components/shared/BackBtn';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';

const initialValues = {
  password: '',
  confirmPassword: '',
};

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const { getParam } = useQueryParams();
  const userId = getParam('userId');
  const resetPasswordMutation = usePostResetPassword();

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    if (!userId) {
      toast.error('User not found. Please go back and try again.');
      setSubmitting(false);
      return;
    }

    resetPasswordMutation.mutate(
      { userId, password: values.password },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          router.push('/login');
        },
        onError: (error: ApiErrorResponse) => {
          handleApiError(error);
        },
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <BackBtn href="/login" label="Back to Login" />
        <div className="rounded-[12px] border bg-white shadow-lg p-8 mt-2">
          <AuthCardHeader
            title="Set your new password"
            description="Choose a strong password you haven’t used before."
          />

          <Formik
            initialValues={initialValues}
            validationSchema={createNewPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({}) => (
              <Form className="mt-6 space-y-4">
                <AppPasswordField
                  label="New Password"
                  name="password"
                  placeholder="••••••••••"
                  requiredAsterisk
                />

                <AppPasswordField
                  label="Confirm Password"
                  name="confirmPassword"
                  placeholder="••••••••••"
                  requiredAsterisk
                />
                <AppButton
                  type="submit"
                  isLoading={resetPasswordMutation.isPending}
                  disabled={resetPasswordMutation.isPending}
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

export default ResetPassword;
