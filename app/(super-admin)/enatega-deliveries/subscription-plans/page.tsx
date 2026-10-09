import { notFound } from 'next/navigation';
// Subscription plans are out of scope for now; restore the page below if the client asks for them.
// import { SubscriptionPlansPage } from '@/components/super-admin/enatega-deliveries/subscription-plans';

function Page() {
  notFound();
  // return <SubscriptionPlansPage />;
}

export default Page;
