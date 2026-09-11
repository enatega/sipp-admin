'use client';

import { motion } from 'motion/react';
import { Bike, Clock, Power, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RiderTrackingItem, RiderTrackingStatus } from './types';

interface RiderMapMarkerProps {
  item: RiderTrackingItem;
  isSelected: boolean;
  onClick: () => void;
}

interface MarkerConfig {
  color: string;
  border: string;
  glow: string;
  icon: ReactNode;
}

const markerConfigs: Record<RiderTrackingStatus, MarkerConfig> = {
  active: {
    color: 'bg-emerald-500',
    border: 'border-emerald-200',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    icon: <Bike className="h-4 w-4 text-white" />,
  },
  busy: {
    color: 'bg-amber-500',
    border: 'border-amber-200',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    icon: <Clock className="h-4 w-4 text-white" />,
  },
  offline: {
    color: 'bg-slate-400',
    border: 'border-slate-200',
    glow: 'shadow-none',
    icon: <Power className="h-4 w-4 text-white" />,
  },
};

export function RiderMapMarker({ item, isSelected, onClick }: RiderMapMarkerProps) {
  const config = markerConfigs[item.trackingStatus];

  return (
    <motion.button
      type="button"
      initial={{ scale: 0.9, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      whileHover={{ y: -5, scale: 1.06 }}
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col items-center border-0 bg-transparent p-0"
      aria-label={`Rider ${item.riderName}`}
    >
      <div className="pointer-events-none absolute -top-36 left-1/2 z-30 hidden w-[220px] -translate-x-1/2 rounded-lg border border-sidebar-border bg-white p-2.5 text-left shadow-xl group-hover:block">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.riderName}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{item.riderRating.toFixed(1)}</span>
          <span>({item.riderReviews})</span>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {item.order
            ? `${item.order.orderId} - ${item.order.customerName}`
            : 'No active order'}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.riderPhone}
        </p>
      </div>

      {item.trackingStatus === 'active' ? (
        <div className="pointer-events-none absolute inset-0 scale-150 animate-ping rounded-full bg-emerald-500/20" />
      ) : null}

      <div
        className={`relative z-10 rounded-full border-2 p-2 ${config.color} ${config.border} ${config.glow} ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
      >
        {config.icon}
      </div>

      <div
        className={`-mt-1.5 h-3 w-3 rotate-45 rounded-br-sm border-b-2 border-r-2 ${config.color} ${config.border}`}
      />
      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-black/20 blur-[1px]" />
    </motion.button>
  );
}
