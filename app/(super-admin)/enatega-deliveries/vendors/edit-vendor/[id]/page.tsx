'use client';

import { Heading } from '@/components/shared/Heading';
import { EditVendorForm } from '@/components/super-admin/enatega-deliveries/vendors/edit-vendor/EditVendorForm';
import { useTranslations } from 'next-intl';

const EditVendor = () => {
  const t = useTranslations('lumiFood.vendors.pages');

  // const params = useParams();
  // const vendorId = params.id as string;

  return (
    <div>
      <Heading title={t('editTitle')} showBackBtn={true} />
      <div className="w-full min-h-[80vh] mt-6 bg-light rounded-lg p-6 border">
        <EditVendorForm />
      </div>
    </div>
  );
};

export default EditVendor;
