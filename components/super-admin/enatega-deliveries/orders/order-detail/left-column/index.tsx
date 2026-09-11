'use client';

import { ILeftColumnProps } from '../types';
import { ItemsServices } from './order-types/ItemsServices';
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
      <OrderStatusTimeline logs={order?.logs || []} />
      {renderOrderTypeContent()}
      <OrderLogs logs={order.logs || []} />
    </div>
  );
}
