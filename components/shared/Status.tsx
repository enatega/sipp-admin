import { memo } from 'react';

interface StatusProps {
  status?: string | number | null;
  className?: string;
  label?: string;
}

const statusClassMap: { [key: string]: string } = {
  scheduled: 'bg-primary-soft text-ink',
  pending: 'bg-primary-soft text-ink',
  running: 'bg-yellow-100 text-yellow-500',
  in_progress: 'bg-orange-100 text-orange-500',
  inprogress: 'bg-orange-100 text-orange-500',
  'in-progress': 'bg-orange-100 text-orange-500',
  ongoing: 'bg-orange-100 text-orange-500',

  opened: 'bg-yellow-100 text-yellow-500',
  preparing: 'bg-yellow-100 text-yellow-500',
  rider_assigned: 'bg-primary-soft text-ink',
  worker_assigned: 'bg-primary-soft text-ink',
  ready: 'bg-primary-soft text-ink',
  ready_for_pickup: 'bg-primary-soft text-ink',
  out_of_delivery: 'bg-orange-500/30 text-orange-500',
  in_transit: 'bg-orange-500/30 text-orange-500',

  completed: 'bg-green-500/30 text-green-500',
  delivered: 'bg-green-500/30 text-green-500',
  closed: 'bg-green-500/30 text-green-500',
  approved: 'bg-green-500/30 text-green-500',
  automatic: 'bg-emerald-100 text-emerald-700',
  approved_by_admin: 'bg-primary/30 text-ink',
  refunded: 'bg-green-500/30 text-green-500',
  claimed: 'bg-green-500/30 text-green-500',
  transfered: 'bg-green-500/30 text-green-500',
  active: 'bg-green-500/30 text-green-500',
  accepted: 'bg-primary/30 text-ink',
  assigned: 'bg-primary/30 text-ink',
  resolved: 'bg-green-500/30 text-green-500',
  confirmed: 'bg-emerald-500/30 text-emerald-600',
  booked: 'bg-emerald-500/30 text-emerald-600',
  on_my_way: 'bg-primary/30 text-ink',
  reached: 'bg-primary/30 text-ink',
  service_started: 'bg-primary/30 text-ink',
  marked_complete: 'bg-green-500/30 text-green-500',
  payment_requested: 'bg-amber-500/30 text-amber-600',

  paid: 'bg-green-500/30 text-green-500',
  unpaid: 'bg-red-500/30 text-red-500',
  instock: 'bg-green-500/30 text-green-500',
  in_stock: 'bg-green-500/30 text-green-500',
  out_of_stock: 'bg-red-500/30 text-[#FF0000]',

  declined: 'bg-red-500/30 text-[#FF0000]',
  inactive: 'bg-red-500/30 text-[#FF0000]',
  blocked: 'bg-red-500/30 text-[#FF0000]',
  cancelled: 'bg-red-500/30 text-[#FF0000]',
  canceled: 'bg-red-500/30 text-[#FF0000]',
  rejected: 'bg-red-500/30 text-[#FF0000]',
  expired: 'bg-red-500/30 text-[#FF0000]',

  dispatched: 'bg-primary/30 text-ink',

  failed: 'bg-orange-500/30 text-orange-500',
  out_for_delivery: 'bg-orange-500/30 text-orange-500',
  picked_up: 'bg-amber-500/30 text-amber-600',
  arrived: 'bg-primary/30 text-ink',
  onHold: 'bg-orange-500/30 text-orange-500',
  deactivated: 'bg-orange-500/30 text-orange-500',
  limit_reached: 'bg-orange-500/30 text-orange-500',
  unmatched: 'bg-gray-500/30 text-gray-500',
  missed: 'bg-gray-200 text-gray-600',
};

export const formatStatusLabel = (value: string) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const Status = ({ status, className, label }: StatusProps) => {
  const rawStatus = String(status ?? '');
  const normalizedStatus = rawStatus.toLowerCase().replace(/ /g, '_');
  const statusClass = statusClassMap[normalizedStatus] ?? '';
  const resolvedLabel = label ?? formatStatusLabel(rawStatus);

  return (
    <div
      className={`
      ${statusClass}
      text-xs px-2 rounded-xl flex items-center gap-1 py-1 pb-1.5 font-medium w-fit capitalize
      ${className ?? ''}
    `}
    >
      <span>{resolvedLabel}</span>
    </div>
  );
};

export default memo(Status);
