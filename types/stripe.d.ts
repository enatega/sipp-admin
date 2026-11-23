declare module '@stripe/stripe-js' {
  export interface Stripe {
    redirectToCheckout(options: { sessionId: string }): Promise<void>;
  }

  export function loadStripe(
    publishableKey: string,
  ): Promise<Stripe | null>;
}

declare module '@stripe/react-stripe-js' {
  import type { ComponentType, ReactNode } from 'react';
  import type { Stripe } from '@stripe/stripe-js';

  export const EmbeddedCheckout: ComponentType;
  export const EmbeddedCheckoutProvider: ComponentType<{
    stripe: Promise<Stripe | null> | Stripe | null;
    options: { clientSecret: string };
    children?: ReactNode;
  }>;
}

interface Window {
  Stripe?: (publishableKey: string) => {
    redirectToCheckout(options: { sessionId: string }): Promise<void>;
  } | null;
}
