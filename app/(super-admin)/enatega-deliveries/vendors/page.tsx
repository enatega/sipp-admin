'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getShopMode } from '@/lib/user';
import {
  buildScopedDeliveriesAdminPathFromCurrent,
} from '@/lib/routes';
import { useGetShopMode } from '@/hooks/api/super-admin/enatega-deliveries/settings-profile';
import {
  useGetAllDeliveryVendors,
} from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CirclePlus } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import EnategaLoader from '@/components/shared/EnategaLoader';
import { Heading } from '@/components/shared/Heading';
import NoDataFound from '@/components/shared/NoDataFound';
import VendorTabs from '@/components/super-admin/enatega-deliveries/vendors/status-tabs';
import VendorCard from '@/components/super-admin/enatega-deliveries/vendors/VendorCard';
import { useTranslations } from 'next-intl';

function Vendor() {
  const pathname = usePathname();
  const t = useTranslations('lumiFood.vendors.pages');
  const tTable = useTranslations('lumiFood.vendors.table');
  const tStoreChain = useTranslations('lumiFood.vendors.storeChain');

  // Fetch shop mode from API
  const { data: shopModeData, isLoading: isShopModeLoading } = useGetShopMode();

  // Fetch vendors
  const {
    data: vendorsResponse,
    isLoading: isVendorsLoading,
    isError,
  } = useGetAllDeliveryVendors();

  // Get shop mode from localStorage (for instant access)
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const localShopMode = isHydrated ? getShopMode() : null;
  const shopMode = shopModeData?.shop_mode || localShopMode;
  const isSingleVendorMode = shopMode === 'SINGLE_VENDOR';
  const isStoreChain = shopMode === 'STORE_CHAIN';
  const showCardView = isSingleVendorMode || isStoreChain;
  const addVendorPath = buildScopedDeliveriesAdminPathFromCurrent(
    pathname,
    '/enatega-deliveries/vendors/add-vendor',
  );

  const vendors = vendorsResponse?.data || [];

  // Show loader while checking shop mode
  if (!isHydrated || (isShopModeLoading && !shopMode)) {
    return <EnategaLoader />;
  }

  // SINGLE_VENDOR or STORE_CHAIN mode: Show vendor card with details
  if (showCardView) {
    if (isVendorsLoading) {
      return <EnategaLoader />;
    }

    if (isError) {
      return (
        <div className="space-y-6">
          <Heading title={t('listTitle')} />
          <DisplayError
            title="Failed to load vendors"
            message="Unable to load vendors. Please try again later."
          />
        </div>
      );
    }

    if (vendors.length === 0) {
      return (
        <div className="space-y-6">
          <Heading title={t('listTitle')} />
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CirclePlus className="w-5 h-5" />
                {tStoreChain('title')}
              </CardTitle>
              <CardDescription>{tStoreChain('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoDataFound title={tTable('noDataTitle')} />
              <div className="flex justify-end">
                <Link href={addVendorPath}>
                  <AppButton leftIcon={<CirclePlus size={16} />}>
                    {t('addButton')}
                  </AppButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show vendor details card
    const vendor = vendors[0];

    return (
      <div className="space-y-6">
        <Heading title={t('listTitle')} />
        <VendorCard vendor={vendor} />
      </div>
    );
  }

  // Other modes: Show full vendors list with tabs and table
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <Heading title={t('listTitle')} />
        <Link href={addVendorPath}>
          <AppButton leftIcon={<CirclePlus size={16} />}>
            {t('addButton')}
          </AppButton>
        </Link>
      </div>
      <div>
        <VendorTabs />
      </div>
    </div>
  );
}

export default Vendor;
