'use client';

import { notesSchema } from '@/schemas/user-detail/notes.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateInternalNote } from '@/hooks/api/super-admin/general/users';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface InternalNotesDialogProps {
  open: boolean;
  userId: string;
  userName?: string;
  notes?: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export function InternalNotesDialog({
  open,
  userId,
  userName,
  notes = '',
  onClose,
  onUpdate,
}: InternalNotesDialogProps) {
  const t = useTranslations('userDetail.dialogs.internalNotes');
  const tSchema = useTranslations('');

  const initialValues = {
    notes,
  };

  const { mutate, isPending } = useUpdateInternalNote();

  const handleSubmit = (values: { notes: string }) => {
    if (!userId) {
      toast.error(t('invalidUserId'));
      return;
    }
    mutate(
      { userId, internalNote: values.notes },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          onUpdate?.();
          onClose();
        },
        onError: (error) => {
          handleApiError(error as ApiErrorResponse);
        },
      },
    );
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={`${t('title')}${userName ? ` - ${userName}` : ''}`}
      size="lg"
      showDefaultFooter={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={notesSchema(tSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ dirty, isValid }) => (
          <Form>
            <div className="space-y-4 bg-white border rounded-lg p-4">
              <AppTextarea
                name="notes"
                label={t('label')}
                labelClassName="!text-gray-700 !font-medium !mb-2"
                placeholder={t('placeholder')}
                rows={6}
                className="w-full"
              />
              <p className="text-sm text-gray-500">{t('helperText')}</p>
            </div>

            <div className="flex items-center justify-end gap-3 w-full mt-6">
              <AppButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isPending}
              >
                {t('cancel')}
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                isLoading={isPending}
                disabled={!dirty || !isValid || isPending}
              >
                {t('save')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
