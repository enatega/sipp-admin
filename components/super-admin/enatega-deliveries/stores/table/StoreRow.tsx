'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ApiErrorResponse, DeliveryStore } from '@/types';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/formatDateTime';
import { handleApiError } from '@/lib/toast-error';
import { useToggleStoreAvailability } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { useCurrency } from '@/hooks/use-currency';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import Status from '@/components/shared/Status';
import TooltipText from '@/components/shared/TooltipText';
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

  const { mutate: toggleAvailability, isPending } = useToggleStoreAvailability({
    onMutate: async () => {
      // Optimistically update UI immediately
      setIsAvailable((prev) => !prev);
    },
    onError: (error) => {
      // Revert on error
      setIsAvailable((prev) => !prev);
      handleApiError(error as ApiErrorResponse);
    },
    onSuccess: () => {
      toast.success(
        isAvailable
          ? tAvailability('markedAvailable')
          : tAvailability('markedUnavailable'),
      );
    },
  });

  const handleToggleAvailability = () => {
    toggleAvailability(store.id);
  };

  const displayStatus = store.isblocked ? 'blocked' : store.status;

  return (
    <TableRow className="h-[55px]! cursor-pointer">
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
            <TooltipText content={store.storename}>
              <span className="truncate">{store.storename}</span>
            </TooltipText>
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
        <Switch
          checked={isAvailable}
          onCheckedChange={handleToggleAvailability}
          disabled={isPending}
        />
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
  );
}
