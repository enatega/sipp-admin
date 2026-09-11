'use client';

import Image from 'next/image';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { ApiErrorResponse } from '@/types/api/common';
import { handleApiError } from '@/lib/toast-error';
import { useRejectVendorWithdraw } from '@/hooks/api/vendor/deliveries/withdraw-requests';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { VendorWithdrawalRequest } from '../types';

interface RejectWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: VendorWithdrawalRequest | null;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export const RejectWithdrawalDialog = ({
  open,
  onOpenChange,
  request,
  isLoading = false,
}: RejectWithdrawalDialogProps) => {
  const t = useTranslations('vendorWithdrawalRequest.rejectDialog');
  const tToast = useTranslations('vendorWithdrawalRequest.rejectDialog.toast');
  const { currencySymbol } = useCurrency();

  const { mutateAsync: rejectWithdraw, isPending } = useRejectVendorWithdraw();

  const validationSchema = yup.object().shape({
    rejectionReason: yup
      .string()
      .required(t('validation.reasonRequired'))
      .max(500, t('validation.reasonMax')),
  });

  const initialValues = {
    rejectionReason: '',
  };

  const handleSubmit = async (values: { rejectionReason: string }) => {
    try {
      const response = await rejectWithdraw({
        id: request!.requestId,
        reason: values.rejectionReason,
      });
      toast.success(response.message || tToast('success'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      onOpenChange(false);
    }
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

        {/* Request Info */}
        <div className="space-y-2 w-full text-left">
          <p className="text-sm text-muted-foreground">
            {t('storeLabel')}:{' '}
            <span className="font-medium text-foreground">{request?.name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t('amountLabel')}:{' '}
            <span className="font-semibold text-foreground text-lg">
              {currencySymbol} {request?.amount}
            </span>
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {() => (
            <Form className="w-full space-y-4">
              <AppTextarea
                name="rejectionReason"
                label={t('reasonLabel')}
                placeholder={t('reasonPlaceholder')}
                rows={4}
                requiredAsterisk
              />

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 flex-row">
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
                  variant="red"
                  className="flex-1"
                >
                  {t('confirmButton')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AppDialog>
  );
};
