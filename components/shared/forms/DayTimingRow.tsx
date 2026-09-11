'use client';

import type { DayTimings } from '@/shared/contracts/store';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleMinusIcon, CirclePlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const DEFAULT_SLOT = { open: '09:00', close: '17:00' };

interface DayTimingRowProps {
  day: string;
  value: DayTimings;
  onChange: (dayTimings: DayTimings) => void;
}

export function DayTimingRow({ day, value, onChange }: DayTimingRowProps) {
  const t = useTranslations('storeTiming');
  const isOpen = value.is_active;
  const hasSlots = value.slots.length > 0;

  const handleOpenToggle = (checked: boolean) => {
    onChange({
      is_active: checked,
      slots: checked
        ? hasSlots
          ? value.slots
          : [DEFAULT_SLOT]
        : [],
    });
  };

  const addTimeSlot = () => {
    onChange({
      ...value,
      slots: [...value.slots, { open: '09:00', close: '17:00' }],
    });
  };

  const removeTimeSlot = (index: number) => {
    onChange({
      ...value,
      slots: value.slots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (
    index: number,
    field: 'open' | 'close',
    timeValue: string,
  ) => {
    const slots = hasSlots ? value.slots : [DEFAULT_SLOT];

    onChange({
      ...value,
      slots: slots.map((slot, i) =>
        i === index ? { ...slot, [field]: timeValue } : slot,
      ),
    });
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-0">
      <div className="flex items-center justify-between gap-6">
        <div className="flex w-36 items-center gap-x-4">
          <Switch checked={isOpen} onCheckedChange={handleOpenToggle} />
          <h4 className="text-sm font-medium">{day}</h4>
        </div>

        {!isOpen ? (
          <div className="flex-1">
            <Badge
              variant="secondary"
              className="bg-primary px-4 py-1.5 text-sm text-white"
            >
              {t('closed')}
            </Badge>
          </div>
        ) : (
          <div className="flex max-w-md flex-1 items-center justify-between">
            <input
              type="time"
              className="h-10 w-40 rounded-lg border border-gray-300 px-3 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              value={(hasSlots ? value.slots[0] : DEFAULT_SLOT).open}
              onChange={(e) => updateTimeSlot(0, 'open', e.target.value)}
            />
            <span className="font-medium text-gray-400">--</span>
            <input
              type="time"
              className="h-10 w-40 rounded-lg border border-gray-300 px-3 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              value={(hasSlots ? value.slots[0] : DEFAULT_SLOT).close}
              onChange={(e) => updateTimeSlot(0, 'close', e.target.value)}
            />
          </div>
        )}

        {isOpen && (
          <div className="flex items-center gap-2">
            <CirclePlusIcon
              className="h-5 w-5 cursor-pointer text-primary transition-transform hover:scale-110"
              onClick={addTimeSlot}
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {value.slots.slice(1).map((slot, index) => (
          <motion.div
            key={index + 1}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="mt-3 flex items-center justify-between gap-6"
          >
            <div className="w-36" />

            <div className="flex max-w-md flex-1 items-center justify-between">
              <input
                type="time"
                className="h-10 w-40 rounded-lg border border-gray-300 px-3 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                value={slot.open}
                onChange={(e) =>
                  updateTimeSlot(index + 1, 'open', e.target.value)
                }
              />
              <span className="font-medium text-gray-400">--</span>
              <input
                type="time"
                className="h-10 w-40 rounded-lg border border-gray-300 px-3 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                value={slot.close}
                onChange={(e) =>
                  updateTimeSlot(index + 1, 'close', e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <CircleMinusIcon
                className="h-5 w-5 cursor-pointer text-red-500 transition-transform hover:scale-110"
                onClick={() => removeTimeSlot(index + 1)}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
