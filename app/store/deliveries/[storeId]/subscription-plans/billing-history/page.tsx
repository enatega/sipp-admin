import { notFound } from 'next/navigation';
// Subscription plans are out of scope for now; restore the page below if the client asks for them.
// import { BillingHistoryPage } from '@/components/store/deliveries/subscription-plans';

export default function StoreBillingHistory() {
  notFound();
  // return <BillingHistoryPage />;
}
