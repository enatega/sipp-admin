'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type StoreType = string | { _id?: string; name?: string };

interface Props {
  stores: StoreType[] | undefined;
  emptyLabel?: string;
  unknownLabel?: string;
  moreSuffix?: string;
}

export function StoresTableCell({
  stores = [],
  emptyLabel,
  unknownLabel,
  moreSuffix,
}: Props) {
  const t = useTranslations('lumiFood.discountsOffers.storeCell');
  const [open, setOpen] = useState(false);
  const resolvedEmptyLabel = emptyLabel ?? t('empty');
  const resolvedUnknownLabel = unknownLabel ?? t('unknown');
  const resolvedMoreSuffix = moreSuffix ?? t('more');

  if (!stores.length) {
    return <span className="text-muted-foreground">{resolvedEmptyLabel}</span>;
  }

  const getLabel = (store: StoreType) =>
    typeof store === 'string' ? store : (store?.name ?? resolvedUnknownLabel);

  const visibleStores = stores.slice(0, 1);
  const remainingCount = stores.length - 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex gap-1 cursor-pointer">
          {visibleStores.map((store, index) => (
            <Badge key={index} variant="secondary">
              {getLabel(store)}
            </Badge>
          ))}

          {remainingCount > 0 && (
            <Badge variant="outline" className="cursor-pointer">
              +{remainingCount} {resolvedMoreSuffix}
            </Badge>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-60 p-3 max-h-60 overflow-y-auto"
      >
        <div className="space-y-2">
          {stores.map((store, index) => (
            <div
              key={index}
              className="text-sm border-b last:border-none  pb-1"
            >
              {getLabel(store)}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
