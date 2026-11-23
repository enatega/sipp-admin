'use client';

import { Heading } from '@/components/shared/Heading';
import Status from '@/components/shared/Status';
import { OrderLog } from '@/types';
import { formatAdminDateTime } from '@/lib/adminDateTime';
import { formatOrderStatusLabel, normalizeOrderValue } from '../../utils';
import {
  Bike,
  CheckCircle2,
  ClipboardCheck,
  Hourglass,
  LucideIcon,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  icon: LucideIcon;
}

interface OrderStatusTimelineProps {
  logs?: OrderLog[];
  status?: string;
  storeTimezone?: string | null;
}

function getStepKey(status?: string) {
  switch (normalizeOrderValue(status)) {
    case 'pending':
    case 'order_placed': return 'placed';
    case 'accepted':
    case 'order_accepted': return 'accepted';
    case 'preparing':
    case 'order_preparing': return 'preparing';
    case 'ready':
    case 'ready_for_pickup': return 'ready';
    case 'assigned':
    case 'rider_assigned': return 'assigned';
    case 'picked_up':
    case 'picked_by_rider': return 'picked';
    case 'out_for_delivery':
    case 'out_of_delivery':
    case 'dispatched': return 'dispatched';
    case 'arrived':
    case 'rider_arrived': return 'arrived';
    case 'delivered':
    case 'order_delivered': return 'delivered';
    default: return null;
  }
}

function chooseIcon(stepKey: ReturnType<typeof getStepKey>): LucideIcon {
  switch (stepKey) {
    case 'accepted': return ClipboardCheck;
    case 'preparing': return Hourglass;
    case 'ready': return Package;
    case 'assigned':
    case 'picked': return Bike;
    case 'dispatched': return Truck;
    case 'arrived': return MapPin;
    case 'delivered': return CheckCircle2;
    default: return ShoppingBag;
  }
}

function getActorKey(actor?: string) {
  const normalized = String(actor ?? '').trim().toLowerCase();
  if (normalized.includes('customer')) return 'customer';
  if (normalized.includes('store')) return 'store';
  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('rider')) return 'rider';
  return null;
}

export function OrderStatusTimeline({ logs = [], status, storeTimezone }: OrderStatusTimelineProps) {
  const t = useTranslations('orders.orderDetail.statusTimeline');
  const tActors = useTranslations('orders.orderDetail.statusTimeline.actors');
  const tStatuses = useTranslations('orders.statuses');
  const tPlaced = useTranslations('orders.orderDetail.statusTimeline.steps.placed');
  const tAccepted = useTranslations('orders.orderDetail.statusTimeline.steps.accepted');
  const tPreparing = useTranslations(
    'orders.orderDetail.statusTimeline.steps.preparing',
  );
  const tReady = useTranslations('orders.orderDetail.statusTimeline.steps.ready');
  const tAssigned = useTranslations(
    'orders.orderDetail.statusTimeline.steps.assigned',
  );
  const tDelivered = useTranslations(
    'orders.orderDetail.statusTimeline.steps.delivered',
  );
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const stepTitles: Record<NonNullable<ReturnType<typeof getStepKey>>, string> = {
    placed: tPlaced('title'),
    accepted: tAccepted('title'),
    preparing: tPreparing('title'),
    ready: tReady('title'),
    assigned: tAssigned('title'),
    picked: tStatuses('pickedUp'),
    dispatched: tStatuses('outForDelivery'),
    arrived: tStatuses('arrived'),
    delivered: tDelivered('title'),
  };
  const timelineData: TimelineItem[] = [
    {
      id: 'placed',
      title: stepTitles.placed,
      subtitle: tPlaced('subtitle'),
      icon: ShoppingBag,
    },
    {
      id: 'accepted',
      title: stepTitles.accepted,
      subtitle: tAccepted('subtitle'),
      icon: ClipboardCheck,
    },
    {
      id: 'preparing',
      title: stepTitles.preparing,
      subtitle: tPreparing('subtitle'),
      icon: Hourglass,
    },
    {
      id: 'ready',
      title: stepTitles.ready,
      icon: Package,
    },
    {
      id: 'assigned',
      title: stepTitles.assigned,
      subtitle: tAssigned('subtitle'),
      icon: Bike,
    },
    {
      id: 'picked',
      title: stepTitles.picked,
      icon: Bike,
    },
    {
      id: 'dispatched',
      title: stepTitles.dispatched,
      icon: Truck,
    },
    {
      id: 'arrived',
      title: stepTitles.arrived,
      icon: MapPin,
    },
    {
      id: 'delivered',
      title: stepTitles.delivered,
      icon: CheckCircle2,
    },
  ];

  const chronologicalLogs = [...logs].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
  );
  const items = chronologicalLogs.length > 0
    ? chronologicalLogs.map((l, i) => {
        const stepKey = getStepKey(l.status);
        const Icon = chooseIcon(stepKey);
        const actorKey = getActorKey(l.by);
        const dateStr = formatAdminDateTime(l.date, '', storeTimezone || 'UTC');

        return {
          id: `log-${i}`,
          title: stepKey
            ? stepTitles[stepKey]
            : formatOrderStatusLabel(l.status, tStatuses, t('fallbackStatus')),
          subtitle: actorKey
            ? `${t('byPrefix')} ${tActors(actorKey)}`
            : l.by
              ? `${t('byPrefix')} ${l.by}`
              : undefined,
          date: dateStr,
          icon: Icon,
        };
      })
    : timelineData;

  const effectiveActive = Math.min(
    activeStep ?? (chronologicalLogs.length > 0 ? items.length - 1 : 0),
    items.length - 1,
  );
  const currentStatus = status || chronologicalLogs.at(-1)?.status;

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Heading title={t('title')} containerClassName="mb-0" />
        <Status
          status={currentStatus || 'pending'}
          className="m-0"
          label={formatOrderStatusLabel(currentStatus, tStatuses, t('fallbackStatus'))}
        />
      </div>

      <div className="relative">
        {items.map((item, index) => {
          const isActive = index <= effectiveActive;
          const isSelected = index === effectiveActive;
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <div
              key={item?.id}
              className="flex gap-6 group cursor-pointer"
              onClick={() => setActiveStep(index)}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center p-2 border-2 transition-all duration-300
                    ${
                      isSelected
                        ? 'border-primary bg-white text-primary'
                        : isActive
                          ? 'border-primary bg-primary text-white'
                          : 'border-dashed border-mute bg-white text-mute'
                    }
                  `}
                >
                  <Icon size={20} />
                </div>
                {!isLast && (
                  <div
                    className={`
                      w-[2px] h-full min-h-[50px] transition-colors duration-300
                      ${isActive ? 'bg-primary' : 'border-l-2 border-dashed border-mute'}
                    `}
                  />
                )}
              </div>

              <div className="flex flex-col flex-1 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h4
                      className={`text-[16px] font-semibold transition-colors duration-300 ${
                        isActive ? 'text-black' : 'text-mute'
                      }`}
                    >
                      {item?.title}
                    </h4>
                    {item?.subtitle && (
                      <p className="text-mute text-sm mt-0.5 font-medium">
                        {item?.subtitle}
                      </p>
                    )}
                  </div>
                  {item?.date && isActive && (
                    <div className="text-right">
                      <p className="text-black text-[14px] font-semibold">
                        {item?.date}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
