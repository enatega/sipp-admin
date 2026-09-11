'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heading } from '@/components/shared/Heading';
import AppLoader from '@/components/shared/AppLoader';
import DisplayError from '@/components/shared/DisplayError';
import { useGetSubscriptionPlans } from '@/hooks/api/deliveries/subscription-plans';
import {
  useCancelStoreSubscriptionPlan,
  useGetStoreCurrentSubscriptionPlan,
} from '@/hooks/api/store/deliveries/subscription-plan';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';
import {
  useCreateVendorSubscriptionCheckoutSession,
  useCreateVendorSubscriptionUpdateCheckoutSession,
} from '@/hooks/api/vendor/deliveries/subscription-plan';
import { ApiErrorResponse, SubscriptionPlan } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { EmbeddedCheckoutDialog } from '@/components/vendor/deliveries/stores/subscription-plan/EmbeddedCheckoutDialog';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { BillingCycleToggle } from './BillingCycleToggle';
import { CurrentPlanCard } from './CurrentPlanCard';
import { PlanCard } from './PlanCard';

export function SubscriptionPlansPage() {
  const { storeId } = useParams() as { storeId: string };
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
  } = useGetSubscriptionPlans();

  const {
    data: currentPlanResponse,
    isLoading: isCurrentPlanLoading,
    isError: isCurrentPlanError,
    error: currentPlanError,
    refetch: refetchCurrentPlan,
  } = useGetStoreCurrentSubscriptionPlan(storeId);
  const { data: storeProfile } = useGetStoreProfile(storeId);
  const [embeddedClientSecret, setEmbeddedClientSecret] = useState('');
  const [checkoutSessionId, setCheckoutSessionId] = useState('');
  const [isEmbeddedOpen, setIsEmbeddedOpen] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string>('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const rawCurrentPlan = currentPlanResponse?.currentPlan;
  const normalizedCurrentPlan =
    rawCurrentPlan && rawCurrentPlan.planId
      ? {
          id: rawCurrentPlan.planId,
          planName: rawCurrentPlan.plan || 'Current Plan',
          planDescription: rawCurrentPlan.planDescription || '',
          monthlyPrice: rawCurrentPlan.monthlyPrice ?? 0,
          yearlyPrice: rawCurrentPlan.yearlyPrice ?? 0,
          commissionRate: rawCurrentPlan.commissionRate ?? 0,
          isCancelled: rawCurrentPlan.isCancelled ?? false,
          cancelPeriodEnd: rawCurrentPlan.cancelPeriodEnd
            ? new Date(rawCurrentPlan.cancelPeriodEnd).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : null,
        }
      : null;

  const currentPlan =
    normalizedCurrentPlan ||
    currentPlanResponse?.selectedPlan ||
    currentPlanResponse?.plan ||
    null;
  const currentPlanId =
    rawCurrentPlan?.planId ||
    currentPlanResponse?.selectedPlan?.id ||
    currentPlanResponse?.plan?.id ||
    undefined;

  const amountValue =
    rawCurrentPlan?.price ??
    currentPlanResponse?.cards?.amount ??
    currentPlanResponse?.latestInvoice?.amount ??
    (billingCycle === 'monthly' ? currentPlan?.monthlyPrice : currentPlan?.yearlyPrice);

  const amount =
    amountValue === undefined || amountValue === null
      ? 'N/A'
      : typeof amountValue === 'number'
        ? `$${amountValue}`
        : String(amountValue);

  const nextRenewal =
    (rawCurrentPlan?.nextRenewalDate
      ? new Date(rawCurrentPlan.nextRenewalDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null) ||
    currentPlanResponse?.cards?.nextRenewal ||
    currentPlanResponse?.cards?.nextCharge ||
    currentPlanResponse?.latestInvoice?.nextRenewal ||
    currentPlanResponse?.latestInvoice?.nextCharge ||
    'N/A';

  const billingLabel =
    rawCurrentPlan?.billing ||
    currentPlanResponse?.cards?.billing ||
    currentPlanResponse?.latestInvoice?.billingCycle ||
    'N/A';

  const storeEmail = storeProfile?.profile?.email || storeProfile?.contactInformation?.email || '';

  const handleCheckoutSessionSuccess = (res: {
    clientSecret?: string;
    client_secret?: string;
    sessionId?: string;
    session_id?: string;
    url?: string;
    message?: string;
  }) => {
    const clientSecretRaw = res.clientSecret || res.client_secret;
    const sessionId = res.sessionId || res.session_id || '';
    setProcessingPlanId('');

    if (clientSecretRaw) {
      const clientSecret = (() => {
        try {
          return decodeURIComponent(clientSecretRaw);
        } catch {
          return clientSecretRaw;
        }
      })();

      setCheckoutSessionId(sessionId);
      setEmbeddedClientSecret(clientSecret);
      setIsEmbeddedOpen(true);
      return;
    }

    if (res.url) {
      window.location.href = res.url;
      return;
    }

    toast.error(res.message || 'Failed to start checkout session.');
  };

  const { mutate: createCheckoutSession, isPending: isCheckoutPending } =
    useCreateVendorSubscriptionCheckoutSession({
      onSuccess: (res) => handleCheckoutSessionSuccess(res),
      onError: (error) => {
        setProcessingPlanId('');
        toast.error(returnErrorMessage(error as ApiErrorResponse));
      },
    });

  const { mutate: createUpdateCheckoutSession, isPending: isUpdateCheckoutPending } =
    useCreateVendorSubscriptionUpdateCheckoutSession({
      onSuccess: (res) => handleCheckoutSessionSuccess(res),
      onError: (error) => {
        setProcessingPlanId('');
        toast.error(returnErrorMessage(error as ApiErrorResponse));
      },
    });

  const { mutate: cancelPlan, isPending: isCancelPending } =
    useCancelStoreSubscriptionPlan({
      onSuccess: (res) => {
        toast.success(res?.message || 'Subscription cancelled successfully.');
        setIsCancelDialogOpen(false);
        void refetchCurrentPlan();
      },
      onError: (error) => {
        toast.error(returnErrorMessage(error as ApiErrorResponse));
      },
    });

  const refreshCurrentPlanState = useCallback(async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await refetchCurrentPlan();
      // Small delay to allow backend webhook/update propagation.
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }, [refetchCurrentPlan]);

  const handleCheckout = (plan: SubscriptionPlan) => {
    const priceId =
      billingCycle === 'monthly'
        ? plan.monthlyPriceId
        : plan.yearlyPriceId;

    if (!priceId) {
      toast.error('Selected plan price ID is missing.');
      return;
    }

    setProcessingPlanId(plan.id);
    const hasCurrentPlan = Boolean(rawCurrentPlan?.planId || currentPlan?.id);

    if (hasCurrentPlan) {
      createUpdateCheckoutSession({
        subscriptionPlanId: plan.id,
        storeId,
        stripePriceId: priceId,
        email: storeEmail || undefined,
      });
      return;
    }

    createCheckoutSession({
      priceId,
      storeId,
      planId: plan.id,
      planName: plan.planName,
      email: storeEmail || undefined,
    });
  };

  if (isPlansLoading || isCurrentPlanLoading) {
    return <AppLoader />;
  }

  if (isPlansError || isCurrentPlanError) {
    return (
      <DisplayError
        title="Failed to load subscription plans"
        message={
          returnErrorMessage((plansError || currentPlanError) as ApiErrorResponse) ||
          'Please try again later.'
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Heading
        title="Subscription Plans"
        subTitle="Manage your subscriptions, upgrade for more features, or change billing."
      />

      <CurrentPlanCard
        plan={currentPlan}
        nextRenewal={nextRenewal}
        billingCycle={billingLabel}
        amount={amount}
        onCancelPlan={() => setIsCancelDialogOpen(true)}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-darkblack">Available Plans</h3>
          <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />
        </div>

        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              currentPlanId={currentPlanId}
              onCheckout={handleCheckout}
              isProcessing={processingPlanId === plan.id && (isCheckoutPending || isUpdateCheckoutPending)}
            />
          ))}
        </div>
      </div>

      <EmbeddedCheckoutDialog
        open={isEmbeddedOpen}
        onClose={async () => {
          setIsEmbeddedOpen(false);
          const hadCheckoutSession = Boolean(checkoutSessionId || embeddedClientSecret);
          setEmbeddedClientSecret('');
          setCheckoutSessionId('');
          if (hadCheckoutSession) {
            await refreshCurrentPlanState();
          }
        }}
        clientSecret={embeddedClientSecret}
        onInitFailed={() => {
          if (!checkoutSessionId) return;
          const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
          if (!publishableKey) return;

          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/clover/stripe.js';
          script.onload = async () => {
            const stripe = window.Stripe?.(publishableKey);
            if (!stripe || !(stripe as unknown as { redirectToCheckout?: unknown }).redirectToCheckout) {
              return;
            }

            await (stripe as unknown as {
              redirectToCheckout: (opts: { sessionId: string }) => Promise<void>;
            }).redirectToCheckout({ sessionId: checkoutSessionId });
          };
          document.body.appendChild(script);
        }}
      />

      <AppAlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        variant="delete"
        title="Cancel Subscription"
        subTitle="Are you sure you want to cancel your current subscription?"
        description="This action will cancel your active plan subscription for this store."
        confirmLabel="Yes, Cancel Subscription"
        cancelLabel="Keep Subscription"
        loading={isCancelPending}
        onConfirm={() => cancelPlan({ storeId })}
      />
    </div>
  );
}
