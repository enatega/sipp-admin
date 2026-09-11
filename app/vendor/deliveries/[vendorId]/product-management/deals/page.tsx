'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ApiErrorResponse, Deal, RawDeal } from '@/types';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteDeal,
  useGetDeals,
  useToggleDealStatus,
} from '@/hooks/api/vendor/deliveries/product-management/deals';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import AddDealDrawer from '@/components/vendor/deliveries/product-management/deals/add-deal/AddDealDrawer';
import DealsTable from '@/components/vendor/deliveries/product-management/deals/table/DealsTable';
import EditDealDrawer from '@/components/vendor/deliveries/product-management/deals/edit-deal/EditDealDrawer';
import {
  calculateFinalDealPrice,
  toNumberOrNull,
} from '@/components/vendor/deliveries/product-management/deals/table/dealDrawer.utils';

const resolveSelectedVariation = (deal: RawDeal) => {
  if (!deal.variationId || !deal.product?.variations?.length) {
    return null;
  }

  return deal.product.variations.find((item) => item.id === deal.variationId);
};

const Deals = () => {
  const t = useTranslations('deals');
  const tToast = useTranslations('deals.toast');
  const tDealType = useTranslations('deals.dealType');
  const { vendorId } = useParams() as { vendorId?: string };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const { data, isLoading, isError, error } = useGetDeals(vendorId || '', {
    enabled: !!vendorId,
  });
  const { mutateAsync: deleteDeal } = useDeleteDeal(vendorId || '');
  const {
    mutate: toggleDealStatus,
    isPending: isTogglingDealStatus,
    variables: toggleStatusVariables,
  } = useToggleDealStatus(vendorId || '', {
    onSuccess: () => {
      toast.success(tToast('statusUpdated'));
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  const apiDeals = useMemo(
    () =>
      (data?.data || []).map((deal: RawDeal): Deal => {
        const selectedVariation = resolveSelectedVariation(deal);
        const isProductLevelDeal = !deal.variationId;
        const productPrice = toNumberOrNull(deal.product?.price);
        const variationPrice = toNumberOrNull(selectedVariation?.price);
        const basePrice = isProductLevelDeal ? productPrice : variationPrice;
        const discount = Number(deal.discountValue || 0);
        const discountType: Deal['discountType'] =
          deal.discountType === 'fixed' ? 'fixed' : 'percentage';
        const status: Deal['status'] = deal.isActive ? 'active' : 'inactive';

        return {
          id: deal.id,
          dealName: deal.dealName,
          product: deal.product?.name || '-',
          productId: deal.productId,
          productPrice,
          variation: isProductLevelDeal
            ? t('productLevel')
            : selectedVariation?.name || '-',
          variationId: deal.variationId,
          isProductLevelDeal,
          dealType:
            deal.discountType === 'fixed'
              ? tDealType('fixed')
              : tDealType('percentage'),
          discountType,
          discount,
          variationPrice: isProductLevelDeal ? null : variationPrice,
          priceAfterDiscount:
            basePrice === null
              ? null
              : calculateFinalDealPrice(basePrice, discountType, discount),
          startDate: deal.startDate,
          endDate: deal.endDate,
          status,
        };
      }),
    [data, t, tDealType],
  );
  const deals = data ? apiDeals : [];

  const handleOpenAdd = () => {
    setEditingDeal(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setIsDrawerOpen(true);
  };

  const handleDeleteDeal = async (deal: Deal) => {
    try {
      const response = await deleteDeal(deal.id);
      toast.success(response.message || tToast('deletedSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleSubmitDeal = () => {};

  const handleToggleDealStatus = (deal: Deal, isActive: boolean) => {
    toggleDealStatus({
      id: deal.id,
      isActive,
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <Heading title={t('title')} />
        <AppButton leftIcon={<CirclePlus size={16} />} onClick={handleOpenAdd}>
          {t('addButton')}
        </AppButton>
      </div>

      <DealsTable
        deals={deals}
        onEditDeal={handleOpenEdit}
        onDeleteDeal={handleDeleteDeal}
        onToggleDealStatus={handleToggleDealStatus}
        statusLoadingDealId={
          isTogglingDealStatus ? toggleStatusVariables?.id : undefined
        }
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? returnErrorMessage(error) : ''}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        totalData={data?.total ?? deals.length}
      />

      {editingDeal ? (
        <EditDealDrawer
          open={isDrawerOpen}
          deal={editingDeal}
          onOpenChange={(open) => {
            setIsDrawerOpen(open);
            if (!open) setEditingDeal(null);
          }}
          onSubmit={handleSubmitDeal}
        />
      ) : (
        <AddDealDrawer
          open={isDrawerOpen}
          onOpenChange={(open) => {
            setIsDrawerOpen(open);
            if (!open) setEditingDeal(null);
          }}
          onSubmit={handleSubmitDeal}
        />
      )}
    </div>
  );
};

export default Deals;

