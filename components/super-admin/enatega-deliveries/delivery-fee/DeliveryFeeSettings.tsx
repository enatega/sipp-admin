'use client';

import { useGetDeliveryFees } from '@/hooks/api/super-admin/enatega-deliveries/delivery-fee';
import { DistanceBaseFeeForm } from './DistanceBaseFeeForm';
import { FixedDeliveryFeeForm } from './FixedDeliveryFeeForm';
import { OrderValueBaseFeeForm } from './OrderValueBaseFeeForm';
import { DeliveryFeeCalculatorSheet } from './DeliveryFeeCalculatorSheet';

export const DeliveryFeeSettings = () => {
  const { data, error, isLoading } = useGetDeliveryFees();

  return (
    <div className="space-y-8 my-2">
      <div className="flex justify-end">
        <DeliveryFeeCalculatorSheet
          feeData={data}
          disabled={isLoading || Boolean(error) || !data}
        />
      </div>
      <FixedDeliveryFeeForm
        feeData={data}
        isLoading={isLoading}
        error={error}
      />
      <DistanceBaseFeeForm
        feeData={data}
        isLoading={isLoading}
        error={error}
      />
      <OrderValueBaseFeeForm
        feeData={data}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
