'use client';

import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SubCategory } from '@/types/entities/store/deliveries/sub-category';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubCategoryActionsProps {
  subCategory: SubCategory;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (subCategory: SubCategory) => void;
}

export default function SubCategoryActions({
  subCategory,
  onEdit,
  onDelete,
}: SubCategoryActionsProps) {
  const t = useTranslations('subCategories');

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
          onClick={() => onEdit(subCategory)}
        >
          <PenIcon className="size-[18px]" />
          <span className="text-sm">{t('form.editTitle')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
          onClick={() => onDelete(subCategory)}
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
