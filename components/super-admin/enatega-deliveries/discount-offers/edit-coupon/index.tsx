'use client';

import { useRouter } from 'next/navigation';
import { getEditCouponSchema } from '@/schemas/enatega-deliveries/discount-offer/discount-offer-schema';
import { ApiErrorResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { GetStoreCouponByIdResponse } from '@/types/api/store/deliveries/coupon';
import { GetCouponByIdResponse } from '@/types/api/super-admin/enatega-deliveries/discount-offers';
import { EditCouponFormData } from '@/types/entities/super-admin/enatega-deliveries/discount-coupons';
import { Coupon } from '@/types/entities/super-admin/enatega-deliveries/discount-offers';
import { isStoreCouponsBasePath } from '@/lib/store';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetStoreCouponById,
  useUpdateStoreCoupon,
} from '@/hooks/api/store/deliveries/coupons';
import {
  useGetCouponById,
  useUpdateCoupon,
} from '@/hooks/api/super-admin/enatega-deliveries/discount-offers';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppliedTo } from './AppliedTo';
import { BasicInformation } from './BasicInformation';
import { DiscountSetting } from './DiscountSetting';
import { Restriction } from './Restriction';
import { ScheduleStatus } from './ScheduleStatus';

const DEFAULT_FORM_VALUES: EditCouponFormData = {
  id: 0,
  couponName: '',
  couponCode: '',
  couponDescription: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maxDiscountCap: 0,
  minOrderValue: 0,
  totalUsageLimit: 0,
  products: [],
  stores: [],
  usagePerUser: 0,
  startDate: '',
  endDate: '',
  activeImmediately: false,
  isAlreadyActive: false,
  paymentMethod: [],
  deliveryType: [],
  forNewUserOnly: false,
  forPremiumShopOnly: false,
};

const normalizeDiscountType = (
  value: string | undefined | null,
): 'PERCENTAGE' | 'FIXED' => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();
  if (normalized === '%' || normalized === 'PERCENTAGE') {
    return 'PERCENTAGE';
  }

  return 'FIXED';
};

function numericField(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapSuperAdminCoupon(data: Coupon): EditCouponFormData {
  const usageLimit =
    typeof data?.usage_limit === 'number'
      ? data.usage_limit
      : data?.usage_limit?.total;
  const usagePerUser =
    typeof data?.usage_limit === 'number' ? 0 : data?.usage_limit?.per_user;

  return {
    id: Number(data?.id),
    couponName: data?.title ?? '',
    couponCode: data?.code ?? '',
    couponDescription: data?.description ?? '',
    discountType: normalizeDiscountType(data?.discount_type),
    discountValue: Number(data?.values) || 0,
    maxDiscountCap: Number(data?.max_discount_cap) || 0,
    minOrderValue: Number(data?.minimum_order_value) || 0,
    totalUsageLimit: Number(usageLimit) || 0,
    products: [],
    stores: Array.isArray(data?.stores)
      ? data.stores.map((store) => String(store.id))
      : [],
    usagePerUser: Number(usagePerUser) || 0,
    startDate: data?.validity?.start_date ?? '',
    endDate: data?.validity?.end_date ?? '',
    activeImmediately: data?.validity?.active_immediately ?? false,
    isAlreadyActive: data?.status === 'active',
    paymentMethod: data?.payment_method ?? [],
    deliveryType: data?.delivery_type ?? [],
    forNewUserOnly: data?.for_new_user_only ?? false,
    forPremiumShopOnly: data?.for_premium_shops_only ?? false,
  };
}

function mapStoreCoupon(data: GetStoreCouponByIdResponse): EditCouponFormData {
  return {
    id: Number(data?.id),
    couponName: data?.title ?? '',
    couponCode: data?.discount_code ?? '',
    couponDescription: data?.description ?? '',
    discountType: normalizeDiscountType(data?.discount_type),
    discountValue: Number(data?.value) || 0,
    maxDiscountCap: Number(data?.max_discount_cap) || 0,
    minOrderValue: Number(data?.min_order_value) || 0,
    totalUsageLimit: Number(data?.usage_limit) || 0,
    products: Array.isArray(data?.applies_to_products)
      ? data.applies_to_products.map((store) => store.id)
      : [],
    stores: [],
    usagePerUser: Number(data?.usage_per_user) || 0,
    startDate: data?.validity.start_date ?? '',
    endDate: data?.validity.end_date ?? '',
    activeImmediately: data?.active_immediately ?? false,
    isAlreadyActive: data?.status === 'active',
    paymentMethod: data?.payment_method ?? [],
    deliveryType: data?.delivery_type ?? [],
    forNewUserOnly: data?.for_new_users ?? false,
    forPremiumShopOnly: false,
  };
}

export function EditCouponForm({
  id,
  basePath = '/enatega-deliveries/discounts-offers',
}: {
  id: string;
  basePath?: string;
}) {
  const tForm = useTranslations('lumiFood.discountsOffers.editCoupon');
  const tCommon = useTranslations('common');
  const tSchema = useTranslations('Schemas.discountOffer');
  const router = useRouter();
  const isStoreCoupons = isStoreCouponsBasePath(basePath);

  const {
    mutateAsync: updateSuperAdminCoupon,
    isPending: isSuperAdminPending,
  } = useUpdateCoupon();
  const { mutateAsync: updateStoreCouponFn, isPending: isStorePending } =
    useUpdateStoreCoupon();

  const {
    data: superAdminData,
    isLoading: isSuperAdminLoading,
    isError: isSuperAdminError,
    error: superAdminError,
  } = useGetCouponById(id, { enabled: !isStoreCoupons });

  const {
    data: storeData,
    isLoading: isStoreLoading,
    isError: isStoreError,
    error: storeError,
  } = useGetStoreCouponById(id, { enabled: isStoreCoupons });
  const queryClient = useQueryClient();
  const isLoading = isStoreCoupons ? isStoreLoading : isSuperAdminLoading;
  const isError = isStoreCoupons ? isStoreError : isSuperAdminError;
  const error = isStoreCoupons ? storeError : superAdminError;
  const isPending = isStoreCoupons ? isStorePending : isSuperAdminPending;

  if (isLoading) {
    return [1, 2, 3, 4, 5].map((index) => <CardShimmer key={index} />);
  }

  if (isError) {
    return (
      <DisplayError
        title={tForm('fetchFailedTitle')}
        message={
          returnErrorMessage(error as ApiErrorResponse) ||
          tForm('fetchFailedDescription')
        }
      />
    );
  }

  let initialValues: EditCouponFormData = DEFAULT_FORM_VALUES;

  if (isStoreCoupons && storeData) {
    initialValues = mapStoreCoupon(storeData);
  } else if (!isStoreCoupons && superAdminData) {
    const coupon =
      (superAdminData as GetCouponByIdResponse)?.data ??
      (superAdminData as unknown as Coupon);
    initialValues = mapSuperAdminCoupon(coupon);
  }

  const handleSubmit = async (values: EditCouponFormData) => {
    try {
      if (isStoreCoupons) {
        const storePayload = {
          name: values.couponName,
          code: values.couponCode,
          description: values.couponDescription,
          discount_type: values.discountType as 'PERCENTAGE' | 'FIXED',
          discount_value: Number(values.discountValue),
          max_discount_cap: numericField(values.maxDiscountCap),
          min_order_value: Number(values.minOrderValue) || 0,
          total_usage_limit: Number(values.totalUsageLimit),
          usage_per_user: Number(values.usagePerUser),
          active_immediately: values.activeImmediately,
          status: (values.isAlreadyActive || values.activeImmediately
            ? 'active'
            : 'inactive') as 'active' | 'inactive',
          payment_method: values.paymentMethod,
          delivery_type: values.deliveryType,
          for_new_users: values.forNewUserOnly,
          only_premium_shops: values.forPremiumShopOnly,
          applies_to_products: values.products || [],
          start_date: values.activeImmediately
            ? new Date(Date.now() + 1 * 60 * 1000).toISOString()
            : values.startDate,
          end_date: values.endDate,
        };

        const response = await updateStoreCouponFn({
          id,
          payload: storePayload,
        });
        toast.success(response.message || tForm('updateSuccess'));
        queryClient.invalidateQueries({
          queryKey: ['get-store-coupon-by-id', id],
        });
      } else {
        const payload = {
          id,
          name: values.couponName,
          code: values.couponCode,
          description: values.couponDescription,
          discount_type: values.discountType as 'PERCENTAGE' | 'FIXED',
          discount_value: Number(values.discountValue),
          max_discount_cap: numericField(values.maxDiscountCap),
          min_order_value: Number(values.minOrderValue) || undefined,
          total_usage_limit: Number(values.totalUsageLimit),
          usage_per_user: Number(values.usagePerUser),
          active_immediately: values.activeImmediately,
          status: (values.isAlreadyActive || values.activeImmediately
            ? 'active'
            : 'inactive') as 'active' | 'inactive',
          payment_method: values.paymentMethod,
          delivery_type: values.deliveryType,
          for_new_users: values.forNewUserOnly,
          only_premium_shops: values.forPremiumShopOnly,
          store_id: values.stores || [],
          start_date: values.activeImmediately
            ? new Date(Date.now() + 1 * 60 * 1000).toISOString()
            : values.startDate,
          end_date: values.endDate,
        };

        const response = await updateSuperAdminCoupon(payload);
        toast.success(response.message || tForm('updateSuccess'));
      }

      router.push(basePath);
    } catch (submitError) {
      handleApiError(submitError as ApiErrorResponse);
    }
  };

  return (
    <div className="bg-accent p-10 rounded-md my-5">
      <Formik
        initialValues={initialValues}
        validationSchema={getEditCouponSchema(tSchema, isStoreCoupons)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <BasicInformation />
            <DiscountSetting />
            <AppliedTo hideStoreFields={true} />
            <ScheduleStatus />
            <Restriction />
            <div className="flex justify-end gap-3 mt-10">
              <AppButton type="button" onClick={() => router.back()}>
                {tCommon('cancel')}
              </AppButton>

              <AppButton type="submit" isLoading={isSubmitting || isPending}>
                {tForm('updateButton')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
