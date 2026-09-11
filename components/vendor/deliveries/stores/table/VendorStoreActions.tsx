'use client';

import { Eye, MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VendorStoreTableItem } from './types';

interface VendorStoreActionsProps {
  store: VendorStoreTableItem;
  onView: (store: VendorStoreTableItem) => void;
  onEdit: (store: VendorStoreTableItem) => void;
  onDelete: (store: VendorStoreTableItem) => void;
}

export default function VendorStoreActions({
  store,
  onView,
  onEdit,
  onDelete,
}: VendorStoreActionsProps) {
  const t = useTranslations('vendorDeliveriesStores');

  return (
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
          onClick={() => onView(store)}
        >
          <Eye className="size-[18px]" />
          <span className="text-sm">{t('viewStore')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={() => onEdit(store)}
        >
          <PenIcon className="size-[18px]" />
          <span className="text-sm">{t('editStore')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
          onClick={() => onDelete(store)}
        >
          <TrashIcon className="size-[18px] text-help-red" />
          <span className="text-sm text-help-red">{t('deleteStore')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
