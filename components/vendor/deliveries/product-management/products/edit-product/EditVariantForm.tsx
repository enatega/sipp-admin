'use client';

import { useTranslations } from 'next-intl';
import { AddVariantForm } from '@/components/vendor/deliveries/product-management/products/add-product/steps/step2/AddVariantForm';
import type {
  VariantForm,
  VariantWithId,
} from '@/components/vendor/deliveries/product-management/products/add-product/steps/step2/types';
import { VariantList } from '@/components/vendor/deliveries/product-management/products/add-product/steps/step2/VariantList';

interface EditVariantFormProps {
  variants: VariantWithId[];
  newVariant: VariantForm;
  onNewVariantChange: (variant: VariantForm) => void;
  onAddVariant: () => void;
  onStartEdit: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: (id: string) => void;
  onUpdateVariant: (
    id: string,
    field: string,
    value: string | number | boolean | undefined,
  ) => void;
  onDeleteVariant: (id: string) => void;
}

export const EditVariantForm: React.FC<EditVariantFormProps> = ({
  variants,
  newVariant,
  onNewVariantChange,
  onAddVariant,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateVariant,
  onDeleteVariant,
}) => {
  const t = useTranslations('products.addProduct.step2');

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('addVariantTitle')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      {/* Add New Variant Form */}
      <AddVariantForm
        newVariant={newVariant}
        setNewVariant={onNewVariantChange}
        onAdd={onAddVariant}
      />

      {/* Variants List */}
      <VariantList
        variants={variants}
        onStartEdit={onStartEdit}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onUpdateVariant={onUpdateVariant}
        onDeleteVariant={onDeleteVariant}
      />
    </div>
  );
};

