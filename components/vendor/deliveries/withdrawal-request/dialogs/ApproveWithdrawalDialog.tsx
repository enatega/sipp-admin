'use client';

import Image from 'next/image';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { handleApiError } from '@/lib/toast-error';
import { useApproveVendorWithdraw } from '@/hooks/api/vendor/deliveries/withdraw-requests';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { VendorWithdrawalRequest } from '../types';

interface ApproveWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: VendorWithdrawalRequest | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ApproveWithdrawalDialog = ({
  open,
  onOpenChange,
  request,
  isLoading = false,
}: ApproveWithdrawalDialogProps) => {
  const t = useTranslations('vendorWithdrawalRequest.approveDialog');
  const tValidation = useTranslations(
    'vendorWithdrawalRequest.approveDialog.validation',
  );
  const tToast = useTranslations('vendorWithdrawalRequest.approveDialog.toast');
  const { mutateAsync: approveWithdraw, isPending } =
    useApproveVendorWithdraw();

  const validationSchema = yup.object().shape({
    approved_amount: yup
      .number()
      .min(1, tValidation('approvedAmountMin'))
      .required(tValidation('approvedAmountRequired')),
    payment_proof: yup.mixed().required(tValidation('paymentProofRequired')),
    notes: yup.string().optional(),
  });

  const handleSubmit = async (values: {
    approved_amount: number;
    payment_proof: string;
    notes?: string;
  }) => {
    try {
      const response = await approveWithdraw({
        id: request!.requestId,
        approved_amount: values.approved_amount,
        file: values.payment_proof,
        notes: values.notes,
      });
      toast.success(response.message || tToast('success'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      onOpenChange(false);
    }
  };

  const initialValues = {
    approved_amount: request?.amount || 0,
    payment_proof: '',
    notes: '',
  };
  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('title')}
      size="xl"
      showDefaultFooter={false}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Illustration */}
        <div className="w-32 h-32 relative">
          <Image
            src="/images/asking-question.png"
            alt={t('imageAlt')}
            fill
            className="object-contain"
          />
        </div>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="w-full space-y-6">
              <AppInputField
                name="approved_amount"
                label={t('approvedAmountLabel')}
                placeholder={t('approvedAmountPlaceholder')}
                requiredAsterisk
              />

              <AppFileInput
                label={t('paymentProofLabel')}
                labelClassName="text-start"
                name="payment_proof"
                requiredAsterisk
              />

              <AppInputField
                name="notes"
                label={t('notesLabel')}
                placeholder={t('notesPlaceholder')}
              />
              <div className="flex items-center justify-end gap-3 w-full pt-4 flex-row">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading || isPending}
                  className="flex-1"
                >
                  {t('cancelButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  isLoading={isLoading || isPending}
                  className="bg-help-green hover:bg-help-green/90 flex-1"
                >
                  {t('confirmButton')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
        {/* Actions */}
      </div>
    </AppDialog>
  );
};
