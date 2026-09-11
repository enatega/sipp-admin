'use client';

import { Heading } from '@/components/shared/Heading';
import { CancellationReasons } from './CancellationReasons';
import { PlanSummaryCard } from './PlanSummaryCard';

export function CancelSubscriptionPage() {
  return (
    <div className="space-y-6">
      <Heading
        showBackBtn
        title="Cancel Subscription"
        subTitle="We are sorry to see you go, Let us know what we could improve."
      />

      <div className="rounded-xl bg-accent/30 p-4">
        <div className="grid gap-4 xl:grid-cols-[2.2fr_1.2fr]">
          <CancellationReasons />
          <PlanSummaryCard />
        </div>
      </div>
    </div>
  );
}
