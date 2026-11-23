'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import VendorEditMenuForm from '@/components/vendor/deliveries/menu-template/edit-menu/VendorEditMenuForm';

export default function EditVendorMenuPage() {
  const t = useTranslations('vendorMenuTemplate.form');

  return (
    <div>
      <Heading title={t('editTitle')} showBackBtn />
      <VendorEditMenuForm />
    </div>
  );
}
