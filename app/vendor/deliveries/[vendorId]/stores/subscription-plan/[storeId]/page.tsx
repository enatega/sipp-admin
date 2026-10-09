import { notFound } from 'next/navigation';
// Subscription plans are out of scope for now; restore the page below if the client asks for them.
// import VendorStoreSubscriptionPlanPage from '@/components/vendor/deliveries/stores/subscription-plan';

export default function VendorStoreSubscriptionPlanRoute() {
  notFound();
  // return <VendorStoreSubscriptionPlanPage />;
}
