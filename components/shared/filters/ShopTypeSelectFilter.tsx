'use client';

import { useTranslations } from 'next-intl';
import { useGetAllShopTypesSimple } from '@/hooks/api/super-admin/enatega-deliveries/shop-type';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface Props {
  paramKey?: string;
  label?: string;
  placeholder?: string;
}

export function ShopTypeSelectFilter({
  paramKey = 'shopType',
  label,
  placeholder,
}: Props) {
  const t = useTranslations('common.filters');
  const { getParam, setParams } = useQueryParams();
  const { data: shopTypes, isLoading } = useGetAllShopTypesSimple();

  const shopTypeOptions =
    shopTypes?.map((shopType) => ({
      key: shopType.name,
      value: shopType.id,
    })) || [];

  const shopType = getParam(paramKey);

  return (
    <AppSelect
      key={shopType || 'empty'}
      name={paramKey}
      label={label}
      placeholder={placeholder || t('shopTypePlaceholder')}
      options={shopTypeOptions}
      value={shopType || ''}
      onValueChange={(value) => {
        setParams({ [paramKey]: value || null, page: '1' });
      }}
      containerClassName="min-w-[150px]"
      className="rounded-[6px]"
      disabled={isLoading}
    />
  );
}
