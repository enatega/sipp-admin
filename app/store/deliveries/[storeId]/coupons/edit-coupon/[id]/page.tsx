'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getStorePath } from '@/lib/store';
import { Heading } from '@/components/shared/Heading';
import { EditCouponForm } from '@/components/super-admin/enatega-deliveries/discount-offers/edit-coupon';

function EditCoupon() {
  const t = useTranslations('storeCoupons');
  const params = useParams() as {
    id?: string;
    storeId?: string;
    slug?: string[];
  };
  const couponId =
    params.id ||
    (Array.isArray(params.slug)
      ? params.slug[params.slug.length - 1]
      : undefined);

  if (!couponId) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Heading title={t('editTitle')} showBackBtn />
      <EditCouponForm
        id={couponId}
        basePath={getStorePath(params.storeId, '/coupons')}
      />
    </div>
  );
}

export default EditCoupon;
