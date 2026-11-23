'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/schemas/auth/login.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik, type FormikProps } from 'formik';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  getRememberedEmail,
  resolvePostLoginPath,
  setRememberMe,
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
import { Checkbox } from '@/components/ui/checkbox';

const initialValues = {
  email: '',
  password: '',
  remember: false,
};

type PasswordCredentialCtor = new (data: {
  id: string;
  password: string;
  name?: string;
}) => Credential;

type StoredPasswordCredential = Credential & { password?: string };

// Credential Management API (Chrome/Edge). Safari has no support and relies on
// its own autofill/save prompt, driven by the autoComplete hints on the inputs.
const getPasswordCredentialCtor = (): PasswordCredentialCtor | null => {
  if (typeof window === 'undefined' || !navigator.credentials) return null;
  const ctor = (window as unknown as { PasswordCredential?: PasswordCredentialCtor })
    .PasswordCredential;
  return ctor ?? null;
};

// Ask the browser to offer saving the password (no-op if already saved)
const savePasswordToBrowser = async (email: string, password: string) => {
  const PasswordCredential = getPasswordCredentialCtor();
  if (!PasswordCredential) return;
  try {
    await navigator.credentials.store(
      new PasswordCredential({ id: email, password, name: email }),
    );
  } catch {
    // User dismissed or browser blocked the prompt — nothing to do
  }
};

// Silently read the saved password for the remembered email. 'silent' never
// shows the browser's account chooser — if the browser can't hand over the
// credential without asking (e.g. several accounts saved for this site), it
// returns null and the browser's native field autofill takes over instead.
const getPasswordFromBrowser = async (rememberedEmail: string) => {
  if (!getPasswordCredentialCtor()) return null;
  try {
    const credential = (await navigator.credentials.get({
      password: true,
      mediation: 'silent',
    } as CredentialRequestOptions)) as StoredPasswordCredential | null;
    if (!credential?.id || !credential.password) return null;
    if (credential.id.toLowerCase() !== rememberedEmail.toLowerCase()) {
      return null;
    }
    return { email: credential.id, password: credential.password };
  } catch {
    return null;
  }
};

const Login: React.FC = () => {
  const router = useRouter();
  const loginMutation = usePostLogin();
  const formikRef = React.useRef<FormikProps<typeof initialValues>>(null);

  // Prefill the email saved by a previous "remember me" login, plus the
  // password if the browser's password manager has one for it
  React.useEffect(() => {
    const rememberedEmail = getRememberedEmail();
    if (!rememberedEmail) return;

    formikRef.current?.setValues((prev) => ({
      ...prev,
      email: rememberedEmail,
      remember: true,
    }));

    void getPasswordFromBrowser(rememberedEmail).then((credential) => {
      if (!credential) return;
      formikRef.current?.setValues((prev) => ({
        ...prev,
        email: credential.email,
        password: credential.password,
      }));
    });
  }, []);

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

      setRememberMe(values.remember, values.email);
      if (values.remember) {
        await savePasswordToBrowser(values.email, values.password);
      }

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
            innerRef={formikRef}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="mt-6 space-y-3">
                <AppInputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  requiredAsterisk
                />

                <AppPasswordField
                  label="Password"
                  name="password"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  requiredAsterisk
                />

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="remember"
                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                  >
                    <Checkbox
                      id="remember"
                      checked={values.remember}
                      onCheckedChange={(checked) =>
                        setFieldValue('remember', checked === true)
                      }
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-ink hover:underline"
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
