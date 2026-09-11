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
            open: slot.open,
            close: slot.close,
          })) ?? [],
      };
    });

    // Defer state update to next tick
    const timer = setTimeout(() => {
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
    if (!weekTimings) return;

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

      {isLoading || !weekTimings ? (
        <CardShimmer />
      ) : isError ? (
        <DisplayError
          title={t('fetchFailedTitle')}
          message={returnErrorMessage(error)}
          variant="error"
        />
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
                disabled={isPending}
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
