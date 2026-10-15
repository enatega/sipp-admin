'use client';

import * as React from 'react';
import { isPickupOrder } from '../../utils';
import { IRightColumnProps } from '../types';
import { CustomerInformation } from './CustomerInformation';
import { ProductDeliveryInformation } from './order-types/ProductDeliveryInformation';
import { PaymentInformation } from './PaymentInformation';
import { RiderInformation } from './RiderInformation';

export const RightColumn: React.FC<IRightColumnProps> = ({ order }) => {
  const pickupOrder = isPickupOrder(order?.orderType);
  const renderOrderTypeContent = () => {
    if (pickupOrder) return null;
    // If delivery data is present (API may use `deliveryInfo`), show delivery info
    if (order?.delivery || order?.deliveryInfo) {
      return <ProductDeliveryInformation order={order} />;
    }

    switch (order?.orderType) {
      case 'Delivery':
        return <ProductDeliveryInformation order={order} />;
      default:
        return null;
    }
  };

  return (
    <div className="xl:basis-[30%] w-full flex flex-col gap-6">
      {!pickupOrder && <RiderInformation order={order} />}
      <PaymentInformation order={order} />
      <CustomerInformation order={order} />
      {renderOrderTypeContent()}
    </div>
  );
};
