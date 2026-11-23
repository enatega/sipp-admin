'use client';

import Link from 'next/link';
import { BadgeCheck, CalendarDays, DollarSign, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AppButton } from '@/components/shared/AppButton';

type CurrentPlanCardModel = {
  planName?: string;
  planDescription?: string | null;
  commissionRate?: number | null;
  isCancelled?: boolean | null;
  cancelPeriodEnd?: string | null;
};

type Props = {
  plan?: CurrentPlanCardModel | null;
  nextRenewal?: string;
  billingCycle?: string;
  amount?: string;
  onCancelPlan?: () => void;
};

export function CurrentPlanCard({
  plan,
  nextRenewal = 'N/A',
  billingCycle = 'N/A',
  amount = 'N/A',
  onCancelPlan,
}: Props) {
  if (!plan) {
    return (
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent p-3 text-mute">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-darkblack">
              No Current Plan
            </h3>
            <p className="text-sm text-mute">
              You are currently on the default free tier. Select a plan below to
              subscribe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {plan.isCancelled ? (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You have cancelled your subscription. Your plan will end on{' '}
          <span className="font-medium">{plan.cancelPeriodEnd || 'N/A'}</span>{' '}
          and will not auto-renew.
        </div>
      ) : null}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-darkblack">
                  {plan?.planName || 'Current Plan'}
                </h3>
                <Badge className="bg-help-green text-white hover:bg-help-green">
                  Active
                </Badge>
              </div>
              <p className="text-mute text-sm">
                {plan?.planDescription || 'Get started with the essentials'} .{' '}
                {plan?.commissionRate ?? 0}% commission
              </p>
              <div className="mt-4 flex gap-2">
                <Link href="subscription-plans/billing-history">
                  <AppButton variant="secondary" size="sm">
                    Billing History
                  </AppButton>
                </Link>
                {!plan.isCancelled ? (
                  <AppButton
                    variant="mute"
                    size="sm"
                    className="border-help-red text-help-red hover:bg-help-red/10 hover:text-help-red"
                    onClick={onCancelPlan}
                  >
                    Cancel Plan
                  </AppButton>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid min-w-[320px] grid-cols-3 gap-3 rounded-lg bg-accent p-4">
            <div className="border-r pr-3">
              <p className="flex items-center gap-1 text-mute font-medium mb-1">
                <CalendarDays className="size-4" /> Next renewal
              </p>
              <p className="text-darkblack">{nextRenewal}</p>
            </div>
            <div className="border-r pr-3">
              <p className="flex items-center gap-1 text-mute font-medium mb-1">
                <BadgeCheck className="size-4" /> Billing
              </p>
              <p className="text-darkblack">{billingCycle}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-mute font-medium mb-1">
                <DollarSign className="size-4" /> Amount
              </p>
              <p className="text-darkblack">{amount}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
