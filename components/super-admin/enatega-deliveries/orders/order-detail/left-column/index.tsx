'use client';

import { ILeftColumnProps } from '../types';
import { ItemsServices } from './order-types/ItemsServices';
import { OrderInstructions } from './OrderInstructions';
import { OrderLogs } from './OrderLogs';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { OrderSummary } from './OrderSummary';

export function LeftColumn({ order }: ILeftColumnProps) {
  const renderOrderTypeContent = () => {
    return <ItemsServices items={order?.items || []} />;
  };

  return (
    <div className="xl:basis-[70%] w-full flex flex-col gap-6">
      <OrderSummary order={order} />
      <OrderInstructions order={order} />
      <OrderStatusTimeline logs={order?.timelineLogs || order?.logs || []} status={order?.status} storeTimezone={order.storeTimezone} />
      {renderOrderTypeContent()}
      <OrderLogs logs={order.logs || []} storeTimezone={order.storeTimezone} />
    </div>
  );
}
