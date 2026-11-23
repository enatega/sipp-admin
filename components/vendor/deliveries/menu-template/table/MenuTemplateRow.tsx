'use client';

import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import TooltipText from '@/components/shared/TooltipText';
import MenuTemplateActions from './MenuTemplateActions';
import { VendorMenuTemplateItem } from './types';

interface MenuTemplateRowProps {
  item: VendorMenuTemplateItem;
  isToggling?: boolean;
  onView: (item: VendorMenuTemplateItem) => void;
  onToggleAvailability: (item: VendorMenuTemplateItem) => void;
  onEdit: (item: VendorMenuTemplateItem) => void;
  onDelete?: (item: VendorMenuTemplateItem) => void;
}

export default function MenuTemplateRow({
  item,
  isToggling,
  onView,
  onToggleAvailability,
  onEdit,
  onDelete,
}: MenuTemplateRowProps) {
  const initials = item.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <TableRow className="h-[55px]! cursor-pointer" onClick={() => onView(item)}>
      <TableCell className="min-w-[220px]">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover border"
            />
          ) : (
            <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
              {initials || 'MT'}
            </div>
          )}
          <span>{item.name}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-[360px] max-w-[360px]">
        <TooltipText content={item.description}>
          <span className="truncate">{item.description}</span>
        </TooltipText>
      </TableCell>
      <TableCell className="font-medium">
        {item.assignedStores.length.toLocaleString()}
      </TableCell>
      <TableCell className="font-medium">
        {item.totalProducts.toLocaleString()}
      </TableCell>
      <TableCell>
        <Switch
          checked={item.isActive}
          disabled={isToggling}
          onCheckedChange={() => onToggleAvailability(item)}
          onClick={(event) => event.stopPropagation()}
        />
      </TableCell>
      <TableCell className="w-[70px]" onClick={(event) => event.stopPropagation()}>
        <MenuTemplateActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
