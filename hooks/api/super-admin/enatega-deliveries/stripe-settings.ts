import Axios from '@/config/axios';
import { STRIPE_MODE_QUERY_KEY } from '@/hooks/api/common/stripe';
import type { StripeMode } from '@/lib/stripe';
import { ApiErrorResponse } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface StripeModeStatus {
  mode: StripeMode;
  sandboxConfigured: boolean;
  liveConfigured: boolean;
  updatedAt: string | null;
}

const BASE = '/apps/deliveries/stripe-settings';
const STATUS_QUERY_KEY = ['stripe-settings-status'];

export const useGetStripeModeStatus = () =>
  useQuery<StripeModeStatus, ApiErrorResponse>({
    queryKey: STATUS_QUERY_KEY,
    queryFn: async () => (await Axios.get<StripeModeStatus>(BASE)).data,
  });

export const useSetStripeMode = () => {
  const queryClient = useQueryClient();
  return useMutation<StripeModeStatus, ApiErrorResponse, StripeMode>({
    mutationFn: async (mode) =>
      (await Axios.put<StripeModeStatus>(`${BASE}/mode`, { mode })).data,
    onSuccess: (data) => {
      queryClient.setQueryData(STATUS_QUERY_KEY, data);
      queryClient.setQueryData(STRIPE_MODE_QUERY_KEY, { mode: data.mode });
    },
  });
};
