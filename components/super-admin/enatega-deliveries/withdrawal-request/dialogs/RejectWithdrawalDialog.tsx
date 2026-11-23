'use client';

import { useMemo } from 'react';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { handleApiError } from '@/lib/toast-error';
import { useRejectWithdrawalRequest } from '@/hooks/api/super-admin/enatega-deliveries/withdrawal-request';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface RejectWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAfterAction?: () => void;
  withdrawId: string;
}

interface FormValues {
  rejection_reason: string;
}

const initialValues: FormValues = {
  rejection_reason: '',
};

export function RejectWithdrawalDialog({
  open,
  onOpenChange,
  onAfterAction,
  withdrawId,
}: RejectWithdrawalDialogProps) {
  const t = useTranslations('withdrawalRequests.rejectDialog');
  const { mutate: rejectWithdrawal, isPending } = useRejectWithdrawalRequest();

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        rejection_reason: yup
          .string()
          .required(t('validation.reasonRequired'))
          .max(500, t('validation.reasonMax')),
      }),
    [t],
  );

  const handleSubmit = async (values: FormValues) => {
    rejectWithdrawal(
      {
        id: withdrawId,
        reason: values.rejection_reason,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || t('success'));
          onOpenChange(false);
          onAfterAction?.();
        },
        onError: (error: ApiErrorResponse) => {
          handleApiError(error);
        },
      },
    );
  };

  return (
    <AppDialog
      open={open}
      onClose={() => !isPending && onOpenChange(false)}
      title={t('title')}
      size="xl"
      showDefaultFooter={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="flex flex-col gap-4">
            <AppTextarea
              name="rejection_reason"
              label={t('reasonLabel')}
              placeholder={t('reasonPlaceholder')}
              className="h-[100px]"
              requiredAsterisk
              disabled={isPending}
            />

            <div className="flex justify-end gap-3 mt-4">
              <AppButton
                type="button"
                variant="mute"
                className="px-8"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </AppButton>
              <AppButton
                variant={'red'}
                type="submit"
                className="px-12"
                isLoading={isPending}
                disabled={isPending}
              >
                {t('reject')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
