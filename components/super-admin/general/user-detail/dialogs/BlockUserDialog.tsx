'use client';

import { notesSchema } from '@/schemas/user-detail/notes.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { Ban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useBlockUnblockUser } from '@/hooks/api/super-admin/general/users';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface BlockUserDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onConfirm: () => void;
  status: boolean;
}

export function BlockUserDialog({
  open,
  onClose,
  userId,
  onConfirm,
  status,
}: BlockUserDialogProps) {
  const t = useTranslations('userDetail.dialogs.block');
  const tSchema = useTranslations('');

  const initialValues = {
    notes: '',
  };

  const { mutateAsync: blockUser, isPending: isBlocking } =
    useBlockUnblockUser();

  const handleSubmit = async (values: { notes: string }) => {
    try {
      await blockUser({ userId, reason: values.notes });
      toast.success(t('success'));
      onConfirm();
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title=""
      size="md"
      showDefaultFooter={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={notesSchema(tSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ dirty, isSubmitting, isValid }) => (
          <Form>
            <div className="space-y-4 bg-white border rounded-lg p-4">
              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Ban className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  {status ? t('titleUnblock') : t('titleBlock')}
                </h3>
                <p className="text-sm text-mute">
                  {status ? t('subtitleUnblock') : t('subtitleBlock')}
                </p>
              </div>

              {/* Add Notes Section */}
              <AppTextarea
                name="notes"
                label={t('label')}
                labelClassName="!text-gray-700 !font-medium"
                placeholder={
                  status
                    ? 'Reason for unblocking or additional context...'
                    : t('placeholder')
                }
                rows={4}
                className="w-full resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 w-full mt-6">
              <AppButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={onClose}
                disabled={isBlocking || isSubmitting}
              >
                {t('cancel')}
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isBlocking || isSubmitting}
                disabled={!dirty || !isValid || isBlocking || isSubmitting}
              >
                {status ? t('confirmUnblock') : t('confirmBlock')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
