'use client';

import * as React from 'react';
import type {
  ApiErrorResponse,
  EditProductAddonGroupFormValues,
  EditProductFormValues,
  EditProductVariationGroupFormValues,
  ProductVariationSettingsFormValues,
} from '@/types';
import { useTranslations } from 'next-intl';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import { cleanAllergens } from '@/lib/allergens';
import toast from 'react-hot-toast';
import type { Addon } from '@/types/entities/store/deliveries/addon';
import type {
  Product,
  ProductCustomizationGroup,
  ProductCustomizationOption,
} from '@/types/entities/store/deliveries/product';
import {
  buildDealSummaryIndex,
  extractAppliedDealsFromProduct,
  extractDealIdFromProduct,
  findDealSummaryById,
} from '@/lib/deal-pricing';
import { hasPersistedVariationOptions } from '@/lib/product-variation-options';
import {
  findVariationSettings,
  hasVariationSettings,
  listVariationNames,
  toVariationSettingsPayload,
} from '@/lib/product-variation-settings';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import {
  useAddProductCustomizationGroup,
  useAttachProductCustomizationGroup,
  useDeleteProductCustomizationGroup,
  useDetachProductCustomizationGroup,
  useUpdateProductCustomizationGroup,
  useUpdateProductVariationOptionPrice,
  useUpdateProductVariationSettings,
} from '@/hooks/api/store/deliveries/product-management/products';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AddonsAsyncMultiSelect from '@/components/store/deliveries/product-management/common/AddonsAsyncMultiSelect';
import { AddonGroupDialog } from './AddonGroupDialog';
import { EditProductAddonsSection } from './EditProductAddonsSection';
import { EditProductBasicInformationForm } from './EditProductBasicInformationForm';
import { EditProductVariationAddonsList } from './EditProductVariationAddonsList';
import { EditProductVariationsSection } from './EditProductVariationsSection';
import { LegacyVariationPriceDialog } from './LegacyVariationPriceDialog';
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
  const tAddonSuccess = useTranslations('storeAddons.success');
  const tStep2 = useTranslations('products.addProduct.step2');
  const resolvedStoreId = storeId || product.store_id;
  const dealIdFromProduct = extractDealIdFromProduct(
    product as Record<string, unknown>,
  );
  const { data: activeDeals } = useGetActiveDeals(
    resolvedStoreId
      ? {
          store_id: resolvedStoreId,
          offset: 0,
          limit: 200,
        }
      : null,
    {
      enabled: !!resolvedStoreId,
    },
  );
  const selectedDealSummary = findDealSummaryById(
    activeDeals?.data,
    dealIdFromProduct,
  );
  const appliedDeals = extractAppliedDealsFromProduct(
    product as Record<string, unknown>,
  );
  const dealSummaryIndex = buildDealSummaryIndex(activeDeals?.data);

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
  const [pendingAddonId, setPendingAddonId] = React.useState<string | null>(
    null,
  );
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
  const { mutateAsync: detachCustomizationGroup, isPending: isDetachingGroup } =
    useDetachProductCustomizationGroup();
  const { mutateAsync: attachCustomizationGroup, isPending: isAttachingGroup } =
    useAttachProductCustomizationGroup();

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
  const knownAddons = React.useMemo(
    () =>
      (product.customizationGroups ?? []).filter(
        (group) => group?.type === 'add-on',
      ) as unknown as Addon[],
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
    isDeletingGroup ||
    isDetachingGroup ||
    isAttachingGroup;

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
      throw new Error('Store ID is required');
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
          nameTranslations: values.nameTranslations,
          description: values.description.trim(),
          descriptionTranslations: values.descriptionTranslations,
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          type: 'add-on',
          optionIds: values.optionIds,
          ...selectionLimits,
        });
        toast.success(tAddonSuccess('update'));
      } else {
        await createCustomizationGroup({
          productId: product.id,
          store_id: resolvedStoreId,
          name: values.name.trim(),
          nameTranslations: values.nameTranslations,
          description: values.description.trim(),
          descriptionTranslations: values.descriptionTranslations,
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          type: 'add-on',
          optionIds: values.optionIds,
          ...selectionLimits,
        });
        toast.success(tAddonSuccess('create'));
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
      throw new Error('Store ID is required');
    }

    const payload = {
      productId: product.id,
      store_id: resolvedStoreId,
      name: values.name.trim(),
      nameTranslations: values.nameTranslations,
      // Blank clears the variation SKU on update; a new one then gets a generated SKU.
      sku: selectedVariation ? (values.sku?.trim() ?? '') : values.sku?.trim() || undefined,
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
        // Stock, in-stock switch and add-ons are saved by their own call.
        if (selectedVariationSettings) {
          await updateVariationSettings({
            productId: product.id,
            variationId: selectedVariation.id,
            ...toVariationSettingsPayload(values),
          });
        }
        toast.success(tProducts('success.update'));
      } else {
        const { stockQuantity, inStock, addOnIds } =
          toVariationSettingsPayload(values);
        await createCustomizationGroup({
          ...payload,
          stockQuantity,
          inStock,
          addOnIds,
        });
        toast.success(tProducts('success.create'));
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
      throw new Error(returnErrorMessage(error as ApiErrorResponse));
    }
  };

  const handleDetachCustomizationGroup = async (
    group: ProductCustomizationGroup,
  ) => {
    try {
      await detachCustomizationGroup({ id: group.id, productId: product.id });
      toast.success(tProducts('success.detach'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  // The picker reports the full selection; link or unlink the difference.
  const handleAddonSelectionChange = async (nextAddonIds: string[]) => {
    const currentIds = addOns.map((addOn) => addOn.id);
    const toAttach = nextAddonIds.filter((id) => !currentIds.includes(id));
    const toDetach = currentIds.filter((id) => !nextAddonIds.includes(id));

    try {
      for (const id of toAttach) {
        setPendingAddonId(id);
        await attachCustomizationGroup({ id, productId: product.id });
        toast.success(tProducts('success.attach'));
      }
      for (const id of toDetach) {
        setPendingAddonId(id);
        await detachCustomizationGroup({ id, productId: product.id });
        toast.success(tProducts('success.detach'));
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setPendingAddonId(null);
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
          fallbackDealSummary={selectedDealSummary}
          appliedDeals={appliedDeals}
          dealSummaryIndex={dealSummaryIndex}
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

        {usesVariationSettings ? (
          <EditProductVariationAddonsList
            addOns={addOns}
            variationSettings={variationSettings}
            variationNames={listVariationNames(variations)}
            disabled={customizationActionPending}
            editLabel={tProducts('actions.edit')}
            onEdit={openEditAddOnDialog}
          />
        ) : (
        <EditProductAddonsSection
          addOns={addOns}
          disabled={customizationActionPending}
          editLabel={tProducts('actions.edit')}
          deleteLabel={tProducts('actions.delete')}
          onEdit={openEditAddOnDialog}
          onDelete={setGroupToDelete}
          detachLabel={tProducts('actions.detach')}
          onDetach={handleDetachCustomizationGroup}
          picker={
            <AddonsAsyncMultiSelect
              name="addOnIds"
              label={tProducts('form.selectAddonsLabel')}
              placeholder={tProducts('form.selectAddonsPlaceholder')}
              storeId={resolvedStoreId}
              // Keep the picker usable while its own request runs so the
              // loader stays visible; other actions still lock it.
              disabled={customizationActionPending && !pendingAddonId}
              pendingAddonId={pendingAddonId}
              value={addOns.map((addOn) => addOn.id)}
              initialSelectedAddons={addOns as unknown as Addon[]}
              onChange={handleAddonSelectionChange}
            />
          }
        />
        )}
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
        storeId={resolvedStoreId}
        taxRateId={product.taxRateId}
        currentTaxRate={product.taxRate}
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
        knownAddons={knownAddons}
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
            ? 'Delete Add-on'
            : 'Delete Variation'
        }
        subTitle={
          groupToDelete?.type === 'add-on'
            ? tProducts('actions.deleteAddonStoreWideDescription')
            : 'Are you sure you want to delete this variation?'
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
