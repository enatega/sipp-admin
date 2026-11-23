'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAssignRiderToOrder, useAutoAssignRider, useGetAvailableRiders } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import DisplayError from '@/components/shared/DisplayError';
import { ApiErrorResponse, AvailableRider } from '@/types';
import { Bike, Check, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AssignRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  currentRiderId?: string | null;
}

// removed unused `riders` placeholder

const RIDER_SKELETON_COUNT = 3;

// Mirrors the rider card layout so the list doesn't jump when data arrives
function RiderCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-sidebar-border bg-accent/30">
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 bg-gray-200" />
            <Skeleton className="h-4 w-14 rounded-full bg-gray-200" />
          </div>
          <Skeleton className="h-4 w-24 bg-gray-200" />
        </div>
      </div>
      <Skeleton className="h-8 w-16 rounded-sm bg-gray-200" />
    </div>
  );
}

// Auto assign is disabled: orders are broadcast to riders once the restaurant
// accepts them, so the team only assigns manually when needed.
// Set to true to bring the Auto Assign tab back.
const AUTO_ASSIGN_ENABLED = false;

export function AssignRiderModal({ isOpen, onClose, orderId, currentRiderId }: AssignRiderModalProps) {
  const t = useTranslations('orders.orderDetail.assignRiderModal');
  const tTabs = useTranslations('orders.orderDetail.assignRiderModal.tabs');
  const tAuto = useTranslations('orders.orderDetail.assignRiderModal.auto');
  const tCriteria = useTranslations('orders.orderDetail.assignRiderModal.criteria');
  const tStatus = useTranslations('orders.orderDetail.assignRiderModal.status');
  const tEmpty = useTranslations('orders.orderDetail.assignRiderModal.emptyRiders');
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>(
    AUTO_ASSIGN_ENABLED ? 'auto' : 'manual',
  );
  const [availability, setAvailability] = useState<'all' | 'available' | 'busy'>('all');

  // The modal can stay mounted between opens, so start on the All tab every time.
  useEffect(() => {
    if (isOpen) setAvailability('all');
  }, [isOpen]);
  const {
    data: availableRiders,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAvailableRiders(orderId, availability, {
    enabled: isOpen && !!orderId,
    // A 403 or 404 will not change on retry; show it straight away.
    retry: false,
  });

  const assignMutation = useAssignRiderToOrder();
  const autoAssignMutation = useAutoAssignRider();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assigningAuto, setAssigningAuto] = useState(false);
  const criteriaItems = [
    tCriteria('nearestDistance'),
    tCriteria('currentlyAvailable'),
    tCriteria('highRatingPriority'),
    tCriteria('correctVehicleType'),
  ];
  
  // prepare manual assign content to avoid complex nested JSX ternaries
  const renderManualRiders = () => {
    if (isLoading) {
      return (
        <div role="status" aria-busy="true" className="space-y-3">
          <span className="sr-only">{t('loadingRiders')}</span>
          {Array.from({ length: RIDER_SKELETON_COUNT }, (_, index) => (
            <RiderCardSkeleton key={index} />
          ))}
        </div>
      );
    }
    // A failed request is not an empty list; say why it failed.
    if (isError) {
      return (
        <DisplayError
          title={t('ridersLoadError')}
          message={returnErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      );
    }
    if (!availableRiders || availableRiders.length === 0) {
      return (
        <div
          role="status"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border bg-accent/30 px-6 py-10 text-center"
        >
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-ink">
            <Bike className="size-6" />
          </div>
          <h4 className="text-base font-semibold text-black">
            {tEmpty(`${availability}.title`)}
          </h4>
          <p className="mt-1 max-w-[320px] text-sm text-mute">
            {tEmpty(`${availability}.subtitle`)}
          </p>
        </div>
      );
    }

    return availableRiders.map((rider: AvailableRider) => {
      const id = String(rider?.id ?? '');
      const name = rider?.userProfile?.user?.name ?? rider?.name ?? id;
      const avatar = rider?.userProfile?.user?.profile ?? rider?.avatar ?? rider?.profile ?? '';
      const isAvailable = rider?.status?.toLowerCase() === 'available' || rider?.is_available === true;
      const isCurrentRider = currentRiderId === id;
      const isOffline = rider?.status?.toLowerCase() === 'offline';
      const activeOrdersCount = Number(rider?.activeOrdersCount ?? 0);
      const statusLabel = isOffline
        ? tStatus('offline')
        : isAvailable
          ? tStatus('available')
          : activeOrdersCount > 0
            ? tStatus('busyWithOrders', { count: activeOrdersCount })
            : tStatus('busy');
      const rating = rider?.averageRating ?? rider?.rating ?? rider?.score ?? 0;
      const reviews = rider?.noOfReviews ?? rider?.reviews ?? rider?.totalReviews ?? 0;
      const distanceText = rider?.distance_text ?? rider?.distance ?? '-';

      return (
        <div
          key={id}
          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-sidebar-border bg-accent/30"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative shrink-0">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={String(name)}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-black">
                  {String(name)?.charAt(0) ?? ''}
                </div>
              )}
              <span className="absolute -bottom-1 -left-1 bg-white px-1 rounded text-[10px] font-bold shadow-sm border">
                {distanceText}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[16px] font-normal text-black" title={String(name)}>
                  {name}
                </span>
                <Badge
                  variant="secondary"
                  className={`shrink-0 whitespace-nowrap text-[12px] h-5 px-2 ${
                    isOffline
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-100 border-gray-200'
                      : isAvailable
                      ? 'bg-primary-soft text-ink hover:bg-primary-soft border-primary-pressed/40'
                      : 'bg-help-orange/10 text-help-orange hover:bg-help-orange/10 border-help-orange/20'
                  }`}
                >
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Star size={20} className="text-help-orange fill-help-orange" />
                <span className="text-black font-normal text-[16px]">{rating}</span>
                <span className="text-mute text-[16px]">
                  ({reviews}{' '}
                  {Number(reviews) === 1
                    ? t('reviewSingular')
                    : t('reviewPlural')}
                  )
                </span>
              </div>
            </div>
          </div>
            <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!orderId) return;
              setAssigningId(id);
              try {
                await assignMutation.mutateAsync({ orderId, riderId: id });
                toast.success(t('successAssigned'));
                onClose();
              } catch (error) {
                handleApiError(error as ApiErrorResponse);
              } finally {
                setAssigningId(null);
              }
            }}
            className="h-8 shrink-0 border-ink/30 font-normal text-ink hover:text-ink/80 hover:bg-primary-soft px-4 rounded-sm"
            disabled={assigningId !== null || isCurrentRider}
          >
            {isCurrentRider ? 'Assigned' : assigningId === id ? t('assigning') : currentRiderId ? 'Reassign' : t('assignButton')}
          </Button>
        </div>
      );
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] grid-cols-[minmax(0,1fr)] p-0 overflow-hidden gap-0 border-none">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-black">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 px-6 pb-6">
          <div className="flex items-center gap-2 bg-accent/50 p-1.5 rounded-lg border mb-6">
            {AUTO_ASSIGN_ENABLED && !currentRiderId && <button
              onClick={() => setActiveTab('auto')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'auto'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-mute hover:text-black'
              }`}
            >
              {tTabs('auto')}
            </button>}
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                currentRiderId || activeTab === 'manual'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-mute hover:text-black'
              }`}
            >
              {tTabs('manual')}
            </button>
          </div>

          {AUTO_ASSIGN_ENABLED && !currentRiderId && activeTab === 'auto' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-black text-[16px]">
                  {tAuto('title')}
                </h4>
                <p className="text-mute text-[16px] leading-relaxed">
                  {tAuto('description')}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-black text-[16px]">
                  {tAuto('criteriaTitle')}
                </h4>
                <ul className="space-y-2">
                  {criteriaItems.map((criteria) => (
                    <li
                      key={criteria}
                      className="flex items-center gap-2 text-mute text-[14px]"
                    >
                      <div className="size-4 rounded-full bg-accent/50 flex items-center justify-center">
                        <Check size={10} className="text-black" />
                      </div>
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full bg-white hover:bg-gray-50 text-black border border-sidebar-border h-11 mt-4"
                disabled={assigningAuto || !orderId}
                onClick={async () => {
                  if (!orderId) return;
                  setAssigningAuto(true);
                  try {
                    await autoAssignMutation.mutateAsync(orderId);
                    toast.success(t('successAutoAssigned'));
                    onClose();
                  } catch (error) {
                    handleApiError(error as ApiErrorResponse);
                  } finally {
                    setAssigningAuto(false);
                  }
                }}
              >
                {assigningAuto ? t('assigning') : tAuto('button')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2" aria-label="Filter riders by availability">
                {(['all', 'available', 'busy'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAvailability(value)}
                    className={`rounded-md px-3 py-1.5 text-sm capitalize ${availability === value ? 'bg-primary text-primary-foreground' : 'border text-black'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {renderManualRiders()}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
