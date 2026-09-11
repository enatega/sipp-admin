'use client';

import { useTranslations } from 'next-intl';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface Props {
  paramKey?: string;
  label?: string;
  placeholder?: string;
}

export function ZoneSelectFilter({
  paramKey = 'zone',
  label,
  placeholder,
}: Props) {
  const t = useTranslations('common.filters');
  const { getParam, setParams } = useQueryParams();
  const { data: zones, isLoading } = useGetZonesSimple();

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  const zone = getParam(paramKey);

  return (
    <AppSelect
      key={zone || 'empty'} // Force re-render when value changes
      name={paramKey}
      label={label}
      placeholder={placeholder || t('zoneTypesPlaceholder')}
      options={zoneOptions}
      value={zone || ''}
      onValueChange={(value) => {
        setParams({ [paramKey]: value || null, page: '1' });
      }}
      containerClassName="min-w-[150px]"
      className="rounded-[6px]"
      disabled={isLoading}
    />
  );
}
