'use client';

import type { VariantForm, VariantWithId } from '@/components/store/deliveries/product-management/products/add-product/steps/step2/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import toast from 'react-hot-toast';

const EMPTY_NEW_VARIANT: VariantForm = {
    name: '',
    price: 0,
    discountPrice: undefined,
    addons: '',
};

export const useEditVariants = () => {
    const t = useTranslations('products.addProduct.step2');
    const [variants, setVariants] = useState<VariantWithId[]>([]);
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
                v.id === id ? { ...v, isEditing: true } : { ...v, isEditing: false }
            )
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
            variants.map((v) =>
                v.id === id ? { ...v, isEditing: false } : v
            )
        );
        toast.success(t('variantUpdatedSuccess'));
    };

    const cancelEdit = (id: string) => {
        setVariants(
            variants.map((v) =>
                v.id === id ? { ...v, isEditing: false } : v
            )
        );
    };

    const updateEditingVariant = (id: string, field: string, value: string | number | boolean | undefined) => {
        setVariants(
            variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    const deleteVariant = (id: string) => {
        setVariants(variants.filter((v) => v.id !== id));
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
    };
};
