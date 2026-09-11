'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import AppPagination from '@/components/shared/AppPagination';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import Status from '@/components/shared/Status';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AssignedMenuProduct } from './types';

type SortableAssignedMenuProduct = AssignedMenuProduct & {
  categorySortName: string;
};

type AssignedMenuProductsTableProps = {
  rows: AssignedMenuProduct[];
  isLoading?: boolean;
};

export default function AssignedMenuProductsTable({
  rows,
  isLoading = false,
}: AssignedMenuProductsTableProps) {
  const t = useTranslations('products');
  const { getParam, setParams } = useQueryParams();
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;

  const sortableRows = useMemo<SortableAssignedMenuProduct[]>(
    () =>
      rows.map((row) => ({
        ...row,
        categorySortName: row.category,
      })),
    [rows],
  );

  const { items: sortedRows, requestSort, sortConfig } =
    useSortableData<SortableAssignedMenuProduct>(sortableRows);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (safePage === page) return;
    setParams({ page: String(safePage) });
  }, [page, safePage, setParams]);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * limit;
    return sortedRows.slice(start, start + limit);
  }, [limit, safePage, sortedRows]);

  const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      return t('table.notAvailable');
    }

    return formatCurrency(numericPrice, resolvedCurrencySymbol);
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_-20px_rgba(0,0,0,0.55)]">
      <div className="overflow-auto">
        <Table className="min-w-[1080px]">
          <TableHeader className="bg-accent/70">
            <TableRow>
              <TableHead className="w-[80px]">{t('table.image')}</TableHead>
              <TableHeaderCell
                label={t('table.name')}
                sortKey="name"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.category')}
                sortKey="categorySortName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={`${t('table.price')} (${resolvedCurrencySymbol})`}
                sortKey="price"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.unitOfMeasure')}
                sortKey="unitOfMeasure"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.stockQuantity')}
                sortKey="stockQuantity"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('table.inStock')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12">
                  <div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12">
                  <NoDataFound title={t('errors.noProducts')} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    '!h-[58px] hover:bg-accent/35',
                  )}
                >
                  <TableCell className="w-[80px]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-semibold text-slate-700">
                      {row.name.charAt(0).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{formatPrice(row.price)}</TableCell>
                  <TableCell>{row.unitOfMeasure || t('table.notAvailable')}</TableCell>
                  <TableCell>{row.stockQuantity ?? 0}</TableCell>
                  <TableCell>
                    <Status
                      status={row.inStock ? 'in_stock' : 'out_of_stock'}
                      label={row.inStock ? t('table.inStock') : t('table.outOfStock')}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="border-t bg-accent/30 p-3">
        {sortedRows.length > 0 && (
          <AppPagination
            page={safePage}
            totalPages={totalPages}
            totalData={sortedRows.length}
            defaultLimit={10}
          />
        )}
      </div>

    </div>
  );
}
