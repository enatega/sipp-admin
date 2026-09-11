'use client';

import { LeftColumn } from '../left-column';
import { RightColumn } from '../right-column';
import { IOrderDetailMainProps } from '../types';

export function OrderDetailMain({ order }: IOrderDetailMainProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="xl:w-[70%]">
        <LeftColumn order={order} />
      </div>

      <div className="xl:w-[30%]">
        <RightColumn order={order} />
      </div>
    </div>
  );
}