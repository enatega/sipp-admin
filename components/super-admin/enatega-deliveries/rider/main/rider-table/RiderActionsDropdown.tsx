'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { Ban, Check, Edit, Eye, MoreVertical, Trash, Wallet, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { DeliveryRider } from '@/types/entities/super-admin/enatega-deliveries/rider';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { handleApiError } from '@/lib/toast-error';
import {
  useApproveDeliveryRider,
  useBlockDeliveryRider,
  useDeleteDeliveryRider,
  useUnblockDeliveryRider,
} from '@/hooks/api/super-admin/enatega-deliveries/riders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { RejectRiderDialog } from './RejectRiderDialog';

type ActionDialogType =
  | 'delete'
  | 'approve'
  | 'reject'
  | 'block'
  | 'unblock'
  | null;

interface RiderActionsDropdownProps {
  rider: DeliveryRider;
  onViewProfile: (rider: DeliveryRider) => void;
}

export function RiderActionsDropdown({
  rider,
  onViewProfile,
}: RiderActionsDropdownProps) {
  const t = useTranslations('driverManagement.driversTable');
  const tWallet = useTranslations('wallet.actions');
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: deleteRider, isPending: isDeleting } =
    useDeleteDeliveryRider();
  const { mutateAsync: approveRider, isPending: isApproving } =
    useApproveDeliveryRider();
  const { mutateAsync: blockRider, isPending: isBlocking } =
    useBlockDeliveryRider();
  const { mutateAsync: unblockRider, isPending: isUnblocking } =
    useUnblockDeliveryRider();

  const [actionDialog, setActionDialog] = useState<{
    type: ActionDialogType;
    rider: DeliveryRider | null;
  }>({ type: null, rider: null });

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(rider);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/riders/edit-rider/${rider.id}`,
      ),
    );
  };

  const handleWallet = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/riders/${rider.id}/wallet`,
      ),
    );
  };

  const handleAction = (e: React.MouseEvent, type: ActionDialogType) => {
    e.stopPropagation();
    setActionDialog({ type, rider });
  };

  const closeDialog = () => {
    setActionDialog({ type: null, rider: null });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="border px-2 py-1.5 rounded-md shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[200px] p-0 rounded-xl overflow-hidden shadow-lg"
        >
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={handleViewProfile}
          >
            <Eye className="size-[18px]" />
            <span className="text-sm">{t('viewProfile')}</span>
          </DropdownMenuItem>

          {rider.status !== 'pending' && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={handleEdit}
            >
              <Edit className="size-[18px]" />
              <span className="text-sm">{t('editDriver')}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={handleWallet}
          >
            <Wallet className="size-[18px]" />
            <span className="text-sm">{tWallet('walletTransaction')}</span>
          </DropdownMenuItem>

          {rider.userProfile?.user?.block_status === false && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={(e) => handleAction(e, 'block')}
            >
              <Ban className="size-[18px] text-destructive" />
              <span className="text-sm text-destructive">{t('blockAction')}</span>
            </DropdownMenuItem>
          )}

          {rider.userProfile?.user?.block_status === true && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={(e) => handleAction(e, 'unblock')}
            >
              <Check className="text-help-green size-[18px]" />
              <span className="text-sm text-help-green">{t('unblockAction')}</span>
            </DropdownMenuItem>
          )}

          {rider.status === 'pending' && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                onClick={(e) => handleAction(e, 'approve')}
              >
                <Check className="text-help-green size-[18px]" />
                <span className="text-sm text-help-green">{t('approveAction')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                onClick={(e) => handleAction(e, 'reject')}
              >
                <X className="text-destructive size-[18px]" />
                <span className="text-sm text-destructive">{t('rejectAction')}</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            variant="destructive"
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={(e) => handleAction(e, 'delete')}
          >
            <Trash className="size-[18px] text-destructive" />
            <span className="text-sm text-destructive">{t('deleteAction')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Rider Dialog */}
      <AppAlertDialog
        title={t('deleteRiderDialogTitle')}
        subTitle={t('deleteRiderDialogSubtitle')}
        description={t('deleteRiderDialogDescription', {
          riderName:
            actionDialog.rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        variant="delete"
        confirmLabel={t('deleteRiderConfirmButton')}
        onConfirm={async () => {
          if (actionDialog.rider) {
            try {
              await deleteRider(actionDialog.rider.id);
              toast.success(t('riderDeletedSuccess'));
              closeDialog();
            } catch (error) {
              handleApiError(error as ApiErrorResponse);
            }
          }
        }}
        loading={isDeleting}
      />

      {/* Approve Rider Dialog */}
      <AppAlertDialog
        title={t('approveRiderDialogTitle')}
        subTitle={t('approveRiderDialogSubtitle')}
        description={t('approveRiderDialogDescription', {
          riderName:
            actionDialog.rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog.type === 'approve'}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        variant="primary"
        confirmLabel={t('approveRiderConfirmButton')}
        onConfirm={async () => {
          if (actionDialog.rider) {
            try {
              await approveRider({ riderId: actionDialog.rider.id });
              toast.success(t('riderApprovedSuccess'));
              closeDialog();
            } catch (error) {
              handleApiError(error as ApiErrorResponse);
            }
          }
        }}
        loading={isApproving}
      />

      {/* Reject Rider Dialog with Reason Input */}
      <RejectRiderDialog
        open={actionDialog.type === 'reject'}
        rider={actionDialog.rider}
        onClose={closeDialog}
      />

      {/* Block Rider Dialog */}
      <AppAlertDialog
        title={t('blockRiderDialogTitle')}
        subTitle={t('blockRiderDialogSubtitle')}
        description={t('blockRiderDialogDescription', {
          riderName:
            actionDialog.rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog.type === 'block'}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        variant="delete"
        confirmLabel={t('blockRiderConfirmButton')}
        onConfirm={async () => {
          if (actionDialog.rider) {
            try {
              await blockRider({ riderId: actionDialog.rider.id });
              toast.success(t('riderBlockedSuccess'));
              closeDialog();
            } catch (error) {
              handleApiError(error as ApiErrorResponse);
            }
          }
        }}
        loading={isBlocking}
      />

      {/* Unblock Rider Dialog */}
      <AppAlertDialog
        title={t('unblockRiderDialogTitle')}
        subTitle={t('unblockRiderDialogSubtitle')}
        description={t('unblockRiderDialogDescription', {
          riderName:
            actionDialog.rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog.type === 'unblock'}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        variant="primary"
        confirmLabel={t('unblockRiderConfirmButton')}
        onConfirm={async () => {
          if (actionDialog.rider) {
            try {
              await unblockRider({ riderId: actionDialog.rider.id });
              toast.success(t('riderUnblockedSuccess'));
              closeDialog();
            } catch (error) {
              handleApiError(error as ApiErrorResponse);
            }
          }
        }}
        loading={isUnblocking}
      />
    </>
  );
}
