'use client';

import { Heading } from '@/components/shared/Heading';
import { EditRiderForm } from '@/components/super-admin/enatega-deliveries/rider/edit-rider/EditRiderForm';
import { useTranslations } from 'next-intl';

const EditRider = () => {
  const t = useTranslations('driverManagement');
  // const params = useParams();
  // const riderID = params.id as string;

  return (
    <div>
      <Heading title={t('editRiderTitle')} showBackBtn={true} />
      <div className="w-full min-h-[80vh] mt-6 bg-light rounded-lg p-6 border">
        <EditRiderForm />
      </div>
    </div>
  );
};

export default EditRider;
