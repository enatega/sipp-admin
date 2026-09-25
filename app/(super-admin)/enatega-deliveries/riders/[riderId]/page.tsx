import { RiderDetailsPage } from '@/components/super-admin/enatega-deliveries/rider/details/RiderDetailsPage';

export default async function RiderDetailsRoute({
  params,
}: {
  params: Promise<{ riderId: string }>;
}) {
  const { riderId } = await params;
  return <RiderDetailsPage riderId={riderId} />;
}
