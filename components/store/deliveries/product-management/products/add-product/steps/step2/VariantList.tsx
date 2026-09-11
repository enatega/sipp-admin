'use client';

import { ADDON_OPTIONS } from '@/constants/product-form.constants';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import type { VariantWithId } from './types';

interface VariantListProps {
  variants: VariantWithId[];
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

export const VariantList: React.FC<VariantListProps> = ({
  variants,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateVariant,
  onDeleteVariant,
}) => {
  const t = useTranslations('products.addProduct.step2');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {t('variantsListTitle')}
      </h3>
      {variants.map((variant, index) => (
        <div
          key={variant.id}
          className={`border border-gray-200 rounded-lg p-4 ${
            variant.isEditing ? 'bg-blue-50 border-blue-300' : ''
          }`}
        >
          {variant.isEditing ? (
            <VariantEditor
              variant={variant}
              onUpdateVariant={onUpdateVariant}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              addonOptions={ADDON_OPTIONS}
              resolvedCurrencySymbol={resolvedCurrencySymbol}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  {t('variantLabel')} {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onStartEdit(variant.id)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title={t('editButton')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteVariant(variant.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title={t('deleteButton')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t('nameLabel')}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {variant.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {`${t('priceLabel')} (${resolvedCurrencySymbol})`}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(variant.price, resolvedCurrencySymbol)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {`${t('discountPriceLabel')} (${resolvedCurrencySymbol})`}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {variant.discountPrice
                      ? formatCurrency(
                          variant.discountPrice,
                          resolvedCurrencySymbol,
                        )
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t('addonsLabel')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {variant.addons && variant.addons !== 'none'
                      ? ADDON_OPTIONS.find((a) => a.value === variant.addons)
                          ?.key
                      : '-'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// Variant Editor Component (inline form for editing)
interface VariantEditorProps {
  variant: VariantWithId;
  onUpdateVariant: (
    id: string,
    field: string,
    value: string | number | boolean | undefined,
  ) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: (id: string) => void;
  addonOptions: { key: string; value: string }[];
  resolvedCurrencySymbol: string;
}

const VariantEditor: React.FC<VariantEditorProps> = ({
  variant,
  onUpdateVariant,
  onSaveEdit,
  onCancelEdit,
  addonOptions,
  resolvedCurrencySymbol,
}) => {
  const t = useTranslations('products.addProduct.step2');

  return (
    <div className="grid grid-cols-1 gap-4">
      <AppInputField
        label={t('nameLabel')}
        name={`edit-name-${variant.id}`}
        type="text"
        placeholder={t('namePlaceholder')}
        value={variant.name}
        onChange={(e) => onUpdateVariant(variant.id, 'name', e.target.value)}
        requiredAsterisk
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInputField
          label={`${t('priceLabel')} (${resolvedCurrencySymbol})`}
          name={`edit-price-${variant.id}`}
          type="number"
          placeholder={t('pricePlaceholder')}
          step="0.01"
          min="0"
          prefix={<span className="font-semibold text-primary">{resolvedCurrencySymbol}</span>}
          value={variant.price}
          onChange={(e) =>
            onUpdateVariant(
              variant.id,
              'price',
              parseFloat(e.target.value) || 0,
            )
          }
          requiredAsterisk
        />

        <AppInputField
          label={`${t('discountPriceLabel')} (${t('optional')}) (${resolvedCurrencySymbol})`}
          name={`edit-discount-${variant.id}`}
          type="number"
          placeholder={t('discountPricePlaceholder')}
          step="0.01"
          min="0"
          prefix={<span className="font-semibold text-primary">{resolvedCurrencySymbol}</span>}
          value={variant.discountPrice || ''}
          onChange={(e) =>
            onUpdateVariant(
              variant.id,
              'discountPrice',
              e.target.value ? parseFloat(e.target.value) : undefined,
            )
          }
        />
      </div>

      <AppSelect
        label={t('addonsLabel')}
        name={`edit-addons-${variant.id}`}
        placeholder={t('addonsPlaceholder')}
        options={addonOptions}
        value={variant.addons}
        onValueChange={(value) => onUpdateVariant(variant.id, 'addons', value)}
      />

      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => onSaveEdit(variant.id)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {t('saveButton')}
        </button>
        <button
          type="button"
          onClick={() => onCancelEdit(variant.id)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          {t('cancelButton')}
        </button>
      </div>
    </div>
  );
};
