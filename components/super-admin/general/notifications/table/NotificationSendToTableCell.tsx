'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
  sendTo?: string[];
  emptyLabel?: string;
  moreSuffix?: string;
}

export function NotificationSendToTableCell({
  sendTo = [],
  emptyLabel = '—',
  moreSuffix = 'more',
}: Props) {
  const [open, setOpen] = useState(false);

  if (!sendTo.length) {
    return <span className="text-muted-foreground">{emptyLabel}</span>;
  }

  const getLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  const buildMoreLabel = (count: number) => {
    if (!moreSuffix) return `+${count}`;

    if (moreSuffix.includes('{count}')) {
      return moreSuffix.replace('{count}', String(count));
    }

    if (/[+\d]/.test(moreSuffix)) {
      return moreSuffix;
    }

    return `+${count} ${moreSuffix}`;
  };

  const visibleTypes = sendTo.slice(0, 1);
  const remainingCount = sendTo.length - 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex gap-1 cursor-pointer">
          {visibleTypes.map((type, index) => (
            <Badge key={index} variant="secondary">
              {getLabel(type)}
            </Badge>
          ))}

          {remainingCount > 0 && (
            <Badge variant="outline">{buildMoreLabel(remainingCount)}</Badge>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-60 p-3 max-h-60 overflow-y-auto"
      >
        <div className="space-y-2">
          {sendTo.map((type, index) => (
            <div key={index} className="text-sm border-b last:border-none pb-1">
              {getLabel(type)}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
