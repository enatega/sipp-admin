import Axios from '@/config/axios';
import { getStripePublishableKey, type StripeMode } from '@/lib/stripe';
import { ApiErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const STRIPE_MODE_QUERY_KEY = ['stripe-mode'];

/**
 * The Stripe mode payments currently use and the matching publishable key.
 * `publishableKey` is undefined until the mode is known.
 */
export const useStripeMode = () => {
  const query = useQuery<{ mode: StripeMode }, ApiErrorResponse>({
    queryKey: STRIPE_MODE_QUERY_KEY,
    queryFn: async () =>
      (await Axios.get<{ mode: StripeMode }>('/apps/deliveries/stripe-settings/mode')).data,
    staleTime: 30_000,
  });
  const mode = query.data?.mode ?? null;
  return {
    mode,
    isLoading: query.isLoading,
    publishableKey: getStripePublishableKey(mode),
  };
};
