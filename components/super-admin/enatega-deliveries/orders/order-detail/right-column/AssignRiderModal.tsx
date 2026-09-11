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
import { handleApiError } from '@/lib/toast-error';
import { ApiErrorResponse, AvailableRider } from '@/types';
import { Check, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AssignRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

// removed unused `riders` placeholder

export function AssignRiderModal({ isOpen, onClose, orderId }: AssignRiderModalProps) {
  const t = useTranslations('orders.orderDetail.assignRiderModal');
  const tTabs = useTranslations('orders.orderDetail.assignRiderModal.tabs');
  const tAuto = useTranslations('orders.orderDetail.assignRiderModal.auto');
  const tCriteria = useTranslations('orders.orderDetail.assignRiderModal.criteria');
  const tStatus = useTranslations('orders.orderDetail.assignRiderModal.status');
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const { data: availableRiders, isLoading, refetch } = useGetAvailableRiders(orderId);

  // explicitly fetch when user opens Manual Assign tab
  useEffect(() => {
    if (activeTab === 'manual' && orderId) {
      refetch().catch(() => {});
    }
  }, [activeTab, orderId, refetch]);
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
      return <div className="text-mute p-3">{t('loadingRiders')}</div>;
    }
    if (!availableRiders || availableRiders.length === 0) {
      return <div className="text-mute p-3">{t('noRidersAvailable')}</div>;
    }

    return availableRiders.map((rider: AvailableRider) => {
      const id = String(rider?.id ?? '');
      const name = rider?.userProfile?.user?.name ?? rider?.name ?? id;
      const avatar = rider?.userProfile?.user?.profile ?? rider?.avatar ?? rider?.profile ?? '';
      const isAvailable =
        !!rider?.is_available ||
        rider?.status === 'Available' ||
        rider?.status === 'available';
      const statusLabel =
        isAvailable ? tStatus('available') : tStatus('busy');
      const rating = rider?.averageRating ?? rider?.rating ?? rider?.score ?? 0;
      const reviews = rider?.noOfReviews ?? rider?.reviews ?? rider?.totalReviews ?? 0;
      const distanceText = rider?.distance_text ?? rider?.distance ?? '-';

      return (
        <div
          key={id}
          className="flex items-center justify-between p-3 rounded-xl border border-sidebar-border bg-accent/30"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-normal text-black">{name}</span>
                <Badge
                  variant="secondary"
                  className={`text-[12px] h-4 px-2 ${
                    isAvailable
                      ? 'bg-help-blue/10 text-help-blue hover:bg-help-blue/10 border-help-blue/20'
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
            className="h-8 border-help-blue/30 font-normal text-help-blue hover:text-help-blue/80 hover:bg-help-blue/10 px-4 rounded-sm"
            disabled={assigningId === id}
          >
            {assigningId === id ? t('assigning') : t('assignButton')}
          </Button>
        </div>
      );
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0 border-none">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-black">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 bg-accent/50 p-1.5 rounded-lg border mb-6">
            <button
              onClick={() => setActiveTab('auto')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'auto'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-mute hover:text-black'
              }`}
            >
              {tTabs('auto')}
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'manual'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-mute hover:text-black'
              }`}
            >
              {tTabs('manual')}
            </button>
          </div>

          {activeTab === 'auto' ? (
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
