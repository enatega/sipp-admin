'use client';

import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Option as StoreOption } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OptionActionsProps {
  option: StoreOption;
  onEdit?: (option: StoreOption) => void;
  onDelete?: (option: StoreOption) => void;
}

export function OptionActions({
  option,
  onEdit,
  onDelete,
}: OptionActionsProps) {
  const t = useTranslations('storeOptions');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-0 border px-2 py-1.5 rounded-md shadow align-center flex items-center justify-center hover:bg-muted/50">
        <MoreVertical size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[160px] p-0 rounded-xl overflow-hidden shadow-lg"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={() => onEdit?.(option)}
        >
          <PenIcon className="size-[18px]" />
          <span className="text-sm">{t('actions.edit')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
          onClick={() => onDelete?.(option)}
        >
          <TrashIcon className="size-[18px] text-help-red" />
          <span className="text-sm text-help-red">{t('actions.delete')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
