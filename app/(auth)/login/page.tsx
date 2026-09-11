'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/schemas/auth/login.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  resolvePostLoginPath,
  shouldRedirectVendorToResetPassword,
  storeAdminProfiles,
  storeRoleAndPermissions,
  storeShopMode,
  storeUser,
} from '@/lib/user';
import { usePostLogin } from '@/hooks/api/auth';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';

const initialValues = {
  email: '',
  password: '',
  remember: false,
};

const Login: React.FC = () => {
  const router = useRouter();
  const loginMutation = usePostLogin();

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    setSubmitting(true);
    try {
      const data = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      // if accessToken is present, user is logged in
      if ('accessToken' in data && data.accessToken) {
        const shouldForceVendorReset = shouldRedirectVendorToResetPassword(
          data.adminProfiles,
        );
        if (shouldForceVendorReset) {
          toast.success(data.message || 'Login successful!');
          router.push(`/reset-password?userId=${data.user.id}`);
          return;
        }

        toast.success(data.message || 'Login successful!');
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
        const destination = resolvePostLoginPath(data.adminProfiles);
        if (data.user.must_change_pass) {
          router.push('/login/update-password');
        } else router.push(destination);
        return;
      }

      // if userId is present, it means 2FA is enabled
      if ('userId' in data && data.userId) {
        toast.success(data.message);
        router.push(
          `/login/verify-otp?userId=${data.userId}&email=${values.email}`,
        );
        return;
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-[12px] border bg-white shadow-lg p-8">
          <AuthCardHeader
            title="Log in to your account"
            description="Welcome back! Please enter your details."
          />

          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mt-6 space-y-3">
                <AppInputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  requiredAsterisk
                />

                <AppPasswordField
                  label="Password"
                  name="password"
                  placeholder="••••••••••"
                  requiredAsterisk
                />

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forget Password?
                  </Link>
                </div>

                <AppButton
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-[12px] mt-2"
                >
                  Login
                </AppButton>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
