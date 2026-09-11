'use client';

import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useGetSubscriptionPlanFeatures } from '@/hooks/api/super-admin/enatega-deliveries/subscription-plans';
import { subscriptionPlanSchema } from '@/schemas/enatega-deliveries/subscription-plans/subscription-plan.schema';
import {
  CreateSubscriptionPlanPayload,
  SubscriptionPlan,
  SubscriptionPlanFeature,
  UpdateSubscriptionPlanPayload,
} from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';

interface SubscriptionPlanFormValues {
  planName: string;
  planDescription: string;
  monthlyPrice: string;
  yearlyPrice: string;
  isActive: boolean;
  isRecommended: boolean;
  commissionRate: string;
  freeOrdersIncluded: string;
  bannerDuration: string;
  numberOfOrders: string;
  isUnlimitedOrders: boolean;
  planFeatureIds: string[];
}

interface SubscriptionPlanDialogProps {
  open: boolean;
  plan?: SubscriptionPlan | null;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onCreate: (payload: CreateSubscriptionPlanPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateSubscriptionPlanPayload) => Promise<void>;
}

const mapPlanToFormValues = (plan?: SubscriptionPlan | null): SubscriptionPlanFormValues => ({
  planName: plan?.planName ?? '',
  planDescription: plan?.planDescription ?? '',
  monthlyPrice: plan ? String(plan.monthlyPrice) : '',
  yearlyPrice: plan ? String(plan.yearlyPrice) : '',
  isActive: plan?.isActive ?? true,
  isRecommended: plan?.isRecommended ?? false,
  commissionRate: plan ? String(plan.commissionRate) : '',
  freeOrdersIncluded: plan ? String(plan.freeOrdersIncluded) : '',
  bannerDuration: plan ? String(plan.bannerDuration) : '',
  numberOfOrders: plan?.numberOfOrders ? String(plan.numberOfOrders) : '',
  isUnlimitedOrders: plan?.isUnlimitedOrders ?? false,
  planFeatureIds: plan?.planFeatures.map((item) => item.id) ?? [],
});

const toNumber = (value: string) => Number(value);

export function SubscriptionPlanDialog({
  open,
  plan,
  onOpenChange,
  isSubmitting,
  onCreate,
  onUpdate,
}: SubscriptionPlanDialogProps) {
  const t = useTranslations('enategaDeliveriesPages.subscriptionPlans');
  const tValidation = useTranslations('enategaDeliveriesPages.subscriptionPlans.validation');
  const { data: featuresResponse, isLoading: isFeaturesLoading } =
    useGetSubscriptionPlanFeatures({
      enabled: open,
      retry: false,
    });

  const featureGroups = useMemo(() => {
    const features = featuresResponse?.title ?? [];
    return features.reduce<Record<string, SubscriptionPlanFeature[]>>((acc, feature) => {
      const groupKey = feature.type || 'general';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(feature);
      return acc;
    }, {});
  }, [featuresResponse]);

  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={plan ? t('editDialogTitle') : t('createDialogTitle')}
      size="3xl"
      showDefaultFooter={false}
    >
      <Formik<SubscriptionPlanFormValues>
        initialValues={mapPlanToFormValues(plan)}
        enableReinitialize
        validationSchema={subscriptionPlanSchema((key: string) => tValidation(key))}
        onSubmit={async (values) => {
          const payloadBase: CreateSubscriptionPlanPayload = {
            planName: values.planName.trim(),
            planDescription: values.planDescription.trim() || undefined,
            monthlyPrice: toNumber(values.monthlyPrice),
            yearlyPrice: toNumber(values.yearlyPrice),
            isActive: values.isActive,
            isRecommended: values.isRecommended,
            commissionRate: toNumber(values.commissionRate),
            freeOrdersIncluded: toNumber(values.freeOrdersIncluded),
            bannerDuration: toNumber(values.bannerDuration),
            isUnlimitedOrders: values.isUnlimitedOrders,
            planFeatureIds: values.planFeatureIds,
          };

          if (!values.isUnlimitedOrders) {
            payloadBase.numberOfOrders = toNumber(values.numberOfOrders);
          }

          if (plan?.id) {
            await onUpdate(plan.id, payloadBase);
          } else {
            await onCreate(payloadBase);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting: isFormSubmitting, errors, touched }) => (
          <Form className="space-y-5">
            <div className="space-y-4 rounded-lg border border-stroke p-4">
              <h4 className="font-semibold text-darkblack">{t('basicInformation')}</h4>

              <AppInputField
                name="planName"
                label={t('planName')}
                placeholder={t('planNamePlaceholder')}
                requiredAsterisk
              />

              <AppTextarea
                name="planDescription"
                label={t('planDescription')}
                placeholder={t('planDescriptionPlaceholder')}
                rows={3}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <AppInputField
                  name="monthlyPrice"
                  label={t('monthlyPrice')}
                  type="number"
                  placeholder="0"
                  requiredAsterisk
                />
                <AppInputField
                  name="yearlyPrice"
                  label={t('yearlyPrice')}
                  type="number"
                  placeholder="0"
                  requiredAsterisk
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-stroke px-3 py-2">
                  <span className="text-sm font-medium">{t('activePlan')}</span>
                  <Switch
                    checked={values.isActive}
                    onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-stroke px-3 py-2">
                  <span className="text-sm font-medium">{t('recommendedPlan')}</span>
                  <Switch
                    checked={values.isRecommended}
                    onCheckedChange={(checked) => setFieldValue('isRecommended', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-stroke p-4">
              <h4 className="font-semibold text-darkblack">{t('pricingAndOrders')}</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <AppInputField
                  name="commissionRate"
                  label={t('commissionRate')}
                  type="number"
                  placeholder="0"
                  requiredAsterisk
                />
                <AppInputField
                  name="freeOrdersIncluded"
                  label={t('freeOrdersIncluded')}
                  type="number"
                  placeholder="0"
                  requiredAsterisk
                />
                <AppInputField
                  name="bannerDuration"
                  label={t('bannerDuration')}
                  type="number"
                  placeholder="0"
                  requiredAsterisk
                />
                <AppInputField
                  name="numberOfOrders"
                  label={t('numberOfOrders')}
                  type="number"
                  placeholder="0"
                  disabled={values.isUnlimitedOrders}
                  requiredAsterisk={!values.isUnlimitedOrders}
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="isUnlimitedOrders"
                  checked={values.isUnlimitedOrders}
                  onCheckedChange={(checked) => {
                    const nextValue = checked === true;
                    setFieldValue('isUnlimitedOrders', nextValue);
                    if (nextValue) {
                      setFieldValue('numberOfOrders', '');
                    }
                  }}
                />
                <label htmlFor="isUnlimitedOrders" className="text-sm font-medium">
                  {t('unlimitedOrders')}
                </label>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-stroke p-4">
              <h4 className="font-semibold text-darkblack">{t('features')}</h4>

              {isFeaturesLoading ? (
                <p className="text-sm text-mute">{t('loadingFeatures')}</p>
              ) : Object.keys(featureGroups).length === 0 ? (
                <p className="text-sm text-mute">{t('noFeaturesAvailable')}</p>
              ) : (
                Object.entries(featureGroups).map(([groupName, groupFeatures]) => (
                  <div key={groupName} className="space-y-3">
                    <p className="text-sm font-semibold capitalize text-mute">{groupName}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {groupFeatures.map((feature) => {
                        const checked = values.planFeatureIds.includes(feature.id);
                        return (
                          <label
                            key={feature.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-stroke px-3 py-2"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                const nextChecked = isChecked === true;
                                const nextIds = nextChecked
                                  ? [...values.planFeatureIds, feature.id]
                                  : values.planFeatureIds.filter((id) => id !== feature.id);
                                setFieldValue('planFeatureIds', nextIds);
                              }}
                            />
                            <span className="text-sm text-darkblack">{feature.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {errors.planFeatureIds && touched.planFeatureIds ? (
                <p className="text-sm text-destructive">{String(errors.planFeatureIds)}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 pb-1">
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isFormSubmitting}
              >
                {t('cancel')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting || isFormSubmitting}
                disabled={isSubmitting || isFormSubmitting}
              >
                {plan ? t('updatePlan') : t('createPlan')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
