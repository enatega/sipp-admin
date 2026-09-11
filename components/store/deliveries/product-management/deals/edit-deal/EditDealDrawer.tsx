'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import type {
  ApiErrorResponse,
  Deal,
  DealDropdownProduct,
  DealDropdownVariation,
  DealFormValues,
} from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateDeal } from '@/hooks/api/store/deliveries/product-management/deals';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  buildApiPayload,
  getInitialValues,
} from '../table/dealDrawer.utils';
import EditDealForm from './EditDealForm';

interface EditDealDrawerProps {
  open: boolean;
  deal: Deal;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DealFormValues) => void;
}

export default function EditDealDrawer({
  open,
  deal,
  onOpenChange,
  onSubmit,
}: EditDealDrawerProps) {
  const tToast = useTranslations('deals.toast');
  const { storeId } = useParams() as { storeId?: string };
  const { mutateAsync: updateDeal, isPending: isUpdatingDeal } = useUpdateDeal(
    storeId || '',
  );

  const initialValues = useMemo(() => getInitialValues(deal), [deal]);

  const selectedProduct = useMemo<DealDropdownProduct | null>(
    () => ({
      id: deal.productId || '',
      name: deal.product,
      price: deal.productPrice,
    }),
    [deal],
  );
  const selectedVariation = useMemo<DealDropdownVariation | null>(
    () => ({
      id: deal.variationId || '',
      name: deal.variation,
      price: deal.variationPrice,
    }),
    [deal],
  );

  const handleFormSubmit = async (values: DealFormValues) => {
    const variationId = values.variation || null;
    const payload = buildApiPayload(values, variationId);

    try {
      await updateDeal({ id: deal.id, ...payload });
      toast.success(tToast('updatedSuccess'));

      onSubmit(values);

      onOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md h-full overflow-y-auto p-4">
        <EditDealForm
          storeId={storeId}
          initialValues={initialValues}
          selectedProduct={selectedProduct}
          selectedVariation={selectedVariation}
          isSubmitLoading={isUpdatingDeal}
          onSubmit={handleFormSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
