'use client';

import { Heading } from '@/components/shared/Heading';
import type { OrderDetail as Order } from '@/types';
import { MapPin } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

interface IProductDeliveryInformationProps {
  order: Order;
}

export const ProductDeliveryInformation: React.FC<
  IProductDeliveryInformationProps
> = ({ order }) => {
  const t = useTranslations('orders.orderDetail.productDeliveryInformation');
  const fmt = (v: unknown) => {
    if (v === null || v === undefined) return t('notAvailable');
    if (typeof v === 'string') {
      const value = v.trim();
      return value === '' ? t('notAvailable') : value;
    }
    return String(v);
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-sidebar-border ">
      <Heading title={t('title')} containerClassName="mb-6" />

      <div className="flex flex-col gap-3 relative">
        {/* Pickup */}
        <div className="flex gap-4 relative items-start">
          <div className="mt-1">
            <MapPin className="text-help-green w-5 h-5" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-black mb-1">
              {t('pickupLabel')}
            </p>
            <p className="text-[16px] text-mute max-w-[250px]">
              {fmt(order?.deliveryInfo?.pickupAddress ?? order?.delivery?.pickupAddress ?? order?.pickupAddress)}
            </p>
          </div>
        </div>

        {/* Dropoff */}
        <div className="flex gap-4 items-start">
          <div className="mt-1">
            <MapPin className="text-help-red w-5 h-5" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-black mb-1">
              {t('dropoffLabel')}
            </p>
            <p className="text-[16px] text-mute max-w-[250px]">
              {fmt(order?.deliveryInfo?.dropoffAddress ?? order?.delivery?.dropoffAddress ?? order?.dropoffAddress)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-black font-semibold text-[16px]">{t('distanceLabel')}</span>
          <span className="font-normal text-mute">{fmt(order?.deliveryInfo?.distance ?? order?.delivery?.distance ?? order?.distance)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-black font-semibold text-[16px]">{t('etaLabel')}</span>
          <span className="font-normal text-mute">{fmt(order?.deliveryInfo?.eta ?? order?.delivery?.eta ?? order?.eta)}</span>
        </div>

        
      </div>
    </div>
  );
};
