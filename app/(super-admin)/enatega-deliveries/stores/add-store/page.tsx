'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAddStoreForm } from '@/contexts/super-admin/enatega-deliveries/store/use-add-store-form';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { getShopMode } from '@/lib/user';
import {
  buildScopedDeliveriesAdminPathFromCurrent,
} from '@/lib/routes';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import EnategaLoader from '@/components/shared/EnategaLoader';
import AddStoreForm from '@/components/super-admin/enatega-deliveries/stores/add-store/AddStoreForm';
import StoreFormStepper from '@/components/super-admin/enatega-deliveries/stores/add-store/Stepper';

const AddStorePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('lumiFood.stores');
  const currentStep = useAddStoreForm((state) => state.currentStep);
  const resetForm = useAddStoreForm((state) => state.resetForm);
  const { data: stores, isLoading } = useGetAllSimpleStores();

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isSingleVendor =
    isHydrated && getShopMode() === 'SINGLE_VENDOR';
  const hasExistingStore = (stores?.length ?? 0) > 0;

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!isSingleVendor || isLoading || !hasExistingStore) {
      return;
    }
    router.replace(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        '/enatega-deliveries/stores',
      ),
    );
  }, [hasExistingStore, isLoading, isSingleVendor, router]);

  if (!isHydrated || (isSingleVendor && (isLoading || hasExistingStore))) {
    return <EnategaLoader />;
  }

  return (
    <div>
      <Heading title={t('addStorelabel')} showBackBtn={true} />
      <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
        <StoreFormStepper currentStep={currentStep} />
        <AddStoreForm />
      </div>
    </div>
  );
};

export default AddStorePage;
