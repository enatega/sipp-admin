'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ApiErrorResponse, DeliveryStore } from '@/types';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDateTime } from '@/lib/formatDateTime';
import { handleApiError } from '@/lib/toast-error';
import { hasNamedPermission } from '@/lib/user';
import {
  useActivateStoreAccount,
  useToggleStoreAvailability,
} from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { useCurrency } from '@/hooks/use-currency';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import Status from '@/components/shared/Status';
import TooltipText from '@/components/shared/TooltipText';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import StoreActions from './StoreActions';
import StoreLinkButtons from './StoreLinkButtons';

interface StoreRowProps {
  store: DeliveryStore;
}

export default function StoreRow({ store }: StoreRowProps) {
  const { currencySymbol } = useCurrency();
  const t = useTranslations('lumiFood.stores');
  const tAvailability = useTranslations('lumiFood.stores.availabilityToasts');

  // Optimistic UI state for availability
  const [isAvailable, setIsAvailable] = useState(store?.isavailable);
  const [isAccountActive, setIsAccountActive] = useState(store.isactive);
  const [availabilityInfo, setAvailabilityInfo] = useState(store);
  useEffect(() => setAvailabilityInfo(store), [store]);
  const [confirmation, setConfirmation] = useState<'activate' | 'enable' | null>(
    null,
  );
  const canActivateAccount = hasNamedPermission('toggle_store_availability');

  useEffect(() => {
    setIsAvailable(store.isavailable);
  }, [store.isavailable]);

  useEffect(() => {
    setIsAccountActive(store.isactive);
  }, [store.isactive]);

  const { mutate: toggleAvailability, isPending } = useToggleStoreAvailability({
    
    onError: (error) => {
      setIsAvailable(store.isavailable);
      handleApiError(error as ApiErrorResponse);
    },
    onSuccess: (updatedStore) => {
      setIsAvailable(updatedStore.store_available);
      setAvailabilityInfo((old) => ({ ...old, ...updatedStore }));
      if (updatedStore.store_available) setIsAccountActive(true);
      toast.success(
        updatedStore.store_available
          ? tAvailability(
              isAccountActive ? 'markedAvailable' : 'markedAvailableAndActivated',
            )
          : tAvailability('markedUnavailable'),
      );
    },
  });

  const { mutate: activateAccount, isPending: isActivatingAccount } =
    useActivateStoreAccount();

  const handleActivateAccount = () => {
    activateAccount(store.id, {
      onSuccess: () => {
        setIsAccountActive(true);
        setConfirmation(null);
        toast.success(t('storeAccountActivated'));
      },
      onError: (error) => handleApiError(error as ApiErrorResponse),
    });
  };

  const handleToggleAvailability = (checked: boolean) => {
    if (checked && !isAccountActive) {
      setConfirmation('enable');
      return;
    }
    toggleAvailability({ storeId: store.id, available: checked });
  };

  const displayStatus = store.isblocked ? 'blocked' : store.status;
  const cannotEnableInactiveAccount =
    !isAvailable &&
    !isAccountActive &&
    (store.isblocked || store.status !== 'approved');

  return (
    <>
      <TableRow className="h-[55px]!">
      <TableCell className="min-w-[200px] truncate">
        <div className="flex items-center gap-2">
          {store?.storeimage ? (
            <Image
              src={store.storeimage}
              alt={store.storename}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs">
              {store?.storename?.charAt(0)}
            </div>
          )}
          {store?.storename ? (
            <div className="flex min-w-0 flex-col">
              <TooltipText content={store.storename}>
                <span className="truncate">{store.storename}</span>
              </TooltipText>
              {store.storephone ? (
                <span className="truncate text-xs text-mute">{store.storephone}</span>
              ) : null}
            </div>
          ) : (
            <span>{t('notAvailable')}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium text-ink">
        {formatCurrency(store?.totalSales, currencySymbol)}
      </TableCell>

      <TableCell>{store?.shoptypename ?? t('notAvailable')}</TableCell>
      <TableCell className="max-w-[200px] truncate">
        {store?.address ? (
          <TooltipText content={store.address}>
            <span>{store.address}</span>
          </TooltipText>
        ) : (
          t('notAvailable')
        )}
      </TableCell>
      <TableCell>{store?.zonename ?? t('notAvailable')}</TableCell>
      <TableCell>
        {store?.createdat
          ? formatDateTime(store.createdat, t('notAvailable'))
          : t('notAvailable')}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex min-w-[150px] flex-col items-start gap-1.5 py-1">
          <Switch
            checked={isAvailable}
            onCheckedChange={handleToggleAvailability}
            disabled={isPending || isActivatingAccount || cannotEnableInactiveAccount}
            aria-label={`${store.storename}: ${t('table.availability')}`}
            title={cannotEnableInactiveAccount ? t('activateAccountDialog.requireApproval') : undefined}
          />
          {!isAvailable && (availabilityInfo.availabilityBlockedByAdmin || ['admin', 'store', 'vendor'].includes(availabilityInfo.availabilityChangedBy ?? '')) && (
            <span className="max-w-[160px] whitespace-normal break-words text-xs text-muted-foreground">
              {t(availabilityInfo.availabilityBlockedByAdmin || availabilityInfo.availabilityChangedBy === 'admin' ? 'availabilityAdminLocked'
                : availabilityInfo.availabilityChangedBy === 'store' ? 'availabilityStoreClosed'
                : 'availabilityVendorClosed')}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Status status={displayStatus ?? 'pending'} />
      </TableCell>
      <TableCell>{store?.activeorders ?? 0}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span>{parseFloat(store?.averagerating || '0').toFixed(1)}</span>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
        <StoreLinkButtons storeId={store.id} storeName={store.storename ?? ''} />
        <StoreActions
          store={store}
          availabilityBusy={isPending || isActivatingAccount}
          onRestrictAvailability={canActivateAccount && !isAvailable && !availabilityInfo.availabilityBlockedByAdmin
            ? () => toggleAvailability({ storeId: store.id, available: false }) : undefined}
          onActivateAccount={canActivateAccount && !isAccountActive && !store.isblocked && store.status === 'approved'
            ? () => setConfirmation('activate') : undefined}
        />
        </div>
      </TableCell>
      </TableRow>
      <AppAlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={t(
          confirmation === 'enable'
            ? 'enableAndActivateDialog.title'
            : 'activateAccountDialog.title',
        )}
        subTitle={t(
          confirmation === 'enable'
            ? 'enableAndActivateDialog.subTitle'
            : 'activateAccountDialog.subTitle',
          { name: store.storename },
        )}
        description={t(
          confirmation === 'enable'
            ? 'enableAndActivateDialog.description'
            : 'activateAccountDialog.description',
        )}
        variant="primary"
        size="md"
        confirmLabel={t(
          confirmation === 'enable'
            ? 'enableAndActivateDialog.confirm'
            : 'activateAccountDialog.confirm',
        )}
        onConfirm={() => {
          if (confirmation === 'enable') {
            setConfirmation(null);
            toggleAvailability({ storeId: store.id, available: true });
          } else if (confirmation === 'activate') {
            handleActivateAccount();
          }
        }}
        loading={isPending || isActivatingAccount}
      />
    </>
  );
}
