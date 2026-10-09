'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ApiErrorResponse, DeliveryStore } from '@/types';
import { CircleAlert, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
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
    onMutate: async () => {
      // Optimistically update UI immediately
      setIsAvailable((prev) => !prev);
    },
    onError: (error) => {
      setIsAvailable(store.isavailable);
      handleApiError(error as ApiErrorResponse);
    },
    onSuccess: (updatedStore) => {
      setIsAvailable(updatedStore.store_available);
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
    toggleAvailability(store.id);
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
      <TableCell className="font-medium text-primary">
        {currencySymbol}
        {store?.totalSales?.toLocaleString() ?? '0'}
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
          {!isAccountActive && (
            <div className="flex flex-col items-start gap-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                {t('storeAccountInactive')}
              </span>
              {canActivateAccount && !store.isblocked && store.status === 'approved' && (
                <button
                  type="button"
                  className="rounded-sm text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                  onClick={() => setConfirmation('activate')}
                  disabled={isPending || isActivatingAccount}
                >
                  {t('activateAccountDialog.confirm')}
                </button>
              )}
            </div>
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
        <StoreActions store={store} />
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
            toggleAvailability(store.id);
          } else if (confirmation === 'activate') {
            handleActivateAccount();
          }
        }}
        loading={isPending || isActivatingAccount}
      />
    </>
  );
}
