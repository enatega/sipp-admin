'use client';

type Translator = (key: string) => string;

export const normalizeOrderValue = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const startCase = (value?: string | null, fallback = '') => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return fallback;

  return normalized
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const formatOrderTypeLabel = (
  value: string | null | undefined,
  t: Translator,
  fallback: string,
) => {
  const normalized = normalizeOrderValue(value);

  switch (normalized) {
    case 'delivery':
      return t('delivery');
    case 'pickup':
      return t('pickup');
    case 'appointment':
      return t('appointment');
    case 'appointment_service':
      return t('appointmentService');
    case 'home_visit':
    case 'homevisit':
      return t('homeVisit');
    case 'gift_delivery':
      return t('giftDelivery');
    case 'grocery_delivery':
      return t('groceryDelivery');
    case 'food_delivery':
      return t('foodDelivery');
    case 'milk_delivery':
      return t('milkDelivery');
    case 'items_services':
    case 'items_services_order':
      return t('itemsServices');
    default:
      return startCase(value, fallback);
  }
};

export const formatOrderStatusLabel = (
  value: string | null | undefined,
  t: Translator,
  fallback: string,
) => {
  const normalized = normalizeOrderValue(value);

  switch (normalized) {
    case 'scheduled':
      return t('scheduled');
    case 'pending':
      return t('pending');
    case 'accepted':
      return t('accepted');
    case 'preparing':
      return t('preparing');
    case 'in_progress':
    case 'inprogress':
    case 'ongoing':
    case 'running':
      return t('inProgress');
    case 'rider_assigned':
    case 'assigned':
      return t('riderAssigned');
    case 'ready':
    case 'ready_for_pickup':
      return t('readyForPickup');
    case 'picked_up':
    case 'picked_by_rider':
      return t('pickedUp');
    case 'out_of_delivery':
    case 'out_for_delivery':
    case 'dispatched':
    case 'in_transit':
      return t('outForDelivery');
    case 'arrived':
    case 'rider_arrived':
      return t('arrived');
    case 'completed':
      return t('completed');
    case 'delivered':
      return t('delivered');
    case 'cancelled':
    case 'canceled':
      return t('cancelled');
    case 'rejected':
      return t('rejected');
    case 'failed':
      return t('failed');
    case 'active':
      return t('active');
    case 'inactive':
      return t('inactive');
    default:
      return startCase(value, fallback);
  }
};

export const formatPaymentMethodLabel = (
  value: string | null | undefined,
  t: Translator,
  fallback: string,
) => {
  const normalized = normalizeOrderValue(value);

  switch (normalized) {
    case 'cash':
    case 'cod':
      return t('cash');
    case 'card':
    case 'stripe':
      return t('card');
    case 'wallet':
      return t('wallet');
    case 'paypal':
      return t('paypal');
    default:
      return startCase(value, fallback);
  }
};

export const formatPaymentStatusLabel = (
  value: string | null | undefined,
  t: Translator,
  fallback: string,
) => {
  const normalized = normalizeOrderValue(value);

  switch (normalized) {
    case 'paid':
    case 'completed':
    case 'succeeded':
      return t('paid');
    case 'unpaid':
      return t('unpaid');
    case 'pending':
      return t('pending');
    case 'failed':
      return t('failed');
    case 'refunded':
      return t('refunded');
    case 'cancelled':
    case 'canceled':
      return t('cancelled');
    default:
      return startCase(value, fallback);
  }
};

export const formatReviewLabel = (
  count: number | null | undefined,
  singular: string,
  plural: string,
) => (Number(count ?? 0) === 1 ? singular : plural);

export const isStoreOrdersPath = (pathname?: string | null) =>
  pathname?.includes('/store/deliveries/') && pathname?.includes('/orders');

export const isPickupOrder = (orderType?: string | null) =>
  normalizeOrderValue(orderType) === 'pickup';

const DELIVERY_STATUS_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['pending', 'accepted', 'cancelled'],
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled', 'rejected'],
  preparing: ['ready', 'cancelled'],
  rider_assigned: ['picked_up', 'ready', 'cancelled'],
  ready: ['picked_up', 'cancelled'],
  picked_up: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['arrived', 'failed'],
  arrived: ['delivered', 'failed'],
};

const PICKUP_STATUS_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['pending', 'accepted', 'cancelled'],
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'ready', 'cancelled', 'rejected'],
  preparing: ['ready', 'delivered', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  rider_assigned: ['ready', 'delivered', 'cancelled'],
  picked_up: ['delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'failed'],
  arrived: ['delivered', 'failed'],
};

export const getNextOrderStatuses = (
  status?: string | null,
  orderType?: string | null,
) => {
  const normalizedStatus = normalizeOrderValue(status);
  const transitions = isPickupOrder(orderType)
    ? PICKUP_STATUS_TRANSITIONS
    : DELIVERY_STATUS_TRANSITIONS;

  return transitions[normalizedStatus] ?? [];
};
