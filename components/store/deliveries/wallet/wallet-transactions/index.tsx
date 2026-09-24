'use client';

import { useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { hasAdminProfile } from '@/lib/user';
import { WalletPage } from '@/components/shared/wallet';

export function StoreWalletTransactions() {
  const { storeId } = useParams<{ storeId: string }>();
  // Admin profile lives in browser storage; read it only after hydration.
  const isAdmin = useSyncExternalStore(
    () => () => {},
    () => hasAdminProfile(),
    () => false,
  );

  return (
    <WalletPage
      ownerType="store"
      ownerId={storeId}
      source="store-dashboard"
      canAddTransaction={isAdmin}
    />
  );
}
