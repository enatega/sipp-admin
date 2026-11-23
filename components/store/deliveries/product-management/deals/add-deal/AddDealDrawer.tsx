'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type {
  ApiErrorResponse,
  DealDropdownProduct,
  DealDropdownVariation,
  DealFormValues,
} from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useCreateDeal } from '@/hooks/api/store/deliveries/product-management/deals';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  EMPTY_DEAL_FORM_VALUES,
  buildApiPayload,
} from '../table/dealDrawer.utils';
import AddDealForm from './AddDealForm';

interface AddDealDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DealFormValues) => void;
}

export default function AddDealDrawer({
  open,
  onOpenChange,
  onSubmit,
}: AddDealDrawerProps) {
  const tToast = useTranslations('deals.toast');
  const { storeId } = useParams() as { storeId?: string };
  const [selectedProduct, setSelectedProduct] =
    useState<DealDropdownProduct | null>(null);
  const [selectedVariation, setSelectedVariation] =
    useState<DealDropdownVariation | null>(null);

  const { mutateAsync: createDeal, isPending: isCreatingDeal } = useCreateDeal(
    storeId || '',
  );

  const handleFormSubmit = async (values: DealFormValues) => {
    const variationId = values.variation || null;
    const payload = buildApiPayload(values, variationId);

    try {
      await createDeal(payload);
      toast.success(tToast('createdSuccess'));

      onSubmit(values);

      onOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedProduct(null);
          setSelectedVariation(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent className="w-full sm:max-w-md h-full overflow-y-auto p-4">
        <AddDealForm
          storeId={storeId}
          initialValues={EMPTY_DEAL_FORM_VALUES}
          selectedProduct={selectedProduct}
          selectedVariation={selectedVariation}
          onProductSelectionChange={setSelectedProduct}
          onVariationSelectionChange={setSelectedVariation}
          isSubmitLoading={isCreatingDeal}
          onSubmit={handleFormSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
