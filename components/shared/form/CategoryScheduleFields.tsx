'use client';

import { getIn, useFormikContext } from 'formik';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CategoryAvailabilityDay, CategoryFormData } from '@/types';
import { AppInputField } from '@/components/shared/form/AppInput';
import { Switch } from '@/components/ui/switch';
import {
  CATEGORY_SCHEDULE_WEEK,
  CATEGORY_SCHEDULE_WEEKDAYS,
  CATEGORY_SCHEDULE_WEEKEND,
  sortAvailabilityDays,
} from '@/lib/category-schedule';
import { cn } from '@/lib/utils';

// 2024-01-07 is a Sunday, so adding `day` yields that weekday.
const weekdayName = (locale: string, day: number, weekday: 'short' | 'long') =>
  new Intl.DateTimeFormat(locale, { weekday, timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, 0, 7 + day)),
  );

export function CategoryScheduleFields() {
  const t = useTranslations('categories.form');
  const locale = useLocale();
  const { values, errors, touched, submitCount, setFieldValue, setFieldTouched } =
    useFormikContext<CategoryFormData>();

  const days = values.availabilityDays ?? [];
  const selected = new Set(days.map((entry) => entry.day));
  const names = useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_SCHEDULE_WEEK.map((day) => [
          day,
          {
            short: weekdayName(locale, day, 'short'),
            long: weekdayName(locale, day, 'long'),
          },
        ]),
      ) as Record<number, { short: string; long: string }>,
    [locale],
  );

  // New days start with the first configured day's hours, so "same hours" is one click per day.
  const template = (): Pick<CategoryAvailabilityDay, 'from' | 'to'> => ({
    from: days[0]?.from ?? '',
    to: days[0]?.to ?? '',
  });

  const setDays = (next: CategoryAvailabilityDay[]) => {
    void setFieldValue('availabilityDays', sortAvailabilityDays(next));
    void setFieldTouched('availabilityDays', true, false);
  };

  const toggleDay = (day: number) => {
    setDays(
      selected.has(day)
        ? days.filter((entry) => entry.day !== day)
        : [...days, { day, ...template() }],
    );
  };

  const applyPreset = (preset: readonly number[]) => {
    const base = template();
    setDays(
      preset.map(
        (day) => days.find((entry) => entry.day === day) ?? { day, ...base },
      ),
    );
  };

  const applyFirstHoursToAll = () => {
    const base = template();
    setDays(days.map((entry) => ({ ...entry, ...base })));
  };

  const daysError = getIn(errors, 'availabilityDays');
  const showDaysError =
    typeof daysError === 'string' &&
    (Boolean(getIn(touched, 'availabilityDays')) || submitCount > 0);

  const presets = [
    { key: 'presetEveryDay', days: CATEGORY_SCHEDULE_WEEK },
    { key: 'presetWeekdays', days: CATEGORY_SCHEDULE_WEEKDAYS },
    { key: 'presetWeekends', days: CATEGORY_SCHEDULE_WEEKEND },
  ] as const;

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span id="category-schedule-days-label" className="text-[15px] font-medium">
                {t('availableDaysLabel')}
                <span className="text-destructive"> *</span>
              </span>
              <div className="flex flex-wrap gap-3 text-sm">
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className="text-ink underline-offset-2 hover:underline"
                    onClick={() => applyPreset(preset.days)}
                  >
                    {t(preset.key)}
                  </button>
                ))}
              </div>
            </div>
            <div
              role="group"
              aria-labelledby="category-schedule-days-label"
              className="flex flex-wrap gap-2"
            >
              {CATEGORY_SCHEDULE_WEEK.map((day) => {
                const active = selected.has(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    aria-label={names[day].long}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'min-w-12 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border-ink bg-primary text-primary-foreground'
                        : 'border-stroke bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {names[day].short}
                  </button>
                );
              })}
            </div>
            {showDaysError ? (
              <p className="text-sm text-destructive" role="alert">
                {daysError}
              </p>
            ) : null}
          </div>

          {days.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[4.5rem_1fr_1fr] gap-2 text-sm font-medium">
                <span />
                <span>{t('availableFromLabel')}</span>
                <span>{t('availableToLabel')}</span>
              </div>
              {days.map((entry, index) => (
                <div
                  key={entry.day}
                  className="grid grid-cols-[4.5rem_1fr_1fr] items-start gap-2"
                >
                  <span className="pt-2.5 text-sm font-medium">
                    {names[entry.day].short}
                  </span>
                  <AppInputField
                    name={`availabilityDays.${index}.from`}
                    type="time"
                    aria-label={`${names[entry.day].long} ${t('availableFromLabel')}`}
                  />
                  <div className="flex flex-col gap-1">
                    <AppInputField
                      name={`availabilityDays.${index}.to`}
                      type="time"
                      aria-label={`${names[entry.day].long} ${t('availableToLabel')}`}
                    />
                    {entry.from && entry.to && entry.to < entry.from ? (
                      <span className="text-xs text-muted-foreground">
                        {t('endsNextDay')}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
              {days.length > 1 ? (
                <button
                  type="button"
                  className="self-start text-sm text-ink underline-offset-2 hover:underline"
                  onClick={applyFirstHoursToAll}
                >
                  {t('applyFirstHoursToAll', { day: names[days[0].day].long })}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
