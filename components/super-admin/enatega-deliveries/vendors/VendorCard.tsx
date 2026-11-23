'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { ApiErrorResponse, type Vendor } from '@/types';
import {
  Ban,
  Calendar,
  CircleCheckBig,
  CircleX,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  MoreVertical,
  ShoppingCart,
  Store,
  TrashIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/formatDateTime';
import { handleApiError } from '@/lib/toast-error';
import {
  useApproveVendor,
  useDeleteVendor,
  useRejectVendor,
  useToggleVendorBlock,
} from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import { useCurrency } from '@/hooks/use-currency';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import Status from '@/components/shared/Status';
import RejectVendorDialog from './table/RejectVendorDialog';

interface VendorCardProps {
  vendor: Vendor;
}

type ActionType = 'delete' | 'approve' | 'reject' | 'block' | null;

// Info Item Component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Vendor Actions Component
interface VendorActionsProps {
  vendor: Vendor;
}

function VendorActions({ vendor }: VendorActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tMenu = useTranslations('lumiFood.vendors.actions.menu');
  const tToasts = useTranslations('lumiFood.vendors.actions.toasts');
  const tDeleteDialog = useTranslations(
    'lumiFood.vendors.actions.dialogs.delete',
  );
  const tApproveDialog = useTranslations(
    'lumiFood.vendors.actions.dialogs.approve',
  );
  const tBlockDialog = useTranslations(
    'lumiFood.vendors.actions.dialogs.block',
  );
  const tUnblockDialog = useTranslations(
    'lumiFood.vendors.actions.dialogs.unblock',
  );
  const [currentAction, setCurrentAction] = useState<ActionType>(null);

  const { mutateAsync: approveVendor, isPending: isApproving } =
    useApproveVendor();
  const { mutateAsync: rejectVendor, isPending: isRejecting } =
    useRejectVendor();
  const { mutateAsync: toggleVendorBlock, isPending: isToggling } =
    useToggleVendorBlock();
  const { mutateAsync: deleteVendor, isPending: isDeleting } =
    useDeleteVendor();

  const isLoading = isApproving || isRejecting || isToggling || isDeleting;

  const handleView = () => {
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
      router.refresh();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleBlock = async () => {
    try {
      const result = await toggleVendorBlock(vendor.id);
      toast.success(
        result.isBlocked ? tToasts('blockSuccess') : tToasts('unblockSuccess'),
      );
      setCurrentAction(null);
      router.refresh();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleApprove = async () => {
    try {
      await approveVendor(vendor.id);
      toast.success(tToasts('approveSuccess'));
      setCurrentAction(null);
      router.refresh();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleReject = async (rejectionReason: string) => {
    try {
      await rejectVendor({ vendorId: vendor.id, rejectionReason });
      toast.success(tToasts('rejectSuccess'));
      setCurrentAction(null);
      router.refresh();
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
            onClick={handleView}
          >
            <Eye className="size-4.5" />
            <span className="text-sm">{tMenu('viewVendor')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={handleEdit}
          >
            <Edit className="size-4.5" />
            <span className="text-sm">{tMenu('editVendor')}</span>
          </DropdownMenuItem>

          {showApprove && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('approve')}
            >
              <CircleCheckBig className="size-4.5 text-help-green" />
              <span className="text-sm text-help-green">
                {tMenu('approve')}
              </span>
            </DropdownMenuItem>
          )}

          {showReject && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('reject')}
            >
              <CircleX className="size-4.5 text-help-red" />
              <span className="text-sm text-help-red">{tMenu('reject')}</span>
            </DropdownMenuItem>
          )}

          {(showBlock || showUnblock) && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('block')}
            >
              <Ban className="size-4.5 text-help-red" />
              <span className="text-sm text-help-red">
                {vendor.blockstatus ? tMenu('unblock') : tMenu('block')}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
            onClick={() => setCurrentAction('delete')}
          >
            <TrashIcon className="size-4.5 text-help-red" />
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
    </>
  );
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const tTable = useTranslations('lumiFood.vendors.table');
  const { currencySymbol } = useCurrency();

  return (
    <Card className="max-w-5xl mx-auto shadow-lg border">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">
                {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {vendor.name}
                </h3>
                <Status
                  status={
                    vendor.blockstatus
                      ? 'blocked'
                      : vendor.status?.toLocaleLowerCase() || 'unknown'
                  }
                />
              </div>
              <p className="text-sm text-gray-500">{vendor.email}</p>
            </div>
          </div>
          <VendorActions vendor={vendor} />
        </div>

        {/* Metadata Section */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Vendor ID:</span>
            <span className="text-sm font-medium text-gray-900">
              {vendor.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          {vendor.phone && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Phone:</span>
                <span className="text-sm font-medium text-gray-900">
                  {vendor.phone}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <InfoItem
            icon={<MapPin className="w-4 h-4" />}
            label="Zone"
            value={vendor.zonename || 'N/A'}
          />
          <InfoItem
            icon={<Store className="w-4 h-4" />}
            label={tTable('totalStores')}
            value={vendor.totalStores?.toString() || '0'}
          />
          <InfoItem
            icon={<ShoppingCart className="w-4 h-4" />}
            label={tTable('totalOrders')}
            value={vendor.totalOrders?.toString() || '0'}
          />
          <InfoItem
            icon={<DollarSign className="w-4 h-4" />}
            label={tTable('totalSales')}
            value={
              vendor.totalSales
                ? `${currencySymbol}${vendor.totalSales}`
                : 'N/A'
            }
          />
        </div>

        {/* Registration Date */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {tTable('registrationDate')}:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {vendor.createdat
                ? formatDateTime(vendor.createdat, 'N/A')
                : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
