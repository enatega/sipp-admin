'use client';

import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { CategoryFormData } from '@/types';
import { AppInputField } from '@/components/shared/form/AppInput';
import { Switch } from '@/components/ui/switch';

export function CategoryScheduleFields() {
  const t = useTranslations('categories.form');
  const { values, setFieldValue, setFieldTouched } =
    useFormikContext<CategoryFormData>();

  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-stroke p-4">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="schedule-category-availability" className="text-[15px] font-medium">
          {t('scheduleAvailabilityLabel')}
        </label>
        <Switch
          id="schedule-category-availability"
          checked={values.scheduleAvailability}
          onCheckedChange={(checked) => {
            void setFieldValue('scheduleAvailability', checked);
            void setFieldTouched('scheduleAvailability', true);
          }}
          aria-describedby="schedule-category-availability-helper"
        />
      </div>
      <p id="schedule-category-availability-helper" className="text-sm text-muted-foreground">
        {t('scheduleAvailabilityHelper')}
      </p>
      {values.scheduleAvailability ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <AppInputField
            name="availableFrom"
            type="time"
            label={t('availableFromLabel')}
            requiredAsterisk
          />
          <AppInputField
            name="availableTo"
            type="time"
            label={t('availableToLabel')}
            requiredAsterisk
          />
        </div>
      ) : null}
    </fieldset>
  );
}
