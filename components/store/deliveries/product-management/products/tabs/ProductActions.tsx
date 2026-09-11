'use client';

import { Eye, MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProductActions({
  onView,
  onEdit,
  onDelete,
}: ProductActionsProps) {
  const t = useTranslations('products');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
        <MoreVertical size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={onView}
        >
          <Eye className="size-[18px]" />
          <span className="text-sm">{t('actions.view')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={onEdit}
        >
          <PenIcon className="size-[18px]" />
          <span className="text-sm">{t('actions.edit')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
          onClick={onDelete}
        >
          <TrashIcon className="size-[18px] text-help-red" />
          <span className="text-sm text-help-red">{t('actions.delete')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
