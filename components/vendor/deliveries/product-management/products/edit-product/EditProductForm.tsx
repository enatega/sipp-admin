'use client';

import * as React from 'react';
import type {
  ApiErrorResponse,
  EditProductAddonGroupFormValues,
  EditProductFormValues,
  EditProductVariationGroupFormValues,
  ProductVariationSettingsFormValues,
  VendorDropdownOption,
} from '@/types';
import { useTranslations } from 'next-intl';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import { cleanAllergens } from '@/lib/allergens';
import toast from 'react-hot-toast';
import type {
  Product,
  ProductCustomizationGroup,
  ProductCustomizationOption,
} from '@/types/entities/store/deliveries/product';
import { hasPersistedVariationOptions } from '@/lib/product-variation-options';
import {
  findVariationSettings,
  hasVariationSettings,
  listVariationNames,
  toVariationSettingsPayload,
} from '@/lib/product-variation-settings';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useAddProductCustomizationGroup,
  useDeleteProductCustomizationGroup,
  useUpdateProductCustomizationGroup,
  useUpdateProductVariationOptionPrice,
  useUpdateProductVariationSettings,
} from '@/hooks/api/vendor/deliveries/product-management/products';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { EditProductVariationsSection } from '@/components/store/deliveries/product-management/products/edit-product/EditProductVariationsSection';
import { LegacyVariationPriceDialog } from '@/components/store/deliveries/product-management/products/edit-product/LegacyVariationPriceDialog';
import { VendorVariationAddonsField } from '../variation-settings/VendorVariationAddonsField';
import { AddonGroupDialog } from './AddonGroupDialog';
import { EditProductAddonsSection } from './EditProductAddonsSection';
import { EditProductBasicInformationForm } from './EditProductBasicInformationForm';
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
  // On vendor pages `storeId` is the vendor id of the route.
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
  const {
    mutateAsync: updateLegacyOptionPrice,
    isPending: isUpdatingLegacyOption,
  } = useUpdateProductVariationOptionPrice();
  const {
    mutateAsync: updateVariationSettings,
    isPending: isUpdatingVariationSettings,
  } = useUpdateProductVariationSettings();
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

  // Once set, stock and add-ons are managed per variation instead of per product.
  const usesVariationSettings = hasVariationSettings(product);
  const variationSettings = product.variationSettings ?? [];
  // The product's own add-on groups: always offered in a variation's picker,
  // including the ones created inline below.
  const knownAddons = React.useMemo<VendorDropdownOption[]>(
    () =>
      (product.customizationGroups ?? [])
        .filter((group) => group?.type === 'add-on')
        .map((group) => ({ id: group.id, name: group.name })),
    [product.customizationGroups],
  );
  const selectedVariationSettings = findVariationSettings(
    variationSettings,
    selectedVariation?.id,
  );
  const selectedLegacyOptionSettings = findVariationSettings(
    variationSettings,
    selectedLegacyOption?.option.id,
  );

  const customizationActionPending =
    isCreatingGroup ||
    isUpdatingGroup ||
    isUpdatingLegacyOption ||
    isUpdatingVariationSettings ||
    isDeletingGroup;

  const handleLegacyOptionSave = async (
    price: number,
    settingsValues?: ProductVariationSettingsFormValues,
  ) => {
    if (!selectedLegacyOption) return;
    try {
      await updateLegacyOptionPrice({
        productId: product.id,
        groupId: selectedLegacyOption.group.id,
        optionId: selectedLegacyOption.option.id,
        price,
      });
      // A migrated size keeps its settings under its option id.
      if (settingsValues) {
        await updateVariationSettings({
          productId: product.id,
          variationId: selectedLegacyOption.option.id,
          ...toVariationSettingsPayload(settingsValues),
        });
      }
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

    // Only multi-select groups take limits; blank means no limit (0).
    // Single-select resets them so stale multi limits are not kept.
    const selectionLimits =
      values.selectionType === 'multi'
        ? {
            minSelect: Number(values.minSelect || 0),
            maxSelect: Number(values.maxSelect || 0),
          }
        : { minSelect: 0, maxSelect: 0 };

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
          ...selectionLimits,
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
          ...selectionLimits,
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
      // Always sent so removing every row clears the saved facts.
      nutritionFacts: cleanNutritionFacts(values.nutritionFacts),
      allergens: cleanAllergens(values.allergens),
    };

    try {
      if (selectedVariation) {
        await updateCustomizationGroup({
          ...payload,
          id: selectedVariation.id,
        });
        // SKU, stock, in-stock switch and add-ons are saved by their own call.
        if (selectedVariationSettings) {
          await updateVariationSettings({
            productId: product.id,
            variationId: selectedVariation.id,
            ...toVariationSettingsPayload(values),
          });
        }
        toast.success(tProducts('success.update'));
      } else {
        // A blank SKU is left out, so the new variation gets a generated one.
        await createCustomizationGroup({
          ...payload,
          ...toVariationSettingsPayload(values),
        });
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
          variationSettings={variationSettings}
          disabled={customizationActionPending}
          addButtonLabel={tStep2('addVariantButton')}
          editLabel={tProducts('actions.edit')}
          deleteLabel={tProducts('actions.delete')}
          onCreate={openCreateVariationDialog}
          onEdit={openEditVariationDialog}
          onEditOption={(group, option) =>
            setSelectedLegacyOption({ group, option })
          }
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
          variationSettings={usesVariationSettings ? variationSettings : undefined}
          variationNames={listVariationNames(variations)}
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
        vendorId={storeId}
        skuStoreId={product.store_id}
        productId={product.id}
        settings={selectedVariationSettings}
        knownAddons={knownAddons}
        onSubmit={handleVariationSubmit}
      />

      <LegacyVariationPriceDialog
        option={selectedLegacyOption?.option ?? null}
        storeId={resolvedStoreId}
        taxRateId={product.taxRateId}
        currentTaxRate={product.taxRate}
        isSaving={isUpdatingLegacyOption || isUpdatingVariationSettings}
        onClose={() => setSelectedLegacyOption(null)}
        onSave={handleLegacyOptionSave}
        productId={product.id}
        settings={selectedLegacyOptionSettings}
        skuStoreId={product.store_id}
        addonsField={
          <VendorVariationAddonsField
            name="addOnIds"
            vendorId={storeId}
            disabled={isUpdatingLegacyOption || isUpdatingVariationSettings}
            knownAddons={knownAddons}
          />
        }
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
