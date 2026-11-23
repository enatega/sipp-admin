'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';
import type { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { AppDialog } from './AppDialog';
import { AppButton } from './AppButton';
import { AppInputField } from './form/AppInput';
import { AppPasswordField } from './form/AppPasswordField';
import { enableStoreLoginSchema } from '@/schemas/enatega-deliveries/stores/enable-store-login';

export function EnableStoreLoginDialog({ storeId, storeName, open, onClose }: {
  storeId: string; storeName?: string; open: boolean; onClose: () => void;
}) {
  const t = useTranslations('storeLogin');
  const tSchema = useTranslations('Schemas.storeForm');
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<unknown, ApiErrorResponse, { email: string; password: string }>({
    mutationFn: async (values) => Axios.post(`/apps/deliveries/stores/${storeId}/enable-login`, {
      email: values.email.trim().toLowerCase(), password: values.password,
    }),
    retry: false,
    onSuccess: async () => {
      toast.success(t('success'));
      onClose();
      await Promise.all(['get-store-detail', 'get-delivery-stores', 'get-store-profile'].map(
        (key) => queryClient.invalidateQueries({ queryKey: [key] }),
      ));
    },
    onError: (err) => setError(returnErrorMessage(err)),
  });
  const close = () => {
    if (mutation.isPending) return;
    setError(null); onClose();
  };

  return <AppDialog open={open} onClose={close} title={t('title')} size="md" showDefaultFooter={false} showCloseButton={!mutation.isPending}>
    {open && <Formik initialValues={{ email: '', password: '' }} validationSchema={enableStoreLoginSchema(tSchema)}
      onSubmit={async (values) => {
        if (mutation.isPending) return;
        setError(null);
        try { await mutation.mutateAsync(values); }
        catch { /* The mutation shows the API error while preserving form values. */ }
      }}>
    {({ isSubmitting }) => <Form noValidate className="space-y-5" aria-busy={mutation.isPending || isSubmitting}>
      {storeName && <p className="font-medium break-words">{storeName}</p>}
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <AppInputField name="email" label={t('email')} type="email" requiredAsterisk maxLength={255}
        autoComplete="off" disabled={mutation.isPending || isSubmitting} />
      <AppPasswordField name="password" label={t('password')} requiredAsterisk maxLength={72}
        autoComplete="new-password" helperText={t('passwordHint')} disabled={mutation.isPending || isSubmitting} />
      {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <AppButton type="button" variant="secondary" disabled={mutation.isPending || isSubmitting} onClick={close}>{t('cancel')}</AppButton>
        <AppButton type="submit" disabled={mutation.isPending || isSubmitting} isLoading={mutation.isPending || isSubmitting}>
          {mutation.isPending ? t('processing') : t('title')}
        </AppButton>
      </div>
    </Form>}
    </Formik>}
  </AppDialog>;
}
