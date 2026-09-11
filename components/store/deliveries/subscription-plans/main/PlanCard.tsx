'use client';

import { Star } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan } from '@/types';

type Props = {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  currentPlanId?: string;
  onCheckout: (plan: SubscriptionPlan) => void;
  isProcessing?: boolean;
};

export function PlanCard({
  plan,
  billingCycle,
  currentPlanId,
  onCheckout,
  isProcessing = false,
}: Props) {
  const isCurrentPlan = Boolean(currentPlanId && currentPlanId === plan.id);
  const hasCurrentPlan = Boolean(currentPlanId);
  const groupedFeatures = plan.planFeatures.reduce<Record<string, string[]>>((acc, item) => {
    const key = item.type || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.title);
    return acc;
  }, {});

  return (
    <div
      className={`relative rounded-xl border bg-white p-3.5 ${plan.isRecommended ? 'border-primary/60' : 'border-stroke'}`}
    >

      {isCurrentPlan ? (
          <Badge className="absolute top-3 right-3 bg-help-green text-white hover:bg-help-green">Active</Badge>
        ) : null}
      {plan.isRecommended ? (
        <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">
          <Star className="size-3" /> Recommended
        </span>
      ) : null}

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-darkblack">{plan.planName}</h4>
          <p className="mt-1 text-sm text-mute">{plan.planDescription || 'N/A'}</p>
        </div>
        
      </div>

      <div className="mb-4">
        <p className="text-4xl font-bold text-primary">
          ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
        </p>
        <p className="text-sm text-mute">/ {billingCycle === 'monthly' ? 'monthly' : 'yearly'}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-accent p-3">
        <div>
          <p className="text-xs text-mute">Commission</p>
          <p className="font-semibold text-primary">{plan.commissionRate}%</p>
        </div>
        <div>
          <p className="text-xs text-mute">Free Orders</p>
          <p className="font-semibold text-darkblack">
            {plan.isUnlimitedOrders ? 'Unlimited' : plan.freeOrdersIncluded}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-stroke pt-4">
        {Object.entries(groupedFeatures).map(([groupName, items]) => (
          <div key={groupName}>
            <p className="mb-2 text-sm font-medium capitalize text-mute">{groupName}</p>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-help-green">✓</span>
                  <span className="text-darkblack">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3">
        <AppButton
          className="w-full"
          variant={isCurrentPlan ? 'mute' : 'primary'}
          disabled={isCurrentPlan || isProcessing}
          isLoading={isProcessing}
          onClick={() => onCheckout(plan)}
        >
          {isCurrentPlan ? 'Current Plan' : hasCurrentPlan ? 'Update Plan' : 'Buy Plan'}
        </AppButton>
      </div>
    </div>
  );
}
