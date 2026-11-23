'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { ApiErrorResponse, Vendor } from '@/types';
import {
  Ban,
  CircleCheckBig,
  CircleX,
  LayoutDashboard,
  Eye,
  MoreVertical,
  PenIcon,
  TrashIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useApproveVendor,
  useDeleteVendor,
  useRejectVendor,
  useToggleVendorBlock,
} from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import RejectVendorDialog from './RejectVendorDialog';
import VendorDetailDialog from './VendorDetailDialog';

interface VendorActionsProps {
  vendor: Vendor;
}

type ActionType = 'delete' | 'approve' | 'reject' | 'block' | null;

export default function VendorActions({ vendor }: VendorActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tMenu = useTranslations('lumiFood.vendors.actions.menu');
  const tToasts = useTranslations('lumiFood.vendors.actions.toasts');
  const tDeleteDialog = useTranslations('lumiFood.vendors.actions.dialogs.delete');
  const tApproveDialog = useTranslations(
    'lumiFood.vendors.actions.dialogs.approve',
  );
  const tBlockDialog = useTranslations('lumiFood.vendors.actions.dialogs.block');
  const tUnblockDialog = useTranslations(
    'lumiFood.vendors.actions.dialogs.unblock',
  );
  const goToVendorDashboardLabel = (() => {
    try {
      return tMenu('goToVendorDashboard');
    } catch {
      return 'Go to Vendor Dashboard';
    }
  })();
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);

  const { mutateAsync: approveVendor, isPending: isApproving } =
    useApproveVendor();
  const { mutateAsync: rejectVendor, isPending: isRejecting } =
    useRejectVendor();
  const { mutateAsync: toggleVendorBlock, isPending: isToggling } =
    useToggleVendorBlock();
  const { mutateAsync: deleteVendor, isPending: isDeleting } =
    useDeleteVendor();

  const isLoading = isApproving || isRejecting || isToggling || isDeleting;

  const handleGoToDashboard = () => {
    router.push(`/vendor/deliveries/${vendor.id}`);
  };

  const handleEdit = () => {
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/vendors/edit-vendor/${vendor.id}`,
      ),
    );
  };

  const handleDelete = async () => {
    try {
      await deleteVendor(vendor.id);
      toast.success(tToasts('deleteSuccess'));
      setCurrentAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleBlock = async () => {
    try {
      const result = await toggleVendorBlock(vendor.id);
      toast.success(
        result.isBlocked
          ? tToasts('blockSuccess')
          : tToasts('unblockSuccess'),
      );
      setCurrentAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleApprove = async () => {
    try {
      await approveVendor(vendor.id);
      toast.success(tToasts('approveSuccess'));
      setCurrentAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleReject = async (rejectionReason: string) => {
    try {
      await rejectVendor({ vendorId: vendor.id, rejectionReason });
      toast.success(tToasts('rejectSuccess'));
      setCurrentAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
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
    }
  };

  // Determine which actions to show based on vendor status
  const showApprove = vendor.status === 'pending';
  const showReject = vendor.status === 'pending';
  const showBlock = vendor.status === 'approved' && !vendor.blockstatus;
  const showUnblock = vendor.blockstatus === true;

  const getDialogProps = () => {
    switch (currentAction) {
      case 'delete':
        return {
          title: tDeleteDialog('title'),
          subTitle: tDeleteDialog('subTitle', { name: vendor.name }),
          description: tDeleteDialog('description'),
          variant: 'delete' as const,
          confirmLabel: tDeleteDialog('confirm'),
        };
      case 'approve':
        return {
          title: tApproveDialog('title'),
          subTitle: tApproveDialog('subTitle', { name: vendor.name }),
          description: tApproveDialog('description'),
          variant: 'primary' as const,
          confirmLabel: tApproveDialog('confirm'),
        };
      case 'block':
        return {
          title: vendor.blockstatus
            ? tUnblockDialog('title')
            : tBlockDialog('title'),
          subTitle: vendor.blockstatus
            ? tUnblockDialog('subTitle', { name: vendor.name })
            : tBlockDialog('subTitle', { name: vendor.name }),
          description: vendor.blockstatus
            ? tUnblockDialog('description')
            : tBlockDialog('description'),
          variant: 'delete' as const,
          confirmLabel: vendor.blockstatus
            ? tUnblockDialog('confirm')
            : tBlockDialog('confirm'),
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
          className="w-[240px] p-0 rounded-xl overflow-hidden shadow-lg"
        >
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={() => setIsVendorDetailOpen(true)}
          >
            <Eye className="size-[18px]" />
            <span className="text-sm">{tMenu('viewVendor')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={() => handleGoToDashboard()}
          >
            <LayoutDashboard className="size-[18px]" />
            <span className="text-sm">{goToVendorDashboardLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={() => handleEdit()}
          >
            <PenIcon className="size-[18px]" />
            <span className="text-sm">{tMenu('editVendor')}</span>
          </DropdownMenuItem>

          {showApprove && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('approve')}
            >
              <CircleCheckBig className="size-[18px] text-help-green" />
              <span className="text-sm text-help-green">{tMenu('approve')}</span>
            </DropdownMenuItem>
          )}

          {showReject && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('reject')}
            >
              <CircleX className="size-[18px] text-help-red" />
              <span className="text-sm text-help-red">{tMenu('reject')}</span>
            </DropdownMenuItem>
          )}

          {(showBlock || showUnblock) && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('block')}
            >
              <Ban className="size-[18px] text-help-red" />
              <span className="text-sm text-help-red">
                {vendor.blockstatus ? tMenu('unblock') : tMenu('block')}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
            onClick={() => setCurrentAction('delete')}
          >
            <TrashIcon className="size-[18px] text-help-red" />
            <span className="text-sm text-help-red">{tMenu('delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reject Dialog with reason input */}
      {currentAction === 'reject' && (
        <RejectVendorDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          onReject={handleReject}
          isLoading={isRejecting}
          vendorName={vendor.name}
        />
      )}

      {/* Generic Confirmation Dialog for other actions */}
      {dialogProps && currentAction !== 'reject' && (
        <AppAlertDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          title={dialogProps.title}
          subTitle={dialogProps.subTitle}
          description={dialogProps.description}
          variant={dialogProps.variant}
          confirmLabel={dialogProps.confirmLabel}
          onConfirm={handleConfirmAction}
          loading={isLoading}
        />
      )}

      <VendorDetailDialog
        open={isVendorDetailOpen}
        onOpenChange={setIsVendorDetailOpen}
        vendorId={vendor.id}
      />
    </>
  );
}
