'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { getShopMode } from '@/lib/user';
import {
  buildScopedDeliveriesAdminPathFromCurrent,
} from '@/lib/routes';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { useTranslations } from 'next-intl';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('lumiFood.stores');
  const { data: stores, isLoading } = useGetAllSimpleStores();

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hideAddStoreButton = useMemo(() => {
    if (!isHydrated) {
      return true;
    }
    const shopMode = getShopMode();
    const isRestrictedMode =
      shopMode === 'SINGLE_VENDOR' || shopMode === 'STORE_CHAIN';

    if (isRestrictedMode) {
      if (isLoading) {
        return true;
      }
      return (stores?.length ?? 0) > 0;
    }
    return false;
  }, [isHydrated, isLoading, stores]);

  return (
    <div className="flex flex-col gap-7 mb-7">
      <div className="flex justify-between items-center">
        <Heading title={t('title')} />
        {!hideAddStoreButton && (
          <div className="flex gap-2 items-center">
            <AppButton
              leftIcon={<CirclePlus size={16} />}
              onClick={() =>
                router.push(
                  buildScopedDeliveriesAdminPathFromCurrent(
                    pathname,
                    '/enatega-deliveries/stores/add-store',
                  ),
                )
              }
            >
              {t('addStorelabel')}
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
}
