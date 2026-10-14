'use client';

import * as React from 'react';
import {
  useAddProductCustomizationGroup,
  useDeleteProductCustomizationGroup,
  useUpdateProductCustomizationGroup,
  useUpdateProductVariationOptionPrice,
} from '@/hooks/api/vendor/deliveries/product-management/products';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { hasPersistedVariationOptions } from '@/lib/product-variation-options';
import type {
  ApiErrorResponse,
  EditProductAddonGroupFormValues,
  EditProductFormValues,
  EditProductVariationGroupFormValues,
} from '@/types';
import type {
  Product,
  ProductCustomizationGroup,
  ProductCustomizationOption,
} from '@/types/entities/store/deliveries/product';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AddonGroupDialog } from './AddonGroupDialog';
import { EditProductAddonsSection } from './EditProductAddonsSection';
import { EditProductBasicInformationForm } from './EditProductBasicInformationForm';
import { EditProductVariationsSection } from '@/components/store/deliveries/product-management/products/edit-product/EditProductVariationsSection';
import { LegacyVariationPriceDialog } from '@/components/store/deliveries/product-management/products/edit-product/LegacyVariationPriceDialog';
import { VariationGroupDialog } from './VariationGroupDialog';

interface EditProductFormProps {
  initialValues: EditProductFormValues;
  product: Product;
  storeId?: string;
  isSubmitting: boolean;
  onSubmit: (values: EditProductFormValues) => void;
}

export const EditProductForm: React.FC<EditProductFormProps> = ({
  initialValues,
  product,
  storeId,
  isSubmitting,
  onSubmit,
}) => {
  const tProducts = useTranslations('products');
  const tStep2 = useTranslations('products.addProduct.step2');
  const resolvedStoreId = storeId || product.store_id;

  const [selectedAddOn, setSelectedAddOn] =
    React.useState<ProductCustomizationGroup | null>(null);
  const [selectedVariation, setSelectedVariation] =
    React.useState<ProductCustomizationGroup | null>(null);
  const [selectedLegacyOption, setSelectedLegacyOption] = React.useState<{
    group: ProductCustomizationGroup;
    option: ProductCustomizationOption;
  } | null>(null);
  const [isAddOnDialogOpen, setIsAddOnDialogOpen] = React.useState(false);
  const [isVariationDialogOpen, setIsVariationDialogOpen] =
    React.useState(false);
  const [groupToDelete, setGroupToDelete] =
    React.useState<ProductCustomizationGroup | null>(null);

  const { mutateAsync: createCustomizationGroup, isPending: isCreatingGroup } =
    useAddProductCustomizationGroup();
  const { mutateAsync: updateCustomizationGroup, isPending: isUpdatingGroup } =
    useUpdateProductCustomizationGroup();
  const { mutateAsync: updateLegacyOptionPrice, isPending: isUpdatingLegacyOption } =
    useUpdateProductVariationOptionPrice();
  const { mutateAsync: deleteCustomizationGroup, isPending: isDeletingGroup } =
    useDeleteProductCustomizationGroup();

  const customizationGroups = Array.isArray(product.customizationGroups)
    ? product.customizationGroups
    : [];

  const variations = customizationGroups.filter(
    (group): group is ProductCustomizationGroup =>
      Boolean(group) && group.type === 'variation',
  );
  const addOns = customizationGroups.filter(
    (group): group is ProductCustomizationGroup =>
      Boolean(group) && group.type === 'add-on',
  );

  const customizationActionPending =
    isCreatingGroup || isUpdatingGroup || isUpdatingLegacyOption || isDeletingGroup;

  const handleLegacyOptionPriceSave = async (price: number) => {
    if (!selectedLegacyOption) return;
    try {
      await updateLegacyOptionPrice({
        productId: product.id,
        groupId: selectedLegacyOption.group.id,
        optionId: selectedLegacyOption.option.id,
        price,
      });
      toast.success(tProducts('success.update'));
    } catch (error) {
      throw new Error(returnErrorMessage(error as ApiErrorResponse));
    }
  };

  const openCreateAddOnDialog = () => {
    setSelectedAddOn(null);
    setIsAddOnDialogOpen(true);
  };

  const openEditAddOnDialog = (group: ProductCustomizationGroup) => {
    setSelectedAddOn(group);
    setIsAddOnDialogOpen(true);
  };

  const openCreateVariationDialog = () => {
    setSelectedVariation(null);
    setIsVariationDialogOpen(true);
  };

  const openEditVariationDialog = (group: ProductCustomizationGroup) => {
    setSelectedVariation(group);
    setIsVariationDialogOpen(true);
  };

  const handleAddonSubmit = async (values: EditProductAddonGroupFormValues) => {
    if (!resolvedStoreId) {
      throw new Error(tProducts('errors.storeIdRequired'));
    }

    try {
      if (selectedAddOn) {
        await updateCustomizationGroup({
          id: selectedAddOn.id,
          productId: product.id,
          store_id: resolvedStoreId,
          name: values.name.trim(),
          description: values.description.trim(),
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          type: 'add-on',
          optionIds: values.optionIds,
        });
        toast.success(tProducts('success.update'));
      } else {
        await createCustomizationGroup({
          productId: product.id,
          store_id: resolvedStoreId,
          name: values.name.trim(),
          description: values.description.trim(),
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          type: 'add-on',
          optionIds: values.optionIds,
        });
        toast.success(tProducts('success.create'));
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
      throw new Error(returnErrorMessage(error as ApiErrorResponse));
    }
  };

  const handleVariationSubmit = async (
    values: EditProductVariationGroupFormValues,
  ) => {
    if (!resolvedStoreId) {
      throw new Error(tProducts('errors.storeIdRequired'));
    }

    const payload = {
      productId: product.id,
      store_id: resolvedStoreId,
      name: values.name.trim(),
      price: hasPersistedVariationOptions(selectedVariation)
        ? undefined
        : Number(values.price),
      type: 'variation' as const,
      variation_image: values.image instanceof File ? values.image : undefined,
    };

    try {
      if (selectedVariation) {
        await updateCustomizationGroup({
          ...payload,
          id: selectedVariation.id,
        });
        toast.success(tProducts('success.update'));
      } else {
        await createCustomizationGroup(payload);
        toast.success(tProducts('success.create'));
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
      throw new Error(returnErrorMessage(error as ApiErrorResponse));
    }
  };

  const handleDeleteCustomizationGroup = async () => {
    if (!groupToDelete) return;

    try {
      const response = await deleteCustomizationGroup({
        id: groupToDelete.id,
        productId: product.id,
      });
      toast.success(response.message || tProducts('success.delete'));
      setGroupToDelete(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <EditProductBasicInformationForm
          initialValues={initialValues}
          product={product}
          storeId={storeId}
          isSubmitting={isSubmitting}
          disableSubmit={customizationActionPending}
          onSubmit={onSubmit}
        />

        <EditProductVariationsSection
          variations={variations}
          disabled={customizationActionPending}
          addButtonLabel={tStep2('addVariantButton')}
          editLabel={tProducts('actions.edit')}
          deleteLabel={tProducts('actions.delete')}
          onCreate={openCreateVariationDialog}
          onEdit={openEditVariationDialog}
          onEditOption={(group, option) => setSelectedLegacyOption({ group, option })}
          onDelete={setGroupToDelete}
        />

        <EditProductAddonsSection
          addOns={addOns}
          disabled={customizationActionPending}
          addButtonLabel={tProducts('form.addonsLabel')}
          editLabel={tProducts('actions.edit')}
          deleteLabel={tProducts('actions.delete')}
          onCreate={openCreateAddOnDialog}
          onEdit={openEditAddOnDialog}
          onDelete={setGroupToDelete}
        />
      </div>

      <AddonGroupDialog
        open={isAddOnDialogOpen}
        onClose={() => setIsAddOnDialogOpen(false)}
        storeId={resolvedStoreId}
        isSubmitting={customizationActionPending}
        initialGroup={selectedAddOn}
        onSubmit={handleAddonSubmit}
      />

      <VariationGroupDialog
        open={isVariationDialogOpen}
        onClose={() => setIsVariationDialogOpen(false)}
        isSubmitting={customizationActionPending}
        initialGroup={selectedVariation}
        onSubmit={handleVariationSubmit}
      />

      <LegacyVariationPriceDialog
        option={selectedLegacyOption?.option ?? null}
        storeId={resolvedStoreId}
        taxRateId={product.taxRateId}
        currentTaxRate={product.taxRate}
        isSaving={isUpdatingLegacyOption}
        onClose={() => setSelectedLegacyOption(null)}
        onSave={handleLegacyOptionPriceSave}
      />

      <AppAlertDialog
        open={!!groupToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setGroupToDelete(null);
          }
        }}
        title={
          groupToDelete?.type === 'add-on'
            ? tProducts('actions.deleteAddonTitle')
            : tProducts('actions.deleteVariationTitle')
        }
        subTitle={
          groupToDelete?.type === 'add-on'
            ? tProducts('actions.deleteAddonDescription')
            : tProducts('actions.deleteVariationDescription')
        }
        confirmLabel={tProducts('errors.deleteConfirm')}
        loading={isDeletingGroup}
        onCancel={() => setGroupToDelete(null)}
        onConfirm={handleDeleteCustomizationGroup}
        variant="delete"
      />
    </>
  );
};
