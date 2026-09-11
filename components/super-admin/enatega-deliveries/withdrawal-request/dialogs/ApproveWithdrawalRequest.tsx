'use client';

import { useMemo } from 'react';
import { validationSchema } from '@/schemas/enatega-deliveries/withdrawal-request/approve-withdrawal-request-form';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useApproveWithdrawalRequest } from '@/hooks/api/super-admin/enatega-deliveries/withdrawal-request';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface ApproveWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAfterAction?: () => void;
  withdrawId: string;
  requestedAmount?: number;
}

interface FormValues {
  approved_amount: number | '';
  payment_proof: File | null;
  notes: string;
}

export function ApproveWithdrawalDialog({
  open,
  onOpenChange,
  onAfterAction,
  withdrawId,
  requestedAmount,
}: ApproveWithdrawalDialogProps) {
  const t = useTranslations('withdrawalRequests.approveDialog');
  const { mutate: approveWithdrawal, isPending } =
    useApproveWithdrawalRequest();

  const ValidationSchema = useMemo(() => validationSchema(t), [t]);

  const handleSubmit = async (values: FormValues) => {
    if (!values.payment_proof || values.approved_amount === '') {
      return;
    }

    approveWithdrawal(
      {
        id: withdrawId,
        approved_amount: Number(values.approved_amount),
        notes: values.notes || undefined,
        file: values.payment_proof,
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

  const formInitialValues: FormValues = {
    approved_amount: requestedAmount || '',
    payment_proof: null,
    notes: '',
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
        initialValues={formInitialValues}
        validationSchema={ValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {() => (
          <Form className="flex flex-col gap-4 ">
            <AppInputField
              name="approved_amount"
              label={t('amountLabel')}
              type="number"
              placeholder={t('amountPlaceholder')}
              requiredAsterisk
              disabled={isPending}
            />
            <AppFileInput
              name="payment_proof"
              label={t('proofLabel')}
              requiredAsterisk
              disabled={isPending}
            />
            <AppTextarea
              name="notes"
              label={t('notesLabel')}
              placeholder={t('notesPlaceholder')}
              disabled={isPending}
            />

            <div className="flex justify-end gap-3 mt-4">
              <AppButton
                type="button"
                variant="mute"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </AppButton>
              <AppButton
                variant="green"
                type="submit"
                className=""
                isLoading={isPending}
                disabled={isPending}
              >
                {t('confirm')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
