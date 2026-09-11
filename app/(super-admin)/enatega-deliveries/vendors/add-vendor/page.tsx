'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { AddVendorForm } from '@/components/super-admin/enatega-deliveries/vendors/add-vendor/AddVendorForm';
import { VendorFormStepper } from '@/components/super-admin/enatega-deliveries/vendors/add-vendor/Stepper';
import { useGetAllDeliveryVendors } from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import { getShopMode } from '@/lib/user';
import {
  buildScopedDeliveriesAdminPathFromCurrent,
} from '@/lib/routes';
import EnategaLoader from '@/components/shared/EnategaLoader';

const AddVendor = () => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('lumiFood.vendors.pages');
  const { data: vendorsResponse, isLoading } = useGetAllDeliveryVendors();

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isStoreChain =
    isHydrated && getShopMode() === 'STORE_CHAIN';
  const hasExistingVendor = (vendorsResponse?.data?.length ?? 0) > 0;

  useEffect(() => {
    if (!isStoreChain || isLoading || !hasExistingVendor) {
      return;
    }
    router.replace(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        '/enatega-deliveries/vendors',
      ),
    );
  }, [hasExistingVendor, isLoading, isStoreChain, router]);

  if (!isHydrated || (isStoreChain && (isLoading || hasExistingVendor))) {
    return <EnategaLoader />;
  }

  return (
    <div>
      <Heading title={t('addTitle')} showBackBtn={true} />
      <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
        <VendorFormStepper />
        <AddVendorForm />
      </div>
    </div>
  );
};

export default AddVendor;
