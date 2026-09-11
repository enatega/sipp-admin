'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAddCouponForm } from '@/contexts/super-admin/enatega-deliveries/discount-offer/use-add-coupon';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import {
  AddCouponFormData,
  Step5Data,
} from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { isStoreCouponsBasePath } from '@/lib/store';
import { handleApiError } from '@/lib/toast-error';
import { useAddStoreCoupon } from '@/hooks/api/store/deliveries/coupons';
import { useAddCoupon } from '@/hooks/api/super-admin/enatega-deliveries/discount-offers';
import {
  EmptyStep1Data,
  EmptyStep2Data,
  EmptyStep3Data,
  EmptyStep4Data,
  EmptyStep5Data,
} from './common/data';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { Step4 } from './Step4';
import { Step5 } from './Step5';

export function AddCouponForm({
  storeId,
  basePath = '/enatega-deliveries/discounts-offers',
}: {
  storeId?: string;
  basePath?: string;
}) {
  const tSuccess = useTranslations(
    'lumiFood.discountsOffers.addCoupon.success',
  );
  const router = useRouter();
  const { mutateAsync: addCoupon, isPending } = useAddCoupon();
  const { mutateAsync: addStoreCoupon, isPending: isStoreCouponPending } =
    useAddStoreCoupon();

  const { currentStep, formData, nextStep, prevStep, setStepData, resetForm } =
    useAddCouponForm();

  const isStoreCoupons = isStoreCouponsBasePath(basePath);

  type StepKey = keyof AddCouponFormData;

  const handleSubmit =
    <K extends StepKey>(step: K) =>
    async (data: NonNullable<AddCouponFormData[K]>) => {
      setStepData(step, data);
      // If not last step → go next
      if (step !== 'step5') {
        nextStep();
        return;
      }

      try {
        const step5Data = data as Step5Data;
        const finalData = {
          ...formData,
          step5: step5Data,
        };
        console.log('finalData', finalData);

        if (isStoreCoupons && storeId) {
          // ── Store coupon payload (PostCouponPayload) ──
          const storePayload = {
            name: finalData.step1?.couponName || '',
            code: finalData.step1?.couponCode || '',
            description: finalData.step1?.couponDescription || '',
            discount_type: finalData.step2!.discountType as
              | 'PERCENTAGE'
              | 'FIXED',
            discount_value: Number(finalData.step2?.discountValue),
            max_discount_cap: Number(finalData.step2?.maxDiscountCap || 0),
            min_order_value: Number(finalData.step2?.minOrderValue || 0),
            total_usage_limit: Number(finalData.step2?.totalUsageLimit || 0),
            applies_to_products: finalData.step3?.products || [],
            usage_per_user: Number(finalData.step3?.usagePerUser || 0),
            start_date: finalData.step4?.activeImmediately
              ? new Date(Date.now() + 1 * 60 * 1000).toISOString()
              : finalData.step4!.startDate,
            end_date: finalData.step4!.endDate,
            active_immediately: finalData.step4?.activeImmediately || false,
            status: (finalData.step4?.activeImmediately ? 'active' : 'inactive') as 'active' | 'inactive',
            payment_method: finalData.step5?.paymentMethod || [],
            delivery_type: finalData.step5?.deliveryType || [],
            for_new_users: finalData.step5?.forNewUserOnly || false,
          };

          const result = await addStoreCoupon({
            store_id: storeId,
            payload: storePayload,
          });
          toast.success(result.message || tSuccess('create'));
        } else {
          // ── Super-admin coupon payload (CreateCouponPayload) ──
          const saPayload = {
            name: finalData.step1?.couponName || '',
            code: finalData.step1?.couponCode || '',
            description: finalData.step1?.couponDescription || '',
            discount_type: finalData.step2!.discountType,
            discount_value: Number(finalData.step2?.discountValue),
            max_discount_cap:
              finalData.step2?.maxDiscountCap !== undefined &&
              finalData.step2?.maxDiscountCap !== null
                ? Number(finalData.step2?.maxDiscountCap)
                : undefined,
            min_order_value: finalData.step2?.minOrderValue
              ? Number(finalData.step2?.minOrderValue)
              : undefined,
            total_usage_limit: finalData.step2?.totalUsageLimit
              ? Number(finalData.step2?.totalUsageLimit)
              : undefined,
            usage_per_user: finalData.step3?.usagePerUser
              ? Number(finalData.step3?.usagePerUser)
              : undefined,
            start_date: finalData.step4?.activeImmediately
              ? new Date(Date.now() + 1 * 60 * 1000).toISOString()
              : finalData.step4!.startDate,
            end_date: finalData.step4!.endDate,
            active_immediately: finalData.step4?.activeImmediately || false,
            status: (finalData.step4?.activeImmediately ? 'active' : 'inactive') as 'active' | 'inactive',
            payment_method: finalData.step5?.paymentMethod || [],
            delivery_type: finalData.step5?.deliveryType || [],
            for_new_users: finalData.step5?.forNewUserOnly || false,
            only_premium_shops: finalData.step5?.forPremiumShopOnly || false,
            store_id: finalData.step3?.stores || [],
          };

          const result = await addCoupon(saPayload);
          toast.success(result.message || tSuccess('create'));
        }

        resetForm();
        router.push(basePath);
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    };

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  return (
    <div className="flex-1">
      {currentStep === 1 && (
        <Step1
          initialData={formData.step1 ?? EmptyStep1Data}
          onSubmit={handleSubmit('step1')}
        />
      )}

      {currentStep === 2 && (
        <Step2
          initialData={formData.step2 ?? EmptyStep2Data}
          onSubmit={handleSubmit('step2')}
          onBack={prevStep}
        />
      )}

      {currentStep === 3 && (
        <Step3
          initialData={formData.step3 ?? EmptyStep3Data}
          onSubmit={handleSubmit('step3')}
          onBack={prevStep}
          hideStoreFields={isStoreCoupons}
        />
      )}

      {currentStep === 4 && (
        <Step4
          initialData={formData.step4 ?? EmptyStep4Data}
          onSubmit={handleSubmit('step4')}
          onBack={prevStep}
        />
      )}

      {currentStep === 5 && (
        <Step5
          initialData={formData.step5 ?? EmptyStep5Data}
          onSubmit={handleSubmit('step5')}
          onBack={prevStep}
          isSubmitting={isStoreCoupons ? isStoreCouponPending : isPending}
          showPremiumShops={!isStoreCoupons}
        />
      )}
    </div>
  );
}
