'use client';

import { useState } from 'react';
import { Ban, CheckCircle, ChevronDown, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { handleApiError } from '@/lib/toast-error';
import {
  useUpdateStoreApprovalStatus,
  useUpdateStoreBlockStatus,
} from '@/hooks/api/store/deliveries/profile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { useStoreProfileViewModel } from './profileData';

export default function StatusBadge() {
  // UI helpers
  const tBadge = useTranslations('storeProfile.statusBadge');
  const tApproveDialog = useTranslations('storeProfile.statusBadge.approveDialog');
  const tRejectDialog = useTranslations('storeProfile.statusBadge.rejectDialog');
  const tBlockDialog = useTranslations('storeProfile.statusBadge.blockDialog');
  const tUnblockDialog = useTranslations('storeProfile.statusBadge.unblockDialog');

  // API HOOKs
  const { profile, storeId } = useStoreProfileViewModel();
  const { mutateAsync: toggleBlock, isPending } = useUpdateStoreBlockStatus();
  const { mutateAsync: updateStatus, isPending: approvalStatusPending } =
    useUpdateStoreApprovalStatus();

  type ActionType = 'approve' | 'reject' | 'block' | null;
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const getDialogProps = () => {
    switch (currentAction) {
      case 'approve':
        return {
          title: tApproveDialog('title'),
          subTitle: tApproveDialog('subTitle'),
          description: tApproveDialog('description'),
          variant: 'primary' as const,
          confirmLabel: tApproveDialog('confirm'),
        };
      case 'reject':
        return {
          title: tRejectDialog('title'),
          subTitle: tRejectDialog('subTitle'),
          description: tRejectDialog('description'),
          variant: 'delete' as const,
          confirmLabel: tRejectDialog('confirm'),
        };
      case 'block':
        return {
          title: profile?.blockStatus
            ? tUnblockDialog('title')
            : tBlockDialog('title'),
          subTitle: profile?.blockStatus
            ? tUnblockDialog('subTitle')
            : tBlockDialog('subTitle'),
          description: profile?.blockStatus
            ? tUnblockDialog('description')
            : tBlockDialog('description'),
          variant: 'delete' as const,
          confirmLabel: profile?.blockStatus
            ? tUnblockDialog('confirm')
            : tBlockDialog('confirm'),
        };
      default:
        return null;
    }
  };

  const getStatusConfig = () => {
    const approvalStatus = profile?.approvalStatus?.toLowerCase() || '';
    if (profile?.blockStatus) {
      return { color: 'bg-help-red', text: tBadge('blocked') };
    }
    if (approvalStatus === 'approved') {
      return { color: 'bg-help-green', text: tBadge('approved') };
    } else if (approvalStatus === 'pending') {
      return { color: 'bg-help-blue', text: tBadge('pending') };
    } else {
      return { color: 'bg-help-red', text: tBadge('rejected') };
    }
  };
  const handleBlock = async () => {
    try {
      const response = await toggleBlock({ storeId });
      toast.success(response.message);
      setCurrentAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await updateStatus({
        storeId,
        status: currentAction === 'approve' ? 'approved' : 'rejected',
      });
      toast.success(response.message);
      setCurrentAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleConfirmAction = () => {
    switch (currentAction) {
      case 'approve':
        handleApprove();
        break;
      case 'reject':
        handleApprove();
        break;
      case 'block':
        handleBlock();
        break;
      // Reject is handled separately by RejectStoreDialog
    }
  };

  const dialogProps = getDialogProps();

  const statusConfig = getStatusConfig();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`inline-flex items-center  gap-1.5 px-3 py-1 rounded-full text-white text-sm font-medium ${statusConfig.color} hover:opacity-90 transition-opacity`}
          >
            <CheckCircle className="w-4 h-4" />
            {statusConfig.text}
            <ChevronDown className="w-3 h-3" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[200px] p-0 rounded-xl overflow-hidden shadow-lg"
        >
          {profile?.approvalStatus?.toLowerCase() === 'pending' ? (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-green-50"
                onClick={() => setCurrentAction('approve')}
              >
                <CheckCircle className="size-[18px] text-green-600" />
                <span className="text-sm text-green-600">{tBadge('approve')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-green-50"
                onClick={() => setCurrentAction('reject')}
              >
                <XCircle className="size-[18px] text-help-red" />
                <span className="text-sm text-help-red">{tBadge('reject')}</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-yellow-50"
              onClick={() => setCurrentAction('block')}
            >
              <Ban className="size-[18px] text-help-red" />
              <span className="text-sm text-help-red">
                {profile?.blockStatus ? tBadge('unblockStore') : tBadge('blockStore')}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {currentAction && currentAction !== 'reject' && dialogProps && (
        <AppAlertDialog
          className="w-[850px]!"
          title={dialogProps.title}
          subTitle={dialogProps.subTitle}
          description={dialogProps.description}
          open={!!currentAction}
          onOpenChange={() => setCurrentAction(null)}
          variant={dialogProps.variant}
          confirmLabel={dialogProps.confirmLabel}
          onConfirm={handleConfirmAction}
          loading={isPending || approvalStatusPending}
        />
      )}
    </div>
  );
}
