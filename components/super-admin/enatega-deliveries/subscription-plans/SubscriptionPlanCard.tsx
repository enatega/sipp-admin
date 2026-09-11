'use client';

import { PenLine, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SubscriptionPlan } from '@/types';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  featureGroups: Record<string, { id: string; title: string }[]>;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}

export function SubscriptionPlanCard({
  plan,
  billingCycle,
  featureGroups,
  onEdit,
  onDelete,
}: SubscriptionPlanCardProps) {
  const t = useTranslations('enategaDeliveriesPages.subscriptionPlans');

  const selectedFeatureIds = new Set(plan.planFeatures.map((item) => item.id));
  const fallbackGroups =
    Object.keys(featureGroups).length === 0
      ? {
          [t('features')]: plan.planFeatures.map((item) => ({
            id: item.id,
            title: item.title,
          })),
        }
      : featureGroups;

  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const periodLabel = billingCycle === 'monthly' ? t('monthlyShort') : t('yearlyShort');

  return (
    <div
      className={`w-[350px] relative rounded-xl border bg-white p-5 ${
        plan.isRecommended ? 'border-primary/60' : 'border-stroke'
      }`}
    >
      {plan.isRecommended ? (
        <span className="absolute -top-4 left-5 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {t('recommended')}
        </span>
      ) : null}

      <div className="w-full mb-4 flex items-start justify-between gap-3">
        <div className='h-[80px]'>
          <h3 className="text-lg font-semibold text-darkblack">{plan.planName}</h3>
          <p className="mt-1 text-sm text-mute">
            {plan.planDescription || t('notAvailable')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            className="text-mute transition-colors hover:text-primary"
            aria-label={t('editPlan')}
          >
            <PenLine className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(plan)}
            className="text-help-red transition-colors hover:text-help-red/80"
            aria-label={t('deletePlan')}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-4xl font-bold text-primary">${price}</p>
        <p className="text-sm text-mute">/{periodLabel}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-accent p-3">
        <div>
          <p className="text-xs text-mute">{t('commission')}</p>
          <p className="font-semibold text-primary">{plan.commissionRate}%</p>
        </div>
        <div>
          <p className="text-xs text-mute">{t('freeOrders')}</p>
          <p className="font-semibold text-darkblack">
            {plan.isUnlimitedOrders ? t('unlimited') : plan.freeOrdersIncluded}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-stroke pt-4">
        {Object.entries(fallbackGroups).map(([groupName, items]) => (
          <div key={groupName}>
            <p className="mb-2 text-sm font-medium text-mute">{groupName}</p>
            <div className="space-y-1.5">
              {items.map((feature) => {
                const included = selectedFeatureIds.has(feature.id);
                return (
                  <div key={feature.id} className="flex items-center gap-2 text-sm">
                    <span className={included ? 'text-emerald-600' : 'text-mute'}>
                      {included ? '✓' : '×'}
                    </span>
                    <span className={included ? 'text-darkblack' : 'text-mute'}>
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-stroke pt-4">
        <span
          className={`inline-flex rounded-full px-4 py-1 text-sm font-medium ${
            plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {plan.isActive ? t('active') : t('inactive')}
        </span>
      </div>
    </div>
  );
}
