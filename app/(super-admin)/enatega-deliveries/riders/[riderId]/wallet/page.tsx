import { WalletPage } from '@/components/shared/wallet';
import { adminRoutes } from '@/lib/routes';

export default async function RiderWalletPage({
  params,
}: {
  params: Promise<{ riderId: string }>;
}) {
  const { riderId } = await params;

  return (
    <WalletPage
      ownerType="rider"
      ownerId={riderId}
      backPath={adminRoutes.deliveries.riders}
    />
  );
}
