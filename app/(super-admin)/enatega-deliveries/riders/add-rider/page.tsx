'use client';

import { Heading } from '@/components/shared/Heading';
import { AddRiderForm } from '@/components/super-admin/enatega-deliveries/rider/add-rider/form/AddRiderForm';
import { RiderFormStepper } from '@/components/super-admin/enatega-deliveries/rider/add-rider/stepper';
import { useTranslations } from 'next-intl';

const AddRider = () => {
  const t = useTranslations('driverManagement');

  return (
    <div>
      <Heading title={t('addRiderTitle')} showBackBtn={true} />
      <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
        <RiderFormStepper />
        <AddRiderForm />
      </div>
    </div>
  );
};

export default AddRider;
