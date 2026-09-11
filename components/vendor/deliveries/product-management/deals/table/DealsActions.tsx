'use client';

import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import type { Deal } from '@/types';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DealsActionsProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

const DealsActions = ({ deal, onEdit, onDelete }: DealsActionsProps) => {
  const t = useTranslations('deals.actions');

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
          onClick={() => onEdit(deal)}
        >
          <PenIcon className="size-[18px]" />
          <span className="text-sm">{t('edit')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
          onClick={() => onDelete(deal)}
        >
          <TrashIcon className="size-[18px] text-help-red" />
          <span className="text-sm text-help-red">{t('delete')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DealsActions;
