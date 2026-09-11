'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomizationRowActionsProps {
  disabled?: boolean;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomizationRowActions({
  disabled,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: CustomizationRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="border px-2 py-1.5 rounded-md shadow bg-white"
        disabled={disabled}
      >
        <MoreVertical size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[160px] p-0 rounded-xl overflow-hidden shadow-lg"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={onEdit}
        >
          <Pencil className="size-[18px]" />
          <span className="text-sm">{editLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
          onClick={onDelete}
        >
          <Trash2 className="size-[18px] text-help-red" />
          <span className="text-sm text-help-red">{deleteLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
