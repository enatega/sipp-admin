import Axios from '@/config/axios';
import {
  ApiErrorResponse,
  CreateVendorSubscriptionCheckoutPayload,
  CreateVendorSubscriptionCheckoutResponse,
  UpdateVendorSubscriptionCheckoutPayload,
} from '@/types';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

const VENDOR_SUBSCRIPTION_CHECKOUT_ENDPOINT =
  '/deliveries/subscription-plan/stripe/checkout-session';
const VENDOR_SUBSCRIPTION_UPDATE_CHECKOUT_ENDPOINT =
  '/deliveries/subscription-plan/stripe/subscribe';

export const useCreateVendorSubscriptionCheckoutSession = (
  options?: UseMutationOptions<
    CreateVendorSubscriptionCheckoutResponse,
    ApiErrorResponse,
    CreateVendorSubscriptionCheckoutPayload
  >,
) => {
  return useMutation<
    CreateVendorSubscriptionCheckoutResponse,
    ApiErrorResponse,
    CreateVendorSubscriptionCheckoutPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await Axios.post<CreateVendorSubscriptionCheckoutResponse>(
        VENDOR_SUBSCRIPTION_CHECKOUT_ENDPOINT,
        payload,
      );
      return data;
    },
    ...options,
  });
};

export const useCreateVendorSubscriptionUpdateCheckoutSession = (
  options?: UseMutationOptions<
    CreateVendorSubscriptionCheckoutResponse,
    ApiErrorResponse,
    UpdateVendorSubscriptionCheckoutPayload
  >,
) => {
  return useMutation<
    CreateVendorSubscriptionCheckoutResponse,
    ApiErrorResponse,
    UpdateVendorSubscriptionCheckoutPayload
  >({
    mutationFn: async ({ subscriptionPlanId, ...payload }) => {
      const { data } = await Axios.patch<CreateVendorSubscriptionCheckoutResponse>(
        `${VENDOR_SUBSCRIPTION_UPDATE_CHECKOUT_ENDPOINT}/${subscriptionPlanId}`,
        payload,
      );
      return data;
    },
    ...options,
  });
};
