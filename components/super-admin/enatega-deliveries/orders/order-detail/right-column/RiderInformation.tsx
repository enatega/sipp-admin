'use client';

import { Heading } from '@/components/shared/Heading';
import { Button } from '@/components/ui/button';
import { OrderDetail } from '@/types/entities/super-admin/enatega-deliveries/orders';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { canAssignRider } from '../../utils';
import { AssignRiderModal } from './AssignRiderModal';
import { useUnassignRiderFromOrder } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { handleApiError } from '@/lib/toast-error';
import type { ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';
import { hasNamedPermission } from '@/lib/user';

interface RiderInformationProps {
  order: OrderDetail;
}

export function RiderInformation({ order }: RiderInformationProps) {
  const t = useTranslations('orders.orderDetail.riderInformation');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const { mutateAsync: unassignRider, isPending: isUnassigning } = useUnassignRiderFromOrder();
  const canChangeRider = hasNamedPermission('delivery_assign_rider_to_order') &&
    canAssignRider(order.status, order.orderType);

  const handleUnassign = async () => {
    try {
      await unassignRider(order.orderId);
      toast.success('Rider unassigned successfully');
      setShowUnassignDialog(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white mt-6 shadow-sm">
      <Heading title={t('title')} containerClassName="mb-6" />

      {!order.riderAssigned ? (
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-black font-medium mb-6">{t('noRiderAssigned')}</p>
          {canChangeRider && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="w-full border-sidebar-border text-black hover:bg-gray-50 flex items-center justify-center gap-2 h-11 rounded-[8px]"
          >
            {t('assignRider')}
          </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-accent/50 p-4 rounded-lg">
              {order?.rider?.avatar
               ? (
                <Image
                  src={order?.rider?.avatar}
                  alt={order?.rider?.name || 'Rider Avatar'}
                  width={56}
                  height={56}
                  className="rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-black border-2 border-white">
                  {order?.rider?.name?.charAt(0) ?? ''}
                </div>
              )}
            <div className="flex flex-col">
              <span className="text-black font-semibold text-[16px]">
                {order?.rider?.name}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-start text-[16px]">
              <span className="text-black font-semibold">{t('vehicleLabel')}</span>
              <span className="text-mute font-normal">
                {order?.rider?.vehicleType}
              </span>
            </div>
            <div className="flex justify-between items-start text-[16px]">
              <span className="text-black font-semibold">
                {t('phoneNumberLabel')}
              </span>
              <span className="text-mute font-normal">
                {order?.rider?.phone}
              </span>
            </div>
          </div>
          {canChangeRider && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                Reassign Rider
              </Button>
              <Button variant="outline" onClick={() => setShowUnassignDialog(true)}>
                Unassign Rider
              </Button>
            </div>
          )}
        </div>
      )}

      <AssignRiderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderId={order?.orderId}
        currentRiderId={order.rider?.riderId}
      />
      {showUnassignDialog && (
        <AppAlertDialog
          title="Unassign Rider"
          subTitle="Remove this rider from the order?"
          description="You can assign another rider before pickup."
          open
          onOpenChange={(open) => !open && setShowUnassignDialog(false)}
          variant="delete"
          confirmLabel="Unassign Rider"
          loading={isUnassigning}
          onConfirm={() => void handleUnassign()}
        />
      )}
    </div>
  );
}
