'use client';

import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AppDialog } from '@/components/shared/AppDialog';
import { useStripeMode } from '@/hooks/api/common/stripe';

type Props = {
  open: boolean;
  onClose: () => void;
  clientSecret: string;
  onInitFailed?: () => void;
};

export function EmbeddedCheckoutDialog({
  open,
  onClose,
  clientSecret,
  onInitFailed,
}: Props) {
  // Key for the Stripe mode the server is in (sandbox or live).
  const { publishableKey, isLoading: isStripeModeLoading } = useStripeMode();

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  useEffect(() => {
    if (!open || !clientSecret) return;

    const timer = window.setTimeout(() => {
      const container = document.getElementById('stripe-embedded-checkout');
      const hasIframe = Boolean(container?.querySelector('iframe'));
      if (!hasIframe) {
        toast.error('Embedded checkout did not load. Redirecting to checkout page.');
        onClose();
        onInitFailed?.();
      }
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [open, clientSecret, onClose, onInitFailed]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Complete your subscription"
      size="4xl"
      showDefaultFooter={false}
    >
      {isStripeModeLoading ? (
        <div className="min-h-[560px] animate-pulse rounded-lg bg-muted" />
      ) : !publishableKey || !stripePromise ? (
        <div className="p-4 text-sm text-help-red">
          Stripe publishable key for the current mode is missing.
        </div>
      ) : (
        <div id="stripe-embedded-checkout" className="min-h-[560px]">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </AppDialog>
  );
}
