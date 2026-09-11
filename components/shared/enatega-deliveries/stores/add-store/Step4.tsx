'use client';

import * as React from 'react';
import { StoreFormStep4Schema } from '@/schemas/enatega-deliveries/stores/store-form';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import type { Step4Data } from '@/types/entities/vendor/store';
import { AppButton } from '@/components/shared/AppButton';
import { DayTimingRow } from '@/components/super-admin/enatega-deliveries/stores/add-store/DayTimingRow';
import InteractiveMap, {
  ZoneData,
} from '@/components/super-admin/general/zones/common/InteractiveMap';

interface SharedStep4FormProps {
  initialData: Step4Data | null;
  onSubmit: (data: Step4Data) => void;
  onBack: () => void;
  translationNamespace: string;
}

const dayMapping = [
  { key: 'monday' },
  { key: 'tuesday' },
  { key: 'wednesday' },
  { key: 'thursday' },
  { key: 'friday' },
  { key: 'saturday' },
  { key: 'sunday' },
] as const;

const getEmptyStep4 = (): Step4Data => ({
  location: null,
  exactStoreLocation: null,
  storeTimings: {
    monday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
    tuesday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
    wednesday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
    thursday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
    friday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
    saturday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
    sunday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
  },
});

export const SharedStep4Form: React.FC<SharedStep4FormProps> = ({
  initialData,
  onSubmit,
  onBack,
  translationNamespace,
}) => {
  const t = useTranslations(`${translationNamespace}.step4`);
  const tSchema = useTranslations('Schemas.storeForm');

  const initialValues = React.useMemo<Step4Data>(
    () => initialData ?? getEmptyStep4(),
    [initialData],
  );

  const handleSubmit = (values: Step4Data) => {
    onSubmit(values);
  };

  return (
    <div className="md:min-w-[600px] w-full bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={StoreFormStep4Schema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          setFieldValue,
          values,
          errors,
          touched,
          submitCount,
        }) => (
          <Form className="space-y-6">
            <div>
              <InteractiveMap
                value={values.location}
                onChange={(value: ZoneData | null) =>
                  setFieldValue('location', value)
                }
                exactStoreLocation={values.exactStoreLocation}
                onExactStoreLocationChange={(value) =>
                  setFieldValue('exactStoreLocation', value)
                }
                exactStoreLocationLabel={t('exactStoreLocationLabel')}
                exactStoreLocationDescription={t(
                  'exactStoreLocationDescription',
                )}
                exactStoreLocationLatitudeLabel={t(
                  'exactStoreLocationLatitude',
                )}
                exactStoreLocationLongitudeLabel={t(
                  'exactStoreLocationLongitude',
                )}
                hideZoomControls
                searchSelectsMarker
              />
              {(touched.location || submitCount > 0) && errors.location ? (
                <div className="text-destructive text-sm mt-1">
                  {errors.location as string}
                </div>
              ) : null}
              {(touched.exactStoreLocation || submitCount > 0) &&
              errors.exactStoreLocation ? (
                <div className="text-destructive text-sm mt-1">
                  {errors.exactStoreLocation as string}
                </div>
              ) : null}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-4">{t('timings')}</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="space-y-1">
                    {dayMapping.map((day) => (
                      <DayTimingRow
                        key={day.key}
                        day={t(`days.${day.key}`)}
                        value={values.storeTimings[day.key]}
                        onChange={(dayTimings) =>
                          setFieldValue(`storeTimings.${day.key}`, dayTimings)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
              <AppButton
                type="button"
                variant="secondary"
                onClick={onBack}
                className="px-8 h-10 rounded-[12px]"
              >
                {t('backButton')}
              </AppButton>
              <AppButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-8 h-10 rounded-[12px]"
              >
                {t('saveNextButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
