'use client';

import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import Status from '@/components/shared/Status';
import TooltipText from '@/components/shared/TooltipText';
import VendorStoreActions from './VendorStoreActions';
import { VendorStoreTableItem } from './types';

interface StoreRowProps {
  store: VendorStoreTableItem;
  isToggling?: boolean;
  onView: (store: VendorStoreTableItem) => void;
  onEdit: (store: VendorStoreTableItem) => void;
  onToggleAvailability: (store: VendorStoreTableItem) => void;
  onDelete: (store: VendorStoreTableItem) => void;
}

export default function StoreRow({
  store,
  isToggling = false,
  onView,
  onEdit,
  onToggleAvailability,
  onDelete,
}: StoreRowProps) {
  const t = useTranslations('vendorDeliveriesStores');
  const displayStatus = store.isBlocked ? 'blocked' : store.status || 'pending';

  return (
    <TableRow className="h-[55px]! ">
      <TableCell className="max-w-[150px] truncate">
        <div className="flex items-center gap-2">
          {store?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logo}
              alt={store.name}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs">
              {store?.name?.charAt(0)}
            </div>
          )}
          {store?.name ? (
            <TooltipText content={store.name}>
              <span className="truncate">{store.name}</span>
            </TooltipText>
          ) : (
            <span>{t('notAvailable')}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium text-primary">
        {store.totalOrders.toLocaleString()}
      </TableCell>

      <TableCell>{store.shopTypeName || t('notAvailable')}</TableCell>
      <TableCell className="max-w-[200px] truncate">
        {store.address ? (
          <TooltipText content={store.address}>
            <span>{store.address}</span>
          </TooltipText>
        ) : (
          t('notAvailable')
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={store.isAvailable}
          disabled={isToggling}
          onCheckedChange={() => onToggleAvailability(store)}
        />
      </TableCell>
      <TableCell>
        <Status status={displayStatus} />
      </TableCell>
      <TableCell>
        {store.createdAt ? format(new Date(store.createdAt), 'dd MMM yyyy') : t('notAvailable')}
      </TableCell>
      <TableCell>{store.activeOrders}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span>{store.rating.toFixed(1)}</span>
        </div>
      </TableCell>
      <TableCell>
        <VendorStoreActions
          store={store}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
