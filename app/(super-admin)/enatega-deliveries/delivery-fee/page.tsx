'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { DeliveryFeeSettings } from '@/components/super-admin/enatega-deliveries/delivery-fee/DeliveryFeeSettings';

function DeliveryFee() {
  const t = useTranslations('lumiFood.deliveryFee');

  return (
    <>
      <Heading title={t('pageTitle')} />
      <DeliveryFeeSettings />
    </>
  );
}

export default DeliveryFee;
