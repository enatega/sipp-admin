'use client';

import { useEffect } from 'react';
import { useVendorAddStoreForm } from '@/contexts/vendor/deliveries/store/use-add-store-form';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import VendorAddStoreForm from '@/components/vendor/deliveries/stores/add-store/VendorAddStoreForm';
import VendorStoreFormStepper from '@/components/vendor/deliveries/stores/add-store/VendorStoreFormStepper';

const AddVendorStorePage = () => {
  const t = useTranslations('vendorDeliveriesStores');
  const currentStep = useVendorAddStoreForm((state) => state.currentStep);
  const resetForm = useVendorAddStoreForm((state) => state.resetForm);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <div>
      <Heading title={t('addStoreLabel')} showBackBtn={true} />
      <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
        <VendorStoreFormStepper currentStep={currentStep} />
        <VendorAddStoreForm />
      </div>
    </div>
  );
};

export default AddVendorStorePage;
