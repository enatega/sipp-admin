'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { TWeekDay } from '@/types';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateStoreData } from '@/hooks/api/store/deliveries/profile';
import { useGetStoreTiming } from '@/hooks/api/store/deliveries/store-timing';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import { DayTimingRow } from './DayTimingRow';

const WEEK_DAYS: TWeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_WITH_ZERO_SECONDS_REGEX = /^([01]\d|2[0-3]):[0-5]\d:00$/;

// Migrated MySQL TIME values can include zero seconds. The time input displays
// only hours/minutes, so normalize before validating or submitting unchanged data.
const normalizeEditorTime = (time: string, isClosingTime = false): string => {
  if (TIME_WITH_ZERO_SECONDS_REGEX.test(time)) return time.slice(0, 5);
  if (isClosingTime && time === '23:59:59') return '00:00';
  return time;
};

interface EditableTimeSlot {
  id: string;
  open: string;
  close: string;
}

interface EditableDayTiming {
  is_active: boolean;
  slots: EditableTimeSlot[];
}

type EditableStoreTiming = Record<TWeekDay, EditableDayTiming>;

// Compare only fields sent to the API; row IDs exist solely for editing.
const timingSnapshot = (timings: EditableStoreTiming): string =>
  JSON.stringify(
    WEEK_DAYS.map((day) => ({
      is_active: timings[day].is_active,
      slots: timings[day].slots.map(({ open, close }) => ({ open, close })),
    })),
  );

const StoreTiming = () => {
  const t = useTranslations('storeTiming');
  const tCommon = useTranslations('common');
  const params = useParams();
  const storeId = params?.storeId as string;
  const { data, isLoading, isError, error } = useGetStoreTiming(storeId);
  const { mutateAsync: updateStore, isPending } = useUpdateStoreData();
  const [weekTimings, setWeekTimings] = useState<EditableStoreTiming | null>(
    null,
  );
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const currentSnapshot = weekTimings ? timingSnapshot(weekTimings) : null;
  const hasChanges =
    currentSnapshot !== null &&
    savedSnapshot !== null &&
    currentSnapshot !== savedSnapshot;

  // Initialize state from API
  useEffect(() => {
    if (!data?.store_timings) return;

    const formatted: EditableStoreTiming = {} as EditableStoreTiming;

    WEEK_DAYS.forEach((day) => {
      const apiDay = data.store_timings[day];

      formatted[day] = {
        is_active: apiDay?.is_active ?? false,
        slots:
          apiDay?.slots?.map((slot, index) => ({
            id: String(index + 1),
            open: normalizeEditorTime(slot.open),
            close: normalizeEditorTime(slot.close, true),
          })) ?? [],
      };
    });

    // Defer state update to next tick
    const timer = setTimeout(() => {
      setSavedSnapshot(timingSnapshot(formatted));
      setWeekTimings((prev) => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(formatted);
        if (prevStr !== newStr) return formatted;
        return prev;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [data]);

  const handleSave = async () => {
    if (!weekTimings || !hasChanges || isPending) return;

    const submittedSnapshot = timingSnapshot(weekTimings);

    const hasIncompleteActiveDay = WEEK_DAYS.some((day) => {
      const timing = weekTimings[day];
      return (
        timing.is_active &&
        (timing.slots.length === 0 ||
          timing.slots.some(
            (slot) =>
              !TIME_24H_REGEX.test(slot.open) ||
              !TIME_24H_REGEX.test(slot.close),
          ))
      );
    });
    if (hasIncompleteActiveDay) {
      toast.error(t('incompleteHours'));
      return;
    }

    const payload = {
      storeId,
      storeTimings: Object.fromEntries(
        Object.entries(weekTimings).map(([day, value]) => [
          day,
          {
            is_active: value.is_active,
            slots: value.slots.map((slot) => ({
              open: slot.open,
              close: slot.close,
            })),
          },
        ]),
      ),
    };
    try {
      const response = await updateStore(payload);
      setSavedSnapshot(submittedSnapshot);
      toast.success(response.message || t('updateSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Heading title={t('title')} />
      </div>

      {isError ? (
        <DisplayError
          title={t('fetchFailedTitle')}
          message={returnErrorMessage(error)}
          variant="error"
        />
      ) : isLoading || !weekTimings ? (
        <CardShimmer />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden xl:max-w-2/3">
          <div className="p-6 space-y-1">
            {WEEK_DAYS.map((day) => (
              <DayTimingRow
                key={day}
                dayKey={day}
                data={weekTimings[day]}
                setWeekTimings={setWeekTimings}
              />
            ))}

            {/* Save Section */}
            <div className="flex justify-end pt-6 border-t mt-6">
              <AppButton
                isLoading={isPending}
                disabled={!hasChanges}
                aria-busy={isPending}
                onClick={handleSave}
                className="px-6 py-2 rounded-lg"
              >
                {tCommon('save')}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreTiming;
