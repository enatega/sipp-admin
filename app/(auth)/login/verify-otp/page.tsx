'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { handleApiError } from '@/lib/toast-error';
import {
  resolvePostLoginPath,
  shouldRedirectVendorToResetPassword,
  storeAdminProfiles,
  storeRoleAndPermissions,
  storeShopMode,
  storeUser,
} from '@/lib/user';
import { usePostSendLoginOtp, usePostVerifyLoginOtp } from '@/hooks/api/auth';
import { useQueryParams } from '@/hooks/use-query-params';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { BackBtn } from '@/components/shared/BackBtn';
import { AppOtpInput } from '@/components/shared/form/AppOtpInput';
import { ResendOtp } from '@/components/shared/ResendOtp';

const ValidationSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'Enter the 6-digit code')
    .required('OTP is required'),
});

const initialValues = {
  otp: '',
};

const VerifyLoginOtpContent: React.FC = () => {
  const router = useRouter();
  const { getParam } = useQueryParams();
  const userId = getParam('userId');
  const email = getParam('email');

  const verifyOtpMutation = usePostVerifyLoginOtp();
  const sendLoginOtpMutation = usePostSendLoginOtp();

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    if (!userId) {
      toast.error('User not found. Please go back and try again.');
      setSubmitting(false);
      return;
    }

    verifyOtpMutation.mutate(
      { userId, sentOtp: values.otp },
      {
        onSuccess: (data) => {
          const shouldForceVendorReset = shouldRedirectVendorToResetPassword(
            data.adminProfiles,
          );
          if (shouldForceVendorReset) {
            toast.success('Login successful!');
            router.push(`/reset-password?userId=${data.user.id}`);
            return;
          }

          toast.success('Login successful!');
          storeUser({
            ...data.user,
            token: data.accessToken,
            shopMode: data.shopMode ?? null,
          });
          storeShopMode(data.shopMode ?? null);
          if (data.user.role) {
            storeRoleAndPermissions(data.user.role);
          }
          if (data.adminProfiles) {
            storeAdminProfiles(data.adminProfiles);
          }
          router.push(resolvePostLoginPath(data.adminProfiles));
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

  const handleResendOtp = (): Promise<void> => {
    if (!email) {
      toast.error('Email not found. Please go back and try again.');
      return Promise.reject(new Error('Email not found'));
    }

    return new Promise<void>((resolve, reject) => {
      sendLoginOtpMutation.mutate(
        { email, otp_type: 'sms' },
        {
          onSuccess: (data) => {
            toast.success(data.message);
            resolve();
          },
          onError: (error: ApiErrorResponse) => {
            handleApiError(error);
            reject(error);
          },
        },
      );
    });
  };

  return (
    <div className="min-h-screen w-full bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <BackBtn href="/login" label="Back to Login" />
        <div className="rounded-[12px] border bg-white shadow-lg p-8 mt-2">
          <AuthCardHeader
            title="Enter Verification Code"
            description={`We’ve sent a verification code to ${email || 'your email'}`}
          />

          <Formik
            initialValues={initialValues}
            validationSchema={ValidationSchema}
            onSubmit={handleSubmit}
          >
            {({}) => (
              <Form className="mt-6 space-y-4">
                <AppOtpInput name="otp" maxLength={6} requiredAsterisk />

                <AppButton
                  type="submit"
                  isLoading={verifyOtpMutation.isPending}
                  disabled={verifyOtpMutation.isPending}
                  className="w-full h-11 rounded-[12px] mt-2"
                >
                  Verify OTP
                </AppButton>
              </Form>
            )}
          </Formik>

          <ResendOtp onResend={handleResendOtp} />
        </div>
      </div>
    </div>
  );
};

const VerifyLoginOtpPage = () => (
  <React.Suspense fallback={<div className="min-h-screen" />}>
    <VerifyLoginOtpContent />
  </React.Suspense>
);

export default VerifyLoginOtpPage;
