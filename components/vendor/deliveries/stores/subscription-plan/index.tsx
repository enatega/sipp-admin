'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Heading } from '@/components/shared/Heading';
import { AppButton } from '@/components/shared/AppButton';
import { useGetSubscriptionPlans } from '@/hooks/api/deliveries/subscription-plans';
import { useCreateVendorSubscriptionCheckoutSession } from '@/hooks/api/vendor/deliveries/subscription-plan';
import { handleApiError } from '@/lib/toast-error';
import { ApiErrorResponse } from '@/types';
import { EmbeddedCheckoutDialog } from './EmbeddedCheckoutDialog';
import { PlanSelectionCard } from './PlanSelectionCard';

export default function VendorStoreSubscriptionPlanPage() {
  const t = useTranslations('enategaDeliveriesPages.subscriptionPlans');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = String(params.vendorId || '');
  const storeId = String(params.storeId || '');
  const email = searchParams.get('email') || '';
  const sessionId = searchParams.get('session_id');

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [embeddedClientSecret, setEmbeddedClientSecret] = useState<string>('');
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>('');
  const [isEmbeddedOpen, setIsEmbeddedOpen] = useState(false);

  const { data: plans = [], isLoading } = useGetSubscriptionPlans();

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId],
  );

  useEffect(() => {
    if (!sessionId) return;
    router.replace(`/vendor/deliveries/${vendorId}/stores`);
  }, [sessionId, router, vendorId]);

  const { mutate: createCheckoutSession, isPending } =
    useCreateVendorSubscriptionCheckoutSession({
      onSuccess: async (res) => {
        const clientSecret = res.clientSecret || res.client_secret;
        const sessionId = res.sessionId || res.session_id;

        if (clientSecret) {
          setCheckoutSessionId(sessionId || '');
          setEmbeddedClientSecret(clientSecret);
          setIsEmbeddedOpen(true);
          return;
        }

        if (res.url) {
          window.location.href = res.url;
          return;
        }

        if (sessionId) {
          const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
          if (!publishableKey) {
            toast.error('Stripe publishable key is missing.');
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = async () => {
            const stripe = window.Stripe?.(publishableKey);
            if (!stripe || !(stripe as unknown as { redirectToCheckout?: unknown }).redirectToCheckout) {
              toast.error('Unable to initialize Stripe checkout.');
              return;
            }

            await (stripe as unknown as { redirectToCheckout: (opts: { sessionId: string }) => Promise<void> })
              .redirectToCheckout({ sessionId });
          };
          document.body.appendChild(script);
          return;
        }

        toast.error(res.message || 'Failed to start checkout session.');
      },
      onError: (error) => {
        handleApiError(error as ApiErrorResponse);
      },
    });

  const handleContinue = () => {
    if (!selectedPlan) {
      toast.error('Please select a plan first.');
      return;
    }

    const priceId =
      billingCycle === 'monthly'
        ? selectedPlan.monthlyPriceId
        : selectedPlan.yearlyPriceId;

    if (!priceId) {
      toast.error('Selected plan price ID is missing.');
      return;
    }

    createCheckoutSession({
      priceId,
      storeId,
      planId: selectedPlan.id,
      planName: selectedPlan.planName,
      email,
      returnUrl: `${window.location.origin}/vendor/deliveries/${vendorId}/stores`,
    });
  };

  return (
    <div className="space-y-6">
      <Heading
        showBackBtn
        title="Choose Subscription Plan"
        subTitle="Store is created. Select a plan to activate subscription and continue."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold text-darkblack">Available Plans</h3>
        <div className="inline-flex rounded-lg bg-accent p-1">
          <button
            type="button"
            className={`rounded-md px-8 py-2 text-sm ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-mute'}`}
            onClick={() => setBillingCycle('monthly')}
          >
            {t('monthly')}
          </button>
          <button
            type="button"
            className={`rounded-md px-8 py-2 text-sm ${billingCycle === 'yearly' ? 'bg-primary text-white' : 'text-mute'}`}
            onClick={() => setBillingCycle('yearly')}
          >
            {t('yearly')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-[420px] animate-pulse rounded-xl border bg-accent" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanSelectionCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isSelected={selectedPlanId === plan.id}
              onSelect={setSelectedPlanId}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <AppButton onClick={handleContinue} isLoading={isPending} disabled={!selectedPlanId || isPending}>
          Continue with Selected Plan
        </AppButton>
      </div>

      <EmbeddedCheckoutDialog
        open={isEmbeddedOpen}
        onClose={() => setIsEmbeddedOpen(false)}
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
    </div>
  );
}
