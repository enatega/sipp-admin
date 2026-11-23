'use client';

import { useQueryParams } from '@/hooks/use-query-params';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface Props {
  paramKey?: string;
  label?: string;
  placeholder?: string;
  options: { key: string; value: string }[];
  containerClassName?: string;
}

export function StatusSelectFilter({
  paramKey = 'status',
  label,
  placeholder,
  options,
  containerClassName = 'min-w-[150px]',
}: Props) {
  const { getParam, setParams } = useQueryParams();

  const status = getParam(paramKey);
  const normalizedStatus = status === 'all' ? '' : status;

  return (
    <AppSelect
      key={normalizedStatus || 'empty'}
      name={paramKey}
      label={label}
      placeholder={placeholder || 'Select Status'}
      options={options}
      value={normalizedStatus || ''}
      onValueChange={(value) => {
        setParams({ [paramKey]: value || null, page: '1' });
      }}
      containerClassName={containerClassName}
      className="rounded-[6px]"
    />
  );
}
