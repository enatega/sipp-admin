'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { useProductFavouriteFoodOptions, type ProductFavouriteFoodOption } from '@/hooks/api/store/deliveries/product-management/favourite-foods';

interface Props {
  storeId?: string;
  initialSelected?: ProductFavouriteFoodOption[];
}

export function ProductFavouriteFoodTagsField({ storeId, initialSelected = [] }: Props) {
  const t = useTranslations('products.addProduct.step1');
  const tErrors = useTranslations('products.errors');
  const locale = useLocale().split('-')[0];
  const { data, isPending, isError, refetch } = useProductFavouriteFoodOptions(storeId);
  const options = new Map<string, ProductFavouriteFoodOption>();
  initialSelected.forEach((food) => options.set(food.id, food));
  data?.forEach((food) => options.set(food.id, food));

  return (
    <div className="md:col-span-2 space-y-1">
      <MultiSelect
        name="favouriteFoodIds"
        label={t('favouriteFoodTagsLabel')}
        placeholder={isPending && storeId ? t('favouriteFoodTagsLoading') : t('favouriteFoodTagsPlaceholder')}
        helperText={t('favouriteFoodTagsHelp')}
        options={[...options.values()].map((food) => ({
          key: `${food.nameTranslations?.[locale] || food.name}${food.isActive === false || food.isDeleted ? ` (${t('favouriteFoodTagsInactive')})` : ''}`,
          value: food.id,
        }))}
        disabled={!storeId || isPending || isError}
      />
      {isError && (
        <p className="text-sm text-destructive" role="alert">
          {t('favouriteFoodTagsLoadError')}{' '}
          <button type="button" onClick={() => void refetch()} className="font-medium underline underline-offset-2">
            {tErrors('retry')}
          </button>
        </p>
      )}
    </div>
  );
}
