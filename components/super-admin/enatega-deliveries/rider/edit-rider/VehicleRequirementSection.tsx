'use client';

import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { VehicleType } from '@/types/entities/super-admin/enatega-deliveries/vehicle-type';
import { AppCheckBox } from '@/components/shared/AppCheckBox';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';

interface VehicleRequirementsSectionProps {
  vehicleTypes?: VehicleType[];
}

const ConditionalVehicleFields = ({
  vehicleTypes,
}: {
  vehicleTypes?: VehicleType[];
}) => {
  const t = useTranslations('driverManagement.editDriver');
  const { values } = useFormikContext<{ vehicle_type: string }>();
  const vehicleTypeId = values.vehicle_type;

  // Find the vehicle type name by matching the ID
  const vehicleType = vehicleTypes?.find((type) => type.id === vehicleTypeId);
  const vehicleTypeName = vehicleType?.name?.toLowerCase() || '';

  if (vehicleTypeName === 'car') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppCheckBox name="air_conditioning" label={t('airConditioning')} />
        <div className="hidden md:block" />
      </div>
    );
  }

  if (vehicleTypeName === 'bike') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppCheckBox name="helmet" label={t('helmet')} />
        <div className="hidden md:block" />
      </div>
    );
  }

  return null;
};

export const VehicleRequirementsSection = ({
  vehicleTypes,
}: VehicleRequirementsSectionProps) => {
  const t = useTranslations('driverManagement.editDriver');
  const vehicleTypeOptions = vehicleTypes?.map((type) => ({
    key: type.name,
    value: type.id, // Use ID as value to match API response
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('vehicleInfoTitle')}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {t('vehicleInfoDescription')}
      </p>
      <div className="space-y-6">
        <AppSelect
          className="col-span-2"
          label={t('vehicleTypeLabel')}
          name="vehicle_type"
          placeholder={t('vehicleTypePlaceholder')}
          options={vehicleTypeOptions || []}
          requiredAsterisk
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInputField
            label={t('vehicleNameLabel')}
            name="vehicle_brand"
            type="text"
            placeholder={t('vehicleNamePlaceholder')}
            requiredAsterisk
          />
          <AppInputField
            label={t('modelYearLimitLabel')}
            name="model_year_limit"
            type="number"
            placeholder={t('modelYearLimitPlaceholder')}
            requiredAsterisk
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInputField
            label={t('vehicleColourLabel')}
            name="vehicle_color"
            type="text"
            placeholder={t('vehicleColourPlaceholder')}
            requiredAsterisk
          />
          <AppInputField
            label={t('vehicleNoLabel')}
            name="vehicle_number"
            type="text"
            placeholder={t('vehicleNoPlaceholder')}
            requiredAsterisk
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppCheckBox
            name="vehicle_in_good_condition"
            label={t('vehicleInGoodCondition')}
            requiredAsterisk
          />

          <AppCheckBox
            name="insulated_delivery_bag"
            label={t('insulatedDeliveryBag')}
            requiredAsterisk
          />
        </div>

        <ConditionalVehicleFields vehicleTypes={vehicleTypes} />
      </div>
    </div>
  );
};
