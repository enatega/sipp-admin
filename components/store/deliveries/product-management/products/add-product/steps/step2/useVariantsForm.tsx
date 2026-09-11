'use client';

import { useState } from 'react';
import { useProductFormContext } from '@/contexts/store/deliveries/product-management/product-form-context';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import type { VariantForm, VariantWithId } from './types';

const EMPTY_NEW_VARIANT: VariantForm = {
  name: '',
  price: 0,
  discountPrice: undefined,
  addons: '',
};

export const useVariantsForm = () => {
  const {
    resetForm: contextResetForm,
    formData,
    prevStep,
  } = useProductFormContext();
  const t = useTranslations('products.addProduct.step2');

  const [variants, setVariants] = useState<VariantWithId[]>(
    formData.step2?.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      price: parseFloat(String(v.price)) || 0,
      discountPrice: undefined,
      addons: '',
      isEditing: false,
    })) || [],
  );

  const [newVariant, setNewVariant] = useState<VariantForm>(EMPTY_NEW_VARIANT);

  const addVariant = () => {
    if (!newVariant.name.trim()) {
      toast.error(t('errors.nameRequired'));
      return;
    }

    if (!newVariant.price || newVariant.price <= 0) {
      toast.error(t('errors.priceRequired'));
      return;
    }

    const variant: VariantWithId = {
      id: Date.now().toString(),
      name: newVariant.name.trim(),
      price: newVariant.price,
      discountPrice: newVariant.discountPrice,
      addons: newVariant.addons,
      isEditing: false,
    };

    setVariants([...variants, variant]);
    setNewVariant(EMPTY_NEW_VARIANT);
    toast.success(t('variantAddedSuccess'));
  };

  const startEdit = (id: string) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, isEditing: true } : { ...v, isEditing: false },
      ),
    );
  };

  const saveEdit = (id: string) => {
    const variant = variants.find((v) => v.id === id);
    if (!variant) return;

    if (!variant.name.trim()) {
      toast.error(t('errors.nameRequired'));
      return;
    }

    if (!variant.price || variant.price <= 0) {
      toast.error(t('errors.priceRequired'));
      return;
    }

    setVariants(
      variants.map((v) => (v.id === id ? { ...v, isEditing: false } : v)),
    );
    toast.success(t('variantUpdatedSuccess'));
  };

  const cancelEdit = (id: string) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, isEditing: false } : v)),
    );
  };

  const updateEditingVariant = (
    id: string,
    field: string,
    value: string | number | boolean | undefined,
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const deleteVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmitAndReset = () => {
    const step1 = formData.step1;

    if (!step1) {
      toast.error(t('completeStep1Error'));
      return;
    }

    // Convert variants back to current context format
    const variantOptions = variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: String(v.price),
      image: undefined,
    }));

    // Call context reset and navigate
    contextResetForm();

    // This would trigger the parent's submit
    return variantOptions;
  };

  return {
    variants,
    newVariant,
    setNewVariant,
    addVariant,
    startEdit,
    saveEdit,
    cancelEdit,
    updateEditingVariant,
    deleteVariant,
    resetForm: handleSubmitAndReset,
    formData,
    prevStep,
  };
};
