'use client';

import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import type { OrderProduct as OrderItem } from '@/types';
import { EyeIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AddonsModal } from './AddonsModal';

type Addon = {
  name: string;
  price: number;
};

interface ItemsServicesProps {
  // Accept either an array of products or an object with a `products` array
  items: OrderItem[] | { products?: OrderItem[] } | undefined | null;
}

export function ItemsServices({ items }: ItemsServicesProps) {
  const t = useTranslations('orders.orderDetail.itemsServices');
  const tHeaders = useTranslations('orders.orderDetail.itemsServices.headers');
  const { currencySymbol } = useCurrency();
  const currency = currencySymbol || 'QAR';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Normalize incoming items: support both `items: { products: [...] }` and `items: [...]`
  const products: OrderItem[] = Array.isArray(items)
    ? items
    : items?.products ?? [];

  const handleOpenAddons = (addons: Addon[]) => {
    setSelectedAddons(addons);
    setIsModalOpen(true);
  };

  // `renderAddon` removed — not used. Keep normalization logic minimal and type-safe instead.

  const normalizeAddons = (item: OrderItem) => {
    // Try selectedOptions -> addons -> addon
    const source =
      Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0
        ? item.selectedOptions
        : Array.isArray(item.addons) && item.addons.length > 0
        ? item.addons
        : item.addon != null
        ? [item.addon]
        : [];

    const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

    const normalized: Addon[] = source.map((s) => {
      if (!s) return { name: '', price: 0 };
      if (typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean') {
        return { name: String(s), price: 0 };
      }
      // If it's an object, try to extract common fields using unknown-safe access
      if (isRecord(s)) {
        const groupName = s['groupName'];
        const optionName = s['optionName'];
        const composedName =
          groupName || optionName
            ? [groupName, optionName].filter(Boolean).join(' - ')
            : undefined;
        const nameVal =
          composedName ?? s['name'] ?? s['label'] ?? s['title'] ?? s['option'];
        const priceVal = s['price'] ?? s['amount'] ?? s['cost'] ?? 0;
        const name = nameVal !== undefined ? String(nameVal) : 'Addon';
        const price = Number(priceVal ?? 0) || 0;
        return { name, price };
      }

      return { name: '', price: 0 };
    });

    return normalized;
  };

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white shadow-sm">
      <Heading title={t('title')} containerClassName="mb-6 text-black" />

      <div className="rounded-t-md border overflow-hidden">
        <Table className="w-full text-start">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHead className="p-4 font-medium">
                {tHeaders('itemServiceName')}
              </TableHead>
              <TableHead className="p-4 font-medium">{tHeaders('price')}</TableHead>
              <TableHead className="p-4 font-medium">{tHeaders('addon')}</TableHead>
              <TableHead className="p-4 font-medium">
                {tHeaders('finalPrice')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products?.length > 0 ? (
              products.map((item, index) => (
                <TableRow
                  key={index}
                  className="border-b border-sidebar-border last:border-0"
                >
                  <TableCell className="p-4">
                    <div className="flex items-start gap-3">
                      {item?.image && (
                        <Image
                          src={item?.image}
                          alt={item?.itemName || item?.name || ''}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                          unoptimized
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-black font-semibold text-sm">
                          {item?.itemName ?? item?.name ?? item?.title ?? ''}
                        </span>
                        <span className="text-mute text-xs">
                          {t('quantityLabel')}{' '}
                          {item?.quantity
                            ? item?.quantity < 10
                              ? `0${item?.quantity}`
                              : item?.quantity
                            : '00'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-4 text-black font-medium text-sm">
                    {formatCurrency(item?.price ?? 0, currency)}
                  </TableCell>
                  <TableCell className="p-4">
                    {(() => {
                      const itemAddons = normalizeAddons(item);
                      const has = itemAddons.length > 0;
                      return (
                        <AppButton
                          variant="mute"
                          size="sm"
                          leftIcon={<EyeIcon size={16} />}
                          onClick={() => handleOpenAddons(itemAddons)}
                          disabled={!has}
                          className={`h-auto py-1 px-3 rounded-[8px] border-sidebar-border text-mute ${
                            !has ? 'opacity-60' : ''
                          }`}
                        >
                          {t('viewButton')}
                        </AppButton>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="p-4 text-black font-semibold text-sm text-start">
                    {formatCurrency(item?.finalPrice ?? item?.price ?? 0, currency)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="p-8 text-center text-mute text-sm"
                >
                  {t('noItems')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={3}
                className="p-4 text-black font-bold text-sm"
              >
                {t('totalAmount')}
              </TableCell>
                  <TableCell className="p-4 text-black font-bold text-sm">
                    {formatCurrency(products.reduce((acc, item) => acc + (item.finalPrice ?? item.price ?? 0), 0), currency)}
                  </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AddonsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addons={selectedAddons}
      />
    </div>
  );
}
