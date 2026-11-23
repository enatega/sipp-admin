'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

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
import { useLocalizedText } from '@/hooks/use-localized-text';
import { formatCurrency } from '@/lib/formatCurrency';
import type { OrderProduct as OrderItem } from '@/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

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
  const localizedText = useLocalizedText();
  const currency = currencySymbol || DEFAULT_CURRENCY.symbol;

  // Normalize incoming items: support both `items: { products: [...] }` and `items: [...]`
  const products: OrderItem[] = Array.isArray(items)
    ? items
    : items?.products ?? [];

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
        const translations = (key: string) =>
          isRecord(s[key]) ? (s[key] as Record<string, string>) : undefined;
        const text = (value: unknown, key: string) =>
          typeof value === 'string' ? localizedText(value, translations(key)) : value;
        const groupName = text(s['groupName'], 'groupNameTranslations');
        const optionName = text(s['optionName'], 'optionNameTranslations');
        // Show only the chosen variation; fall back to the group name if it is missing.
        const nameVal =
          optionName || groupName || s['name'] || s['label'] || s['title'] || s['option'];
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
                          {item?.itemName
                            ? localizedText(item.itemName, item.itemNameTranslations)
                            : item?.name ?? item?.title ?? ''}
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
                      const itemAddons = normalizeAddons(item).filter((addon) => addon.name);
                      if (itemAddons.length === 0) {
                        return <span className="text-mute text-sm">—</span>;
                      }
                      return (
                        <ul className="flex flex-col gap-1">
                          {itemAddons.map((addon, addonIndex) => (
                            <li
                              key={addonIndex}
                              className="flex items-baseline justify-between gap-3 text-sm"
                            >
                              <span className="text-black">{addon.name}</span>
                              {/* A variation priced the same as the item is the item's own price: don't repeat it. */}
                              {addon.price > 0 && addon.price !== (item?.price ?? 0) ? (
                                <span className="text-mute whitespace-nowrap">
                                  +{formatCurrency(addon.price, currency)}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
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
    </div>
  );
}
