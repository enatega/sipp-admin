export interface CreateVendorSubscriptionCheckoutPayload {
  priceId: string;
  storeId: string;
  planId: string;
  planName: string;
  email?: string;
  returnUrl?: string;
}

export interface UpdateVendorSubscriptionCheckoutPayload {
  subscriptionPlanId: string;
  storeId: string;
  stripePriceId: string;
  returnUrl?: string;
  email?: string;
}

export interface CreateVendorSubscriptionCheckoutResponse {
  url?: string;
  sessionId?: string;
  session_id?: string;
  clientSecret?: string;
  client_secret?: string;
  message?: string;
}
