'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import type { ApiErrorResponse } from '@/types';
import { useAcceptAdminInvitation } from '@/hooks/api/auth';
import { handleApiError } from '@/lib/toast-error';
import { createNewPasswordSchema } from '@/schemas/auth/reset-password.schema';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { BackBtn } from '@/components/shared/BackBtn';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';

function AcceptInviteForm() {
  const t = useTranslations('acceptInvite');
  const router = useRouter();
  const token = useSearchParams().get('token');
  const acceptInvitation = useAcceptAdminInvitation();

  return (
    <div className="min-h-screen w-full bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <BackBtn href="/login" label={t('back')} />
        <div className="rounded-[12px] border bg-white shadow-lg p-8 mt-2">
          <AuthCardHeader
            title={t('title')}
            description={t('description')}
          />
          {!token ? (
            <p role="alert" className="mt-6 text-sm text-destructive">{t('missingToken')}</p>
          ) : (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={createNewPasswordSchema}
              onSubmit={async (values) => {
                try {
                  const response = await acceptInvitation.mutateAsync({ token, password: values.password });
                  toast.success(response.message || t('success'));
                  router.replace('/login');
                } catch (error) {
                  handleApiError(error as ApiErrorResponse);
                }
              }}
            >
              <Form className="mt-6 space-y-4">
                <AppPasswordField name="password" label={t('password')} placeholder="••••••••••" requiredAsterisk />
                <AppPasswordField name="confirmPassword" label={t('confirmPassword')} placeholder="••••••••••" requiredAsterisk />
                <AppButton type="submit" className="w-full h-11 rounded-[12px]" isLoading={acceptInvitation.isPending}>
                  {t('submit')}
                </AppButton>
              </Form>
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return <Suspense fallback={<div className="min-h-screen bg-light" />}><AcceptInviteForm /></Suspense>;
}
