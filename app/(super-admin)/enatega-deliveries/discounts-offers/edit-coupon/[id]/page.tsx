'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import { EditCouponForm } from '@/components/super-admin/enatega-deliveries/discount-offers/edit-coupon';

export default function EditCoupon() {
  const t = useTranslations('lumiFood.discountsOffers.pages');
  const params = useParams();
  const id = params?.id;
  const basePath = '/enatega-deliveries/discounts-offers';

  // Only render if id exists
  if (!id || Array.isArray(id))
    return <DisplayError title={t('errorTitle')} message={t('invalidCouponId')} />;

  return (
    <div className="space-y-5">
      <Heading title={t('editCoupon')} showBackBtn={true} />
      <EditCouponForm id={id} basePath={basePath} />
    </div>
  );
}
