'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { ApiErrorResponse, DeliveryStore } from '@/types';
import {
  Ban,
  CircleCheckBig,
  CircleX,
  Eye,
  MoreVertical,
  PenIcon,
  TrashIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { withBackToPath } from '@/lib/store';
import { handleApiError } from '@/lib/toast-error';
import {
  useApproveStore,
  useDeleteStore,
  useRejectStore,
  useToggleStoreBlock,
} from '@/hooks/api/super-admin/enatega-deliveries/stores';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import RejectStoreDialog from './RejectStoreDialog';

interface StoreActionsProps {
  store: DeliveryStore;
}

type ActionType = 'delete' | 'approve' | 'reject' | 'block' | null;

export default function StoreActions({ store }: StoreActionsProps) {
  const t = useTranslations('lumiFood.stores');
  const router = useRouter();
  const pathname = usePathname();
  const [currentAction, setCurrentAction] = useState<ActionType>(null);

  // Mutation hooks
  const { mutate: toggleBlock, isPending: isBlockPending } =
    useToggleStoreBlock();
  const { mutate: approveStore, isPending: isApprovePending } =
    useApproveStore();
  const { mutate: rejectStore, isPending: isRejectPending } = useRejectStore();
  const { mutate: deleteStore, isPending: isDeletePending } = useDeleteStore();

  const isLoading =
    isBlockPending || isApprovePending || isRejectPending || isDeletePending;

  const handleView = () => {
    router.push(
      withBackToPath(
        `/store/deliveries/${store.id}`,
        buildScopedDeliveriesAdminPathFromCurrent(
          pathname,
          '/enatega-deliveries/stores',
        ),
      ),
    );
  };

  const handleEdit = () => {
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/stores/edit-store/${store.id}`,
      ),
    );
  };

  const handleDelete = () => {
    deleteStore(store.id, {
      onSuccess: () => {
        toast.success(t('deleteSuccess'));
        setCurrentAction(null);
      },
      onError: (error) => {
        handleApiError(error as ApiErrorResponse);
      },
    });
  };

  const handleBlock = () => {
    toggleBlock(store.id, {
      onSuccess: (data) => {
        toast.success(data.isBlocked ? t('blockSuccess') : t('unblockSuccess'));
        setCurrentAction(null);
      },
      onError: (error) => {
        handleApiError(error as ApiErrorResponse);
      },
    });
  };

  const handleApprove = () => {
    approveStore(store.id, {
      onSuccess: () => {
        toast.success(t('approveSuccess'));
        setCurrentAction(null);
      },
      onError: (error) => {
        handleApiError(error as ApiErrorResponse);
      },
    });
  };

  const handleReject = (rejectionReason: string) => {
    rejectStore(
      { storeId: store.id, rejectionReason },
      {
        onSuccess: () => {
          toast.success(t('rejectSuccess'));
          setCurrentAction(null);
        },
        onError: (error) => {
          handleApiError(error as ApiErrorResponse);
        },
      },
    );
  };

  const handleConfirmAction = () => {
    switch (currentAction) {
      case 'delete':
        handleDelete();
        break;
      case 'approve':
        handleApprove();
        break;
      case 'block':
        handleBlock();
        break;
      // Reject is handled separately by RejectStoreDialog
    }
  };

  // Determine which actions to show based on store status
  const showApprove = store.status === 'pending' && !store.isblocked;
  const showReject = store.status === 'pending' && !store.isblocked;
  const showBlock = store.status === 'approved' && !store.isblocked;
  const showUnblock = store.isblocked;

  const getDialogProps = () => {
    switch (currentAction) {
      case 'delete':
        return {
          title: t('deleteDialog.title'),
          subTitle: t('deleteDialog.subTitle'),
          description: t('deleteDialog.description'),
          variant: 'delete' as const,
          confirmLabel: t('deleteDialog.confirm'),
        };
      case 'approve':
        return {
          title: t('approveDialog.title'),
          subTitle: t('approveDialog.subTitle'),
          description: t('approveDialog.description'),
          variant: 'primary' as const,
          confirmLabel: t('approveDialog.confirm'),
        };
      case 'reject':
        return {
          title: t('rejectDialog.title'),
          subTitle: t('rejectDialog.subTitle'),
          description: t('rejectDialog.description'),
          variant: 'delete' as const,
          confirmLabel: t('rejectDialog.confirm'),
        };
      case 'block':
        return {
          title: t(
            store.isblocked ? 'unblockDialog.title' : 'blockDialog.title',
          ),
          subTitle: t(
            store.isblocked ? 'unblockDialog.subTitle' : 'blockDialog.subTitle',
          ),
          description: t(
            store.isblocked
              ? 'unblockDialog.description'
              : 'blockDialog.description',
          ),
          variant: 'delete' as const,
          confirmLabel: t(
            store.isblocked ? 'unblockDialog.confirm' : 'blockDialog.confirm',
          ),
        };
      default:
        return null;
    }
  };

  const dialogProps = getDialogProps();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
          <MoreVertical size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[180px] p-0 rounded-xl overflow-hidden shadow-lg"
        >
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={() => handleView()}
          >
            <Eye className="size-[18px]" />
            <span className="text-sm">{t('viewStore')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={() => handleEdit()}
          >
            <PenIcon className="size-[18px]" />
            <span className="text-sm">{t('editStoreLabel')}</span>
          </DropdownMenuItem>

          {showApprove && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('approve')}
            >
              <CircleCheckBig className="size-[18px] text-help-green" />
              <span className="text-sm text-help-green">
                {t('approveStore')}
              </span>
            </DropdownMenuItem>
          )}

          {showReject && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('reject')}
            >
              <CircleX className="size-[18px] text-help-red" />
              <span className="text-sm text-help-red">{t('rejectStore')}</span>
            </DropdownMenuItem>
          )}

          {(showBlock || showUnblock) && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('block')}
            >
              <Ban className="size-[18px] text-help-red" />
              <span className="text-sm text-help-red">
                {store.isblocked ? t('unblockStore') : t('blockStore')}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
            onClick={() => setCurrentAction('delete')}
          >
            <TrashIcon className="size-[18px] text-help-red" />
            <span className="text-sm text-help-red">{t('deleteStore')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Standard Alert Dialogs for Delete, Approve, Block */}
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
          loading={isLoading}
        />
      )}

      {/* Custom Reject Dialog with Reason Input */}
      <RejectStoreDialog
        open={currentAction === 'reject'}
        onOpenChange={(open) => !open && setCurrentAction(null)}
        onConfirm={handleReject}
        loading={isRejectPending}
      />
    </>
  );
}
