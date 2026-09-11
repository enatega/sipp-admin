'use client';

import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Category } from '@/types/entities/store/deliveries/category';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryActionsProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryActions({
  category,
  onEdit,
  onDelete,
}: CategoryActionsProps) {
  const t = useTranslations('categories');

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
          onClick={() => onEdit(category)}
        >
          <PenIcon className="size-[18px]" />
          <span className="text-sm">{t('form.editTitle')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
          onClick={() => onDelete(category)}
        >
          <TrashIcon className="size-[18px] text-help-red" />
          <span className="text-sm text-help-red">
            {t('errors.deleteTitle')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
