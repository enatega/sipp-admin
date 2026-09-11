'use client';

import { useTranslations } from 'next-intl';
import { useAddCouponForm } from '@/contexts/super-admin/enatega-deliveries/discount-offer/use-add-coupon';
import { Heading } from '@/components/shared/Heading';
import { AddCouponForm } from '@/components/super-admin/enatega-deliveries/discount-offers/add-coupon';
import { Stepper } from '@/components/super-admin/enatega-deliveries/discount-offers/add-coupon/Stepper';

function AddCoupon() {
  const t = useTranslations('lumiFood.discountsOffers.pages');
  const { currentStep } = useAddCouponForm();
  const basePath = '/enatega-deliveries/discounts-offers';
  return (
    <div>
      <Heading title={t('addCoupon')} showBackBtn />
      <div className="w-full min-h-[80vh] flex mt-6 gap-10 bg-light rounded-lg p-6 border">
        <Stepper currentStep={currentStep} />
        <AddCouponForm basePath={basePath} />
      </div>
    </div>
  );
}

export default AddCoupon;
