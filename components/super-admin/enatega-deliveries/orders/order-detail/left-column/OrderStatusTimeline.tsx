'use client';

import { Heading } from '@/components/shared/Heading';
import Status from '@/components/shared/Status';
import { OrderLog } from '@/types';
import {
  Bike,
  CheckCircle2,
  ClipboardCheck,
  Hourglass,
  LucideIcon,
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
  time?: string;
  icon: LucideIcon;
}

interface OrderStatusTimelineProps {
  logs?: OrderLog[];
}

function chooseIcon(status?: string) {
  if (!status) return ShoppingBag;
  const s = String(status).toLowerCase();
  if (s.includes('placed')) return ShoppingBag;
  if (s.includes('accepted')) return ClipboardCheck;
  if (s.includes('prepar') || s.includes('preparing')) return Hourglass;
  if (s.includes('ready')) return Package;
  if (s.includes('assigned') || s.includes('rider')) return Bike;
  if (s.includes('picked')) return Bike;
  if (s.includes('out') || s.includes('dispatch') || s.includes('dispatched')) return Truck;
  if (s.includes('deliv')) return CheckCircle2;
  return ShoppingBag;
}

function getStepKey(status?: string) {
  if (!status) return null;
  const s = String(status).toLowerCase();
  if (s.includes('placed')) return 'placed';
  if (s.includes('accepted')) return 'accepted';
  if (s.includes('prepar')) return 'preparing';
  if (s.includes('ready')) return 'ready';
  if (s.includes('assigned') || s.includes('rider')) return 'assigned';
  if (s.includes('picked')) return 'picked';
  if (s.includes('out') || s.includes('dispatch')) return 'dispatched';
  if (s.includes('deliv')) return 'delivered';
  return null;
}

function getActorKey(actor?: string) {
  const normalized = String(actor ?? '').trim().toLowerCase();
  if (normalized.includes('customer')) return 'customer';
  if (normalized.includes('store')) return 'store';
  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('rider')) return 'rider';
  return null;
}

export function OrderStatusTimeline({ logs }: OrderStatusTimelineProps) {
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
  const tPicked = useTranslations('orders.orderDetail.statusTimeline.steps.picked');
  const tDispatched = useTranslations(
    'orders.orderDetail.statusTimeline.steps.dispatched',
  );
  const tDelivered = useTranslations(
    'orders.orderDetail.statusTimeline.steps.delivered',
  );
  const [activeStep, setActiveStep] = useState(0);
  const timelineData: TimelineItem[] = [
    {
      id: 'placed',
      title: tPlaced('title'),
      subtitle: tPlaced('subtitle'),
      date: '17 Nov 2025',
      time: '10:20 am',
      icon: ShoppingBag,
    },
    {
      id: 'accepted',
      title: tAccepted('title'),
      subtitle: tAccepted('subtitle'),
      date: '17 Nov 2025',
      time: '10:22 am',
      icon: ClipboardCheck,
    },
    {
      id: 'preparing',
      title: tPreparing('title'),
      subtitle: tPreparing('subtitle'),
      date: '17 Nov 2025',
      time: '10:30 am',
      icon: Hourglass,
    },
    {
      id: 'ready',
      title: tReady('title'),
      date: '17 Nov 2025',
      time: '10:48 am',
      icon: Package,
    },
    {
      id: 'assigned',
      title: tAssigned('title'),
      subtitle: tAssigned('subtitle'),
      icon: Bike,
    },
    {
      id: 'picked',
      title: tPicked('title'),
      subtitle: tPicked('subtitle'),
      icon: Bike,
    },
    {
      id: 'dispatched',
      title: tDispatched('title'),
      icon: Truck,
    },
    {
      id: 'delivered',
      title: tDelivered('title'),
      icon: CheckCircle2,
    },
  ];

  const items = (logs && logs.length > 0)
    ? logs.map((l, i) => {
        const Icon = chooseIcon(l.status);
        const stepKey = getStepKey(l.status);
        const actorKey = getActorKey(l.by);
        let dateStr = l.date || '';
        let timeStr = '';
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString();
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } catch {
          // keep original
        }

        return {
          id: `log-${i}`,
          title:
            stepKey === 'placed'
              ? tPlaced('title')
              : stepKey === 'accepted'
                ? tAccepted('title')
                : stepKey === 'preparing'
                  ? tPreparing('title')
                  : stepKey === 'ready'
                    ? tReady('title')
                    : stepKey === 'assigned'
                      ? tAssigned('title')
                      : stepKey === 'picked'
                        ? tPicked('title')
                        : stepKey === 'dispatched'
                          ? tDispatched('title')
                          : stepKey === 'delivered'
                            ? tDelivered('title')
                            : l.status || t('fallbackStatus'),
          subtitle: actorKey
            ? `${t('byPrefix')} ${tActors(actorKey)}`
            : l.by
              ? `${t('byPrefix')} ${l.by}`
              : undefined,
          date: dateStr,
          time: timeStr,
          icon: Icon,
        };
      })
    : timelineData;

  const effectiveActive = logs && logs.length > 0 ? items.length - 1 : Math.min(activeStep, timelineData.length - 1);

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Heading title={t('title')} containerClassName="mb-0" />
        <Status
          status="in_progress"
          className="m-0"
          label={tStatuses('inProgress')}
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
                  {(item?.date || item?.time) && isActive && (
                    <div className="text-right">
                      <p className="text-black text-[14px] font-semibold">
                        {item?.date}
                      </p>
                      <p className="text-mute text-[12px] mt-0.5 font-medium">
                        {item?.time}
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
