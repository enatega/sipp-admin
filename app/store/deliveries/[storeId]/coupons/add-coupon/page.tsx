'use client';

import { useParams } from 'next/navigation';
import { useAddCouponForm } from '@/contexts/super-admin/enatega-deliveries/discount-offer/use-add-coupon';
import { useTranslations } from 'next-intl';
import { getStorePath } from '@/lib/store';
import { Heading } from '@/components/shared/Heading';
import { AddCouponForm } from '@/components/super-admin/enatega-deliveries/discount-offers/add-coupon';
import { Stepper } from '@/components/super-admin/enatega-deliveries/discount-offers/add-coupon/Stepper';

function AddCoupon() {
  const t = useTranslations('storeCoupons');
  const { storeId } = useParams() as { storeId?: string };
  const { currentStep } = useAddCouponForm();
  return (
    <div>
      <Heading title={t('addTitle')} showBackBtn />
      <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
        <Stepper currentStep={currentStep} />
        <AddCouponForm
          storeId={storeId}
          basePath={getStorePath(storeId, '/coupons')}
        />
      </div>
    </div>
  );
}

export default AddCoupon;
