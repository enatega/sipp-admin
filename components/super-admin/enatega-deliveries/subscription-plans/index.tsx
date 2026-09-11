'use client';

import { useMemo, useState } from 'react';
import { ApiErrorResponse, SubscriptionPlan } from '@/types';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useGetSubscriptionPlans,
  useUpdateSubscriptionPlan,
} from '@/hooks/api/super-admin/enatega-deliveries/subscription-plans';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import NoDataFound from '@/components/shared/NoDataFound';
import AppLoader from '@/components/shared/AppLoader';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { SubscriptionPlanDialog } from './SubscriptionPlanDialog';

export function SubscriptionPlansPage() {
  const t = useTranslations('enategaDeliveriesPages.subscriptionPlans');
  const tDelete = useTranslations('enategaDeliveriesPages.subscriptionPlans.deleteDialog');

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  const { data: plans, isLoading, isError, error } = useGetSubscriptionPlans();

  const { mutateAsync: createPlan, isPending: isCreating } = useCreateSubscriptionPlan();
  const { mutateAsync: updatePlan, isPending: isUpdating } = useUpdateSubscriptionPlan();
  const { mutateAsync: deletePlan, isPending: isDeleting } = useDeleteSubscriptionPlan();

  const groupedFeatures = useMemo(() => {
    const featureMap = new Map<string, { id: string; title: string; type: string }>();
    (plans || []).forEach((plan) => {
      plan.planFeatures.forEach((feature) => {
        if (!featureMap.has(feature.id)) {
          featureMap.set(feature.id, {
            id: feature.id,
            title: feature.title,
            type: feature.type || 'general',
          });
        }
      });
    });

    return Array.from(featureMap.values()).reduce<Record<string, { id: string; title: string }[]>>(
      (acc, feature) => {
        const key = feature.type || 'general';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({ id: feature.id, title: feature.title });
        return acc;
      },
      {},
    );
  }, [plans]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPlan?.id) return;

    try {
      const response = await deletePlan(deletingPlan.id);
      toast.success(response.message || t('toasts.deleteSuccess'));
      setDeletingPlan(null);
    } catch (err) {
      handleApiError(err as ApiErrorResponse);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading title={t('title')} />

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-accent p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-mute hover:text-darkblack'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-white'
                  : 'text-mute hover:text-darkblack'
              }`}
            >
              {t('yearly')}
            </button>
          </div>

          <AppButton leftIcon={<CirclePlus className="size-4" />} onClick={handleOpenCreate}>
            {t('createNewPlan')}
          </AppButton>
        </div>
      </div>

      {isLoading ? (
        <AppLoader />
      ) : isError ? (
        <DisplayError
          title={t('errors.fetchTitle')}
          message={returnErrorMessage(error as ApiErrorResponse) || t('errors.fetchDescription')}
        />
      ) : !plans?.length ? (
        <NoDataFound title={t('emptyTitle')} subtitle={t('emptySubtitle')} />
      ) : (
        <div className="flex gap-4 flex-wrap ">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              featureGroups={groupedFeatures}
              onEdit={handleOpenEdit}
              onDelete={setDeletingPlan}
            />
          ))}
        </div>
      )}

      <SubscriptionPlanDialog
        open={isDialogOpen}
        plan={editingPlan}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPlan(null);
          }
        }}
        isSubmitting={isCreating || isUpdating}
        onCreate={async (payload) => {
          try {
            await createPlan(payload);
            toast.success(t('toasts.createSuccess'));
            setIsDialogOpen(false);
          } catch (err) {
            handleApiError(err as ApiErrorResponse);
          }
        }}
        onUpdate={async (id, payload) => {
          try {
            await updatePlan({ id, payload });
            toast.success(t('toasts.updateSuccess'));
            setIsDialogOpen(false);
            setEditingPlan(null);
          } catch (err) {
            handleApiError(err as ApiErrorResponse);
          }
        }}
      />

      <AppAlertDialog
        open={!!deletingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPlan(null);
          }
        }}
        variant="delete"
        title={tDelete('title')}
        subTitle={tDelete('subTitle')}
        description={tDelete('description')}
        confirmLabel={tDelete('confirm')}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
