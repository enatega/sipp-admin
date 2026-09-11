'use client';

import { useParams, useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { mapStoreCouponToTableCoupon } from '@/lib/mappers/mapStoreCoupon';
import { getStorePath } from '@/lib/store';
import { handleApiError } from '@/lib/toast-error';
import {
  useDeleteStoreCoupon,
  useGetAllStoreCoupons,
} from '@/hooks/api/store/deliveries/coupons';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { DiscountTabs } from '@/components/super-admin/enatega-deliveries/discount-offers/main/DiscountTabs';

export default function Coupons() {
  const router = useRouter();
  const t = useTranslations('storeCoupons');
  const tTable = useTranslations('lumiFood.discountsOffers.table');
  const { storeId } = useParams() as { storeId?: string };
  const couponsBasePath = getStorePath(storeId, '/coupons');

  const { mutateAsync: deleteCoupon, isPending } = useDeleteStoreCoupon();

  const { data, isError, error, isLoading } = useGetAllStoreCoupons(storeId);

  const coupons = data?.data.map(mapStoreCouponToTableCoupon) || [];

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      toast.success(tTable('deleteSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <Heading title={t('title')} />
        <AppButton
          leftIcon={<CirclePlus size={16} />}
          onClick={() =>
            router.push(getStorePath(storeId, '/coupons/add-coupon'))
          }
        >
          {t('addButton')}
        </AppButton>
      </div>
      <DiscountTabs
        basePath={couponsBasePath}
        coupons={coupons}
        isLoading={isLoading}
        isError={isError}
        error={error as ApiErrorResponse | null}
        onDelete={handleDelete}
        isPending={isPending}
        pagination={
          data
            ? {
                page: data.page,
                totalPages: data.totalPages,
                total: data.total,
              }
            : undefined
        }
      />
    </div>
  );
}
