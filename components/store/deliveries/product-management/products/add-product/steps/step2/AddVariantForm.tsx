'use client';

import { ADDON_OPTIONS } from '@/constants/product-form.constants';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import type { VariantForm } from './types';

interface AddVariantFormProps {
  newVariant: VariantForm;
  setNewVariant: (variant: VariantForm) => void;
  onAdd: () => void;
}

export const AddVariantForm: React.FC<AddVariantFormProps> = ({
  newVariant,
  setNewVariant,
  onAdd,
}) => {
  const t = useTranslations('products.addProduct.step2');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">
          {t('addVariantTitle')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AppInputField
          label={t('nameLabel')}
          name="variantName"
          type="text"
          placeholder={t('namePlaceholder')}
          value={newVariant.name}
          onChange={(e) =>
            setNewVariant({ ...newVariant, name: e.target.value })
          }
          requiredAsterisk
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInputField
            label={`${t('priceLabel')} (${resolvedCurrencySymbol})`}
            name="variantPrice"
            type="number"
            placeholder={t('pricePlaceholder')}
            step="0.01"
            min="0"
            prefix={<span className="font-semibold text-primary">{resolvedCurrencySymbol}</span>}
            value={newVariant.price || ''}
            onChange={(e) =>
              setNewVariant({
                ...newVariant,
                price: parseFloat(e.target.value) || 0,
              })
            }
            requiredAsterisk
          />

          <AppInputField
            label={`${t('discountPriceLabel')} (${t('optional')}) (${resolvedCurrencySymbol})`}
            name="discountPrice"
            type="number"
            placeholder={t('discountPricePlaceholder')}
            step="0.01"
            min="0"
            prefix={<span className="font-semibold text-primary">{resolvedCurrencySymbol}</span>}
            value={newVariant.discountPrice || ''}
            onChange={(e) =>
              setNewVariant({
                ...newVariant,
                discountPrice: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
          />
        </div>

        <AppSelect
          label={t('addonsLabel')}
          name="addons"
          placeholder={t('addonsPlaceholder')}
          options={ADDON_OPTIONS}
          value={newVariant.addons}
          onValueChange={(value) =>
            setNewVariant({ ...newVariant, addons: value })
          }
        />
      </div>

      <AppButton
        type="button"
        variant="secondary"
        onClick={onAdd}
        className="rounded-[12px] mt-4"
        leftIcon={<Plus className="h-4 w-4" />}
      >
        {t('addVariantButton')}
      </AppButton>
    </div>
  );
};
