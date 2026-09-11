'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import Image from 'next/image';
import { ApiErrorResponse, type DeliveryStore } from '@/types';
import {
  Ban,
  Calendar,
  CircleCheckBig,
  CircleX,
  Edit,
  Eye,
  MapPin,
  MoreVertical,
  ShoppingBag,
  Star,
  Store,
  TrashIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/formatDateTime';
import { handleApiError } from '@/lib/toast-error';
import {
  useApproveStore,
  useDeleteStore,
  useRejectStore,
  useToggleStoreBlock,
} from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import Status from '@/components/shared/Status';
import RejectStoreDialog from './table/RejectStoreDialog';

interface StoreCardProps {
  store: DeliveryStore;
}

type ActionType = 'delete' | 'approve' | 'reject' | 'block' | null;

// Info Item Component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
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

// Store Actions Component
interface StoreActionsProps {
  store: DeliveryStore;
}

function StoreActions({ store }: StoreActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tMenu = useTranslations('lumiFood.stores.actions.menu');
  const tToasts = useTranslations('lumiFood.stores.actions.toasts');
  const tDeleteDialog = useTranslations(
    'lumiFood.stores.actions.dialogs.delete',
  );
  const tApproveDialog = useTranslations(
    'lumiFood.stores.actions.dialogs.approve',
  );
  const tBlockDialog = useTranslations(
    'lumiFood.stores.actions.dialogs.block',
  );
  const tUnblockDialog = useTranslations(
    'lumiFood.stores.actions.dialogs.unblock',
  );
  const [currentAction, setCurrentAction] = useState<ActionType>(null);

  const { mutateAsync: approveStore, isPending: isApproving } =
    useApproveStore();
  const { mutateAsync: rejectStore, isPending: isRejecting } =
    useRejectStore();
  const { mutateAsync: toggleStoreBlock, isPending: isToggling } =
    useToggleStoreBlock();
  const { mutateAsync: deleteStore, isPending: isDeleting } =
    useDeleteStore();

  const isLoading = isApproving || isRejecting || isToggling || isDeleting;

  const handleView = () => {
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/stores/edit-store/${store.id}`,
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

  const handleDelete = async () => {
    try {
      await deleteStore(store.id);
      toast.success(tToasts('deleteSuccess'));
      setCurrentAction(null);
      router.refresh();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleBlock = async () => {
    try {
      const result = await toggleStoreBlock(store.id);
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
      await approveStore(store.id);
      toast.success(tToasts('approveSuccess'));
      setCurrentAction(null);
      router.refresh();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleReject = async (rejectionReason: string) => {
    try {
      await rejectStore({ storeId: store.id, rejectionReason });
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

  // Determine which actions to show based on store status
  const showApprove = store.status === 'pending';
  const showReject = store.status === 'pending';
  const showBlock = store.status === 'approved' && !store.isblocked;
  const showUnblock = store.isblocked === true;

  const getDialogProps = () => {
    switch (currentAction) {
      case 'delete':
        return {
          title: tDeleteDialog('title'),
          subTitle: tDeleteDialog('subTitle', { name: store.storename }),
          description: tDeleteDialog('description'),
          variant: 'delete' as const,
          confirmLabel: tDeleteDialog('confirm'),
        };
      case 'approve':
        return {
          title: tApproveDialog('title'),
          subTitle: tApproveDialog('subTitle', { name: store.storename }),
          description: tApproveDialog('description'),
          variant: 'primary' as const,
          confirmLabel: tApproveDialog('confirm'),
        };
      case 'block':
        return {
          title: store.isblocked
            ? tUnblockDialog('title')
            : tBlockDialog('title'),
          subTitle: store.isblocked
            ? tUnblockDialog('subTitle', { name: store.storename })
            : tBlockDialog('subTitle', { name: store.storename }),
          description: store.isblocked
            ? tUnblockDialog('description')
            : tBlockDialog('description'),
          variant: 'delete' as const,
          confirmLabel: store.isblocked
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
          className="w-45 p-0 rounded-xl overflow-hidden shadow-lg"
        >
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={handleView}
          >
            <Eye className="size-4.5" />
            <span className="text-sm">{tMenu('viewStore')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
            onClick={handleEdit}
          >
            <Edit className="size-4.5" />
            <span className="text-sm">{tMenu('editStore')}</span>
          </DropdownMenuItem>

          {showApprove && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={() => setCurrentAction('approve')}
            >
              <CircleCheckBig className="size-4.5 text-help-green" />
              <span className="text-sm text-help-green">{tMenu('approve')}</span>
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
                {store.isblocked ? tMenu('unblock') : tMenu('block')}
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
        <RejectStoreDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          onConfirm={handleReject}
          loading={isRejecting}
          storeName={store.storename}
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

export default function StoreCard({ store }: StoreCardProps) {
  const tTable = useTranslations('lumiFood.stores.table');

  return (
    <Card className="max-w-5xl mx-auto shadow-lg border">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {store.storeimage ? (
                <div className="relative h-full w-full">
                  <Image
                    src={store.storeimage}
                    alt={store.storename}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {store.storename?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {store.storename}
                </h3>
                <Status
                  status={
                    store.isblocked
                      ? 'blocked'
                      : store.status?.toLocaleLowerCase() || 'unknown'
                  }
                />
              </div>
              <p className="text-sm text-gray-500">{store.vendorname}</p>
            </div>
          </div>
          <StoreActions store={store} />
        </div>

        {/* Metadata Section */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Store ID:</span>
            <span className="text-sm font-medium text-gray-900">
              {store.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Email:</span>
            <span className="text-sm font-medium text-gray-900">
              {store.storeemail || 'N/A'}
            </span>
          </div>
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <InfoItem
            icon={<MapPin className="w-4 h-4" />}
            label="Zone"
            value={store.zonename || 'N/A'}
          />
          <InfoItem
            icon={<Store className="w-4 h-4" />}
            label="Store Type"
            value={store.shoptypename || 'N/A'}
          />
          <InfoItem
            icon={<ShoppingBag className="w-4 h-4" />}
            label="Total Orders"
            value={store.totalorders?.toString() || '0'}
          />
          <InfoItem
            icon={<Star className="w-4 h-4" />}
            label="Rating"
            value={
              store.averagerating
                ? `${store.averagerating} (${store.reviewcount} reviews)`
                : 'No ratings'
            }
          />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InfoItem
            icon={<MapPin className="w-4 h-4" />}
            label="Address"
            value={store.address || 'N/A'}
          />
          <InfoItem
            icon={<ShoppingBag className="w-4 h-4" />}
            label="Delivery Time"
            value={store.deliverytime || 'N/A'}
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
              {store.createdat
                ? formatDateTime(store.createdat, 'N/A')
                : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
