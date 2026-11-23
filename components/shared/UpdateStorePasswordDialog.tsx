'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';
import type { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { AppDialog } from './AppDialog';
import { AppButton } from './AppButton';
import { AppPasswordField } from './form/AppPasswordField';
import { updateStorePasswordSchema } from '@/schemas/enatega-deliveries/stores/update-store-password';

export function UpdateStorePasswordDialog({ storeId, storeName, open, onClose }: {
  storeId: string; storeName?: string; open: boolean; onClose: () => void;
}) {
  const t = useTranslations('storePassword');
  const tSchema = useTranslations('Schemas.storeForm');
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<unknown, ApiErrorResponse, { password: string }>({
    mutationFn: async (values) => Axios.patch(`/apps/deliveries/stores/${storeId}/password`, {
      password: values.password,
    }),
    retry: false,
    onSuccess: () => {
      toast.success(t('success'));
      setError(null);
      onClose();
    },
    onError: (err) => setError(returnErrorMessage(err)),
  });
  const close = () => {
    if (mutation.isPending) return;
    setError(null); onClose();
  };

  return <AppDialog open={open} onClose={close} title={t('title')} size="md" showDefaultFooter={false} showCloseButton={!mutation.isPending}>
    {open && <Formik initialValues={{ password: '', confirmPassword: '' }} validationSchema={updateStorePasswordSchema(tSchema, t)}
      onSubmit={async (values) => {
        if (mutation.isPending) return;
        setError(null);
        try { await mutation.mutateAsync({ password: values.password }); }
        catch { /* The mutation shows the API error while preserving form values. */ }
      }}>
    {({ isSubmitting }) => <Form noValidate className="space-y-5" aria-busy={mutation.isPending || isSubmitting}>
      {storeName && <p className="font-medium break-words">{storeName}</p>}
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <AppPasswordField name="password" label={t('password')} requiredAsterisk maxLength={72}
        autoComplete="new-password" helperText={t('passwordHint')} disabled={mutation.isPending || isSubmitting} />
      <AppPasswordField name="confirmPassword" label={t('confirmPassword')} requiredAsterisk maxLength={72}
        autoComplete="new-password" disabled={mutation.isPending || isSubmitting} />
      {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <AppButton type="button" variant="secondary" disabled={mutation.isPending || isSubmitting} onClick={close}>{t('cancel')}</AppButton>
        <AppButton type="submit" disabled={mutation.isPending || isSubmitting} isLoading={mutation.isPending || isSubmitting}>
          {mutation.isPending ? t('processing') : t('save')}
        </AppButton>
      </div>
    </Form>}
    </Formik>}
  </AppDialog>;
}
