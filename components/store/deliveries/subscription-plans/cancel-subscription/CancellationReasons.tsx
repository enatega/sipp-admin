'use client';

import { useState } from 'react';
import { AlertTriangle, Circle } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const reasons = [
  'Too expensive',
  'Not using it enough',
  'Switching to another platform',
  'Missing features I need',
  "Temporary pause - I'll come back",
  'Other',
];

export function CancellationReasons() {
  const [selectedReason, setSelectedReason] = useState<string>('Other');

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#F2B74A] bg-[#FFF9E8] p-4">
        <p className="mb-2 flex items-center gap-2 text-[#B45309]"><AlertTriangle className="size-4" /> Heads up - you&apos;ll lose these benefits</p>
        <div className="space-y-1 text-[#B45309]">
          <p>× Featured store placement</p>
          <p>× Homepage promotion</p>
          <p>× Homepage banner promotion</p>
          <p>× Push notification campaigns</p>
          <p>× Priority search ranking</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-medium">Before you go, would any of these help?</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="font-medium mb-1">Switch to a cheaper plan</p>
            <p className="text-mute">Try Default Plan - $0/mo</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium mb-1">Pause for 30 days</p>
            <p className="text-mute">Keep your data, skip billing</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium mb-1">Talk to support</p>
            <p className="text-mute">We&apos;ll help fix any issue</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-medium">Why are you cancelling?</h3>
        <p className="text-mute">Your feedback helps us improve.</p>

        <div className="mt-3 space-y-2">
          {reasons.map((reason) => (
            <button
              key={reason}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-md border px-3 py-3 text-left',
                selectedReason === reason ? 'border-primary bg-primary/5' : 'border-stroke',
              )}
              onClick={() => setSelectedReason(reason)}
            >
              <Circle className={cn('size-4', selectedReason === reason ? 'text-primary fill-primary/20' : 'text-mute')} />
              <span>{reason}</span>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <p className="mb-2 font-medium">Anything else? (optional)</p>
          <Textarea placeholder="Tell us more so we can do better..." className="min-h-[84px]" />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-start gap-2">
          <Checkbox checked className='mt-1' />
          <div className='text-sm'>
            <p className='font-medium'>I understand my plan will end on May 26, 2026</p>
            <p className="text-mute">After this date, the store moves to the free Default Plan and the commission rate increases to 20%.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <AppButton variant="secondary">Keep My Plan</AppButton>
        <AppButton variant="mute" className="border-help-red text-help-red hover:bg-help-red/10 hover:text-help-red">
          Continue to Cancel
        </AppButton>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="rounded-full bg-help-red/10 p-2 text-help-red"><AlertTriangle className="size-4" /></span>
          <div>
            <p className="font-medium">Confirm cancellation</p>
            <p className="text-mute text-[15px]">This will cancel your Basic Plan. You&apos;ll keep access until May 26, 2026.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <AppButton variant="secondary" size="sm">Go back</AppButton>
          <AppButton variant="red" size="sm">Confirm cancellation</AppButton>
        </div>
      </div>
    </div>
  );
}
