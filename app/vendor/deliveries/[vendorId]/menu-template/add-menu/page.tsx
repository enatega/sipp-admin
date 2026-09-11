'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import VendorAddMenuForm from '@/components/vendor/deliveries/menu-template/add-menu/VendorAddMenuForm';

export default function AddVendorMenuPage() {
  const t = useTranslations('vendorMenuTemplate.form');

  return (
    <div>
      <Heading title={t('createTitle')} showBackBtn />
      <VendorAddMenuForm />
    </div>
  );
}
