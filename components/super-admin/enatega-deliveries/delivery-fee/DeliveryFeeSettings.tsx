'use client';

import { useGetDeliveryFees } from '@/hooks/api/super-admin/enatega-deliveries/delivery-fee';
import { DistanceBaseFeeForm } from './DistanceBaseFeeForm';
import { FixedDeliveryFeeForm } from './FixedDeliveryFeeForm';
import { OrderValueBaseFeeForm } from './OrderValueBaseFeeForm';

export const DeliveryFeeSettings = () => {
  const { data, error, isLoading } = useGetDeliveryFees();

  return (
    <div className="space-y-8 my-2">
      <FixedDeliveryFeeForm
        feeData={data}
        isLoading={isLoading}
        error={error}
        isDistanceFeeActive={Boolean(data?.is_distance_delivery_fee_active)}
      />
      <DistanceBaseFeeForm
        feeData={data}
        isLoading={isLoading}
        error={error}
        isFixedFeeActive={Boolean(data?.is_fixed_delivery_fee_active)}
      />
      <OrderValueBaseFeeForm
        feeData={data}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
