'use client';

import { useSyncExternalStore } from 'react';
import { isStoreOwnerSession } from '@/lib/store-notifications';

/** True once hydrated when the signed-in user is the store itself. */
export function useStoreOwnerSession(storeId?: string | null): boolean {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return hydrated && isStoreOwnerSession(storeId);
}
