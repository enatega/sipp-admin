'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { handleApiError } from '@/lib/toast-error';
import { usePostSendOtp } from '@/hooks/api/auth';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { BackBtn } from '@/components/shared/BackBtn';
import { AppInputField } from '@/components/shared/form/AppInput';

const ValidationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const initialValues = {
  email: '',
};

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const sendOtpMutation = usePostSendOtp();

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    sendOtpMutation.mutate(
      { email: values.email },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          router.push(`/forgot-password/verify-otp?email=${values.email}`);
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
            title="Forgot Password"
            description="Enter your email to reset your password"
          />

          <Formik
            initialValues={initialValues}
            validationSchema={ValidationSchema}
            onSubmit={handleSubmit}
          >
            {({}) => (
              <Form className="mt-6 space-y-4">
                <AppInputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  requiredAsterisk
                />

                <AppButton
                  type="submit"
                  isLoading={sendOtpMutation.isPending}
                  disabled={sendOtpMutation.isPending}
                  className="w-full h-11 rounded-[12px] mt-2"
                >
                  Send OTP
                </AppButton>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
