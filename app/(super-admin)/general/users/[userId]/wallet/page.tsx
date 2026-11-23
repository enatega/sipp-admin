import { WalletPage } from '@/components/shared/wallet';

export default async function UserWalletPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <WalletPage ownerType="customer" ownerId={userId} backPath="/general/users" />
  );
}
