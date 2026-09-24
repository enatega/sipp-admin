'use client';

import { useState } from 'react';
import { globalCommissionSchema } from '@/schemas/commission-rate/global-commission.schema';
import {
  ApiErrorResponse,
  CommissionRateResponse,
  UpdateCommissionRatePayload,
} from '@/types';
import { Form, Formik } from 'formik';
import { Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  commissionPercentageToRate,
  commissionRateToPercentage,
} from '@/lib/commission-rate';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import { useUpdateCommissionRate } from '@/hooks/api/super-admin/enatega-deliveries/commission-rate';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';

interface GlobalCommissionSettingsProps {
  activeTab: string;
  data?: CommissionRateResponse;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}

export function GlobalCommissionSettings({
  activeTab,
  data,
  isLoading,
  error,
}: GlobalCommissionSettingsProps) {
  const t = useTranslations('commission-rate.globalSettings');
  const tSchema = useTranslations('Schemas.commissionRate');
  const tCommon = useTranslations('common');
  const isZoneBased = activeTab === 'zone-based';
  const [isEditing, setIsEditing] = useState(true);
  const { mutateAsync: updateCommissionRate, isPending } =
    useUpdateCommissionRate();

  if (isLoading) {
    return <CardShimmer />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10">
          <DisplayError
            title={t('loadFailedTitle')}
            message={returnErrorMessage(error)}
          />
        </CardContent>
      </Card>
    );
  }

  const initialValues = {
    currency: data?.currency ?? '',
    commissionRate: commissionRateToPercentage(data?.commission_rate),
  };

  const handleSubmit = async (values: {
    currency: string;
    commissionRate: number;
  }) => {
    if (!data?.id) {
      toast.error(t('noDataError'));
      return;
    }

    try {
      const payload: UpdateCommissionRatePayload = {
        commission_percentage: commissionPercentageToRate(
          values.commissionRate,
        ),
      };

      await updateCommissionRate({
        id: data.id,
        payload,
      });

      const message = isZoneBased
        ? t('zoneUpdateSuccess')
        : t('storeUpdateSuccess');
      toast.success(message);
      setIsEditing(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={globalCommissionSchema(tSchema)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, dirty }) => (
        <Form>
          <Card className="mt-6 gap-4 py-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t('title')}
              </CardTitle>
              <CardAction>
                {!isEditing && (
                  <AppButton
                    variant="mute"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setIsEditing(true)}
                    type="button"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {tCommon('edit')}
                  </AppButton>
                )}
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppInput
                  label={t('currencyLabel')}
                  name="currency"
                  placeholder={t('currencyPlaceholder')}
                  type="text"
                  disabled
                />
                <AppInput
                  label={t('commissionLabel')}
                  name="commissionRate"
                  placeholder={t('commissionPlaceholder')}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  postfix="%"
                  disabled={!isEditing}
                />
              </div>
              {isEditing && (
                <div className="flex justify-end mt-4">
                  <AppButton
                    type="submit"
                    className={cn(
                      'px-14 bg-primary text-white hover:bg-primary/80',
                      !dirty && '!cursor-not-allowed',
                    )}
                    isLoading={isSubmitting || isPending}
                    disabled={!dirty || isSubmitting || isPending}
                  >
                    {tCommon('save')}
                  </AppButton>
                </div>
              )}
            </CardContent>
          </Card>
        </Form>
      )}
    </Formik>
  );
}
