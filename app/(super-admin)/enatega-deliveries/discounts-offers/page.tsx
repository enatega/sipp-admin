'use client';

import { useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { handleApiError } from '@/lib/toast-error';
import {
  useDeleteCoupon,
  useGetAllCoupons,
} from '@/hooks/api/super-admin/enatega-deliveries/discount-offers';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { DiscountTabs } from '@/components/super-admin/enatega-deliveries/discount-offers/main/DiscountTabs';

function Page() {
  const t = useTranslations('lumiFood.discountsOffers.pages');
  const tTable = useTranslations('lumiFood.discountsOffers.table');
  const router = useRouter();
  const basePath = '/enatega-deliveries/discounts-offers';

  // ── data fetching (was previously inside DiscountTable) ───────────
  const { data, isError, error, isLoading } = useGetAllCoupons({
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: deleteCoupon, isPending } = useDeleteCoupon();

  const coupons = data?.data || [];

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteCoupon({ id });
      toast.success(response.message || tTable('deleteSuccess'));
    } catch (err) {
      handleApiError(err as ApiErrorResponse);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <Heading title={t('title')} />
        <AppButton
          leftIcon={<CirclePlus size={16} />}
          onClick={() =>
            router.push('/enatega-deliveries/discounts-offers/add-coupon')
          }
        >
          {t('addCouponButton')}
        </AppButton>
      </div>
      <DiscountTabs
        basePath={basePath}
        coupons={coupons}
        isLoading={isLoading}
        isError={isError}
        error={error}
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

export default Page;
