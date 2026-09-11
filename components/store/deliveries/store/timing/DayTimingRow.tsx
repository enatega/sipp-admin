'use client';

import { TWeekDay } from '@/types';
import { CircleMinusIcon, CirclePlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

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

type SetWeekTimings = React.Dispatch<
  React.SetStateAction<EditableStoreTiming | null>
>;

interface DayTimingRowProps {
  dayKey: TWeekDay;
  data: EditableDayTiming;
  setWeekTimings: SetWeekTimings;
}

export const DayTimingRow = ({
  dayKey,
  data,
  setWeekTimings,
}: DayTimingRowProps) => {
  const t = useTranslations('storeTiming');
  const tDays = useTranslations('storeTiming.days');

  const dayLabelMap: Record<TWeekDay, string> = {
    monday: tDays('MON'),
    tuesday: tDays('TUE'),
    wednesday: tDays('WED'),
    thursday: tDays('THU'),
    friday: tDays('FRI'),
    saturday: tDays('SAT'),
    sunday: tDays('SUN'),
  };

  const updateDay = (updated: EditableDayTiming) => {
    setWeekTimings((prev) => {
      if (!prev) return prev;
      return { ...prev, [dayKey]: updated };
    });
  };

  const addTimeSlot = () => {
    updateDay({
      ...data,
      slots: [
        ...data.slots,
        {
          id: String(Date.now()),
          open: '09:00',
          close: '17:00',
        },
      ],
    });
  };

  const removeTimeSlot = (id: string) => {
    updateDay({
      ...data,
      slots: data.slots.filter((slot) => slot.id !== id),
    });
  };

  const updateSlot = (id: string, field: 'open' | 'close', value: string) => {
    updateDay({
      ...data,
      slots: data.slots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot,
      ),
    });
  };

  return (
    <div className="py-4 border-b border-gray-200 last:border-0">
      <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
        {/* Left */}
        <div className="flex items-center gap-x-4 w-36">
          <Switch
            checked={data.is_active}
            onCheckedChange={(checked) =>
              updateDay({ ...data, is_active: checked as boolean })
            }
          />
          <h4 className="font-medium text-sm">{dayLabelMap[dayKey]}</h4>
        </div>

        {/* Center */}
        {!data.is_active ? (
          <div className="flex-1 mt-3 md:mt-0">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              {t('closed')}
            </Badge>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between max-w-md gap-4 mt-3 md:mt-0">
            <input
              type="time"
              value={data.slots[0]?.open}
              onChange={(e) =>
                updateSlot(data.slots[0].id, 'open', e.target.value)
              }
              className="h-10 w-full md:w-40 rounded-lg border border-gray-300 px-3 text-sm"
            />
            <span className="hidden md:block">{t('timeSeparator')}</span>
            <input
              type="time"
              value={data.slots[0]?.close}
              onChange={(e) =>
                updateSlot(data.slots[0].id, 'close', e.target.value)
              }
              className="h-10 w-full md:w-40 rounded-lg border border-gray-300 px-3 text-sm"
            />
          </div>
        )}

        {data.is_active && (
          <CirclePlusIcon
            className="w-5 h-5 text-primary cursor-pointer"
            onClick={addTimeSlot}
          />
        )}
      </div>

      {/* Additional slots */}
      {data.is_active &&
        data.slots.slice(1).map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between gap-6 mt-3 flex-wrap md:flex-nowrap"
          >
            <div className="w-36 hidden md:block"></div>

            <div className="flex-1 flex items-center justify-between max-w-md gap-4 mt-3 md:mt-0">
              <input
                type="time"
                value={slot.open}
                onChange={(e) => updateSlot(slot.id, 'open', e.target.value)}
                className="h-10 w-full md:w-40 rounded-lg border border-gray-300 px-3 text-sm"
              />
              <span className="hidden md:block">{t('timeSeparator')}</span>
              <input
                type="time"
                value={slot.close}
                onChange={(e) => updateSlot(slot.id, 'close', e.target.value)}
                className="h-10 w-full md:w-40 rounded-lg border border-gray-300 px-3 text-sm"
              />
            </div>

            <CircleMinusIcon
              className="w-5 h-5 text-red-500 cursor-pointer"
              onClick={() => removeTimeSlot(slot.id)}
            />
          </div>
        ))}
    </div>
  );
};
