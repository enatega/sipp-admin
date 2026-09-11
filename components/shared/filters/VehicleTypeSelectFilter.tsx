'use client';

import { useGetVehicleTypes } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface Props {
  paramKey?: string;
  label?: string;
  placeholder?: string;
}

export function VehicleTypeSelectFilter({
  paramKey = 'vehicleType',
  label,
  placeholder,
}: Props) {
  const { getParam, setParams } = useQueryParams();
  const { data: vehicleTypesData, isLoading } = useGetVehicleTypes();

  const vehicleTypeOptions =
    vehicleTypesData?.map((vehicleType) => ({
      key: vehicleType.name,
      value: vehicleType.id,
    })) || [];

  const vehicleType = getParam(paramKey);

  return (
    <AppSelect
      key={vehicleType || 'empty'}
      name={paramKey}
      label={label}
      placeholder={placeholder || 'Select Vehicle Type'}
      options={vehicleTypeOptions}
      value={vehicleType || ''}
      onValueChange={(value) => {
        setParams({ [paramKey]: value, page: '1' });
      }}
      containerClassName="min-w-[150px]"
      className="rounded-[6px]"
      disabled={isLoading}
    />
  );
}
