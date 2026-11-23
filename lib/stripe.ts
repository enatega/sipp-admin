export type StripeMode = 'sandbox' | 'live';

/**
 * Both publishable keys are built in. The server says which Stripe mode is active and
 * the browser uses the key for that mode, so it always matches the account the
 * server's secret key charges.
 */
const PUBLISHABLE_KEYS: Record<StripeMode, string | undefined> = {
  sandbox: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST?.trim() || undefined,
  live: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE?.trim() || undefined,
};

export const getStripePublishableKey = (mode: StripeMode | null | undefined) =>
  mode ? PUBLISHABLE_KEYS[mode] : undefined;
