'use client';

import { editZoneCommissionSchema } from '@/schemas/commission-rate/edit-zone.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import { useUpdateZoneCommissionRate } from '@/hooks/api/super-admin/enatega-deliveries/commission-rate';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';
import { ZoneCommissionData } from '../../../types';

interface EditZoneCommissionFormProps {
  row?: ZoneCommissionData | null;
  onClose: () => void;
}

export const EditZoneCommissionForm = ({
  row,
  onClose,
}: EditZoneCommissionFormProps) => {
  const t = useTranslations('commission-rate.zoneForm');
  const tSchema = useTranslations('Schemas.commissionRate');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(row);

  const { mutateAsync: updateZoneCommissionRate, isPending } =
    useUpdateZoneCommissionRate();
  const initialCommission = row?.defaultCommission?.replace('%', '') || '';

  const initialValues = {
    zone: row?.zone || '',
    commissionRate: initialCommission,
    status: row?.status || 'Active',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (isEdit && row?.id) {
        await updateZoneCommissionRate({
          zoneId: row.id,
          payload: {
            commission_rate: Number(values.commissionRate),
            status: values.status === 'Active' ? 'active' : 'deactive',
          },
        });
        toast.success(t('updateSuccess'));
      } else {
        toast.success(t('addSuccess'));
      }
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={editZoneCommissionSchema(tSchema)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, isSubmitting, dirty }) => (
        <Form className="flex flex-col gap-6 mt-4">
          <AppInput
            label={t('zoneLabel')}
            name="zone"
            placeholder={t('zonePlaceholder')}
            disabled={true}
          />
          <AppInput
            label={t('commissionLabel')}
            name="commissionRate"
            placeholder={t('commissionPlaceholder')}
            type="number"
          />

          <div className="flex flex-col gap-3">
            <Label>{t('statusLabel')}</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="status-mode"
                checked={values.status === 'Active'}
                onCheckedChange={(checked) =>
                  setFieldValue('status', checked ? 'Active' : 'Inactive')
                }
              />
              <Label
                htmlFor="status-mode"
                className="font-normal cursor-pointer"
              >
                {values.status === 'Active'
                  ? t('statusActive')
                  : t('statusInactive')}
              </Label>
            </div>
          </div>

          <div className="flex justify-end mt-5 gap-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-12"
              disabled={isSubmitting || isPending}
            >
              {tCommon('cancel')}
            </AppButton>
            <AppButton
              type="submit"
              className={cn(
                'px-14 bg-primary text-white hover:bg-primary/80',
                !dirty && '!cursor-not-allowed',
              )}
              isLoading={isSubmitting || isPending}
              disabled={isSubmitting || isPending || !dirty}
            >
              {isEdit ? t('updateButton') : t('saveButton')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};
