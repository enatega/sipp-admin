'use client';

import { MoreVertical, PenLine, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VendorMenuTemplateItem } from './types';

interface MenuTemplateActionsProps {
  item: VendorMenuTemplateItem;
  onEdit: (item: VendorMenuTemplateItem) => void;
  onDelete?: (item: VendorMenuTemplateItem) => void;
}

export default function MenuTemplateActions({
  item,
  onEdit,
  onDelete,
}: MenuTemplateActionsProps) {
  const t = useTranslations('vendorMenuTemplate.actions');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
        <MoreVertical size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[170px] p-0 rounded-xl overflow-hidden shadow-lg"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={() => onEdit(item)}
        >
          <PenLine className="size-[18px]" />
          <span className="text-sm">{t('edit')}</span>
        </DropdownMenuItem>
        {onDelete && (
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-[18px] text-help-red" />
            <span className="text-sm text-help-red">{t('delete')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
