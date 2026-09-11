'use client';

import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Heading } from '@/components/shared/Heading';
import { OrderDetail } from '@/types/entities/super-admin/enatega-deliveries/orders';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface CustomerInformationProps {
  order: OrderDetail;
}

export function CustomerInformation({ order }: CustomerInformationProps) {
  const t = useTranslations('orders.orderDetail.customerInformation');
  if (!order.customer) return null;
  const reviewsCount = Number(order.customer.totalReviews || 0);

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white  shadow-sm">
      <Heading title={t('title')} containerClassName="mb-6" />

      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-accent/50 p-4 rounded-lg">
          {order.customer.avatar ? (
            <Image
              src={order.customer.avatar}
              alt={order.customer.name || 'Customer Avatar'}
              width={56}
              height={56}
              className="rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-black border-2 border-white">
              {order.customer.name?.charAt(0) ?? ''}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-black font-semibold text-[16px]">
              {order.customer.name}
            </span>
            <div className="flex items-center gap-1.5">
              <Star size={20} className="text-help-orange fill-help-orange" />
              <span className="text-black font-normal text-[16px]">
                {order.customer.rating || '0.0'}
              </span>
              <span className="text-mute text-[16px]">
                ({reviewsCount}{' '}
                {reviewsCount === 1
                  ? t('reviewSingular')
                  : t('reviewPlural')}
                )
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-start text-[16px]">
            <span className="text-black font-semibold">{t('emailLabel')}</span>
            <span className="text-mute font-normal">
              {order.customer.email}
            </span>
          </div>
          <div className="flex justify-between items-start text-[16px]">
            <span className="text-black font-semibold">
              {t('phoneNumberLabel')}
            </span>
            <span className="text-mute font-normal">
              {order.customer.phone}
            </span>
          </div>
          <div className="flex justify-between items-start text-[16px]">
            <span className="text-black font-semibold">
              {t('pastOrdersLabel')}
            </span>
            <span className="text-mute font-normal">
              {order.customer.totalPastOrders || 0}
            </span>
          </div>
          <div className="flex justify-between items-start text-[16px]">
            <span className="text-black font-semibold">
              {t('totalSpendingLabel')}
            </span>
            <span className="text-mute font-normal">
              <CurrencyDisplay amount={order.customer.totalSpending || 0} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
