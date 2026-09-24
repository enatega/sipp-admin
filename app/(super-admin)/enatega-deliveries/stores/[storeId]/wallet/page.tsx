import { WalletPage } from '@/components/shared/wallet';
import { adminRoutes } from '@/lib/routes';

export default async function StoreWalletPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return (
    <WalletPage
      ownerType="store"
      ownerId={storeId}
      backPath={adminRoutes.deliveries.stores}
    />
  );
}
