'use client';

import type { Deal } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import { formatCurrency } from '@/lib/formatCurrency';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer } from '@/components/shared/TableShimmer';
import DealsActions from './DealsActions';
import Filters from './Filters';
import { getDiscountDisplayValue } from './dealDrawer.utils';

interface DealsTableProps {
  deals: Deal[];
  fetchAll: () => Promise<Deal[]>;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onToggleDealStatus?: (deal: Deal, isActive: boolean) => void;
  statusLoadingDealId?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  page?: number;
  totalPages?: number;
  totalData?: number;
}

const DEAL_DATE_FORMAT = 'DD MMM YYYY, hh:mm A';

const DealsTable = ({
  deals,
  fetchAll,
  onEditDeal,
  onDeleteDeal,
  onToggleDealStatus,
  statusLoadingDealId,
  isLoading = false,
  isError = false,
  errorMessage = '',
  page = 1,
  totalPages = 1,
  totalData = 0,
}: DealsTableProps) => {
  const tTable = useTranslations('deals.table');
  const tStatus = useTranslations('deals.status');
  const { currencyCode, currencySymbol } = useCurrency();
  const resolvedCurrencyCode = currencyCode || 'CRC';
  const resolvedCurrencySymbol = currencySymbol || '$';
  const { items, requestSort, sortConfig } = useSortableData<Deal>(deals);
  const dealDownloadColumns = [
    { header: tTable('dealName'), dataKey: 'dealName' },
    {
      header: tTable('product'),
      dataKey: 'product',
      formatter: (item: Deal) => {
        if (
          !item.isProductLevelDeal ||
          typeof item.productPrice !== 'number' ||
          typeof item.priceAfterDiscount !== 'number'
        ) {
          return item.product;
        }

        return `${item.product} (${item.productPrice.toFixed(2)} -> ${item.priceAfterDiscount.toFixed(2)})`;
      },
    },
    {
      header: tTable('variation'),
      dataKey: 'variation',
      formatter: (item: Deal) => {
        if (
          typeof item.variationPrice !== 'number' ||
          typeof item.priceAfterDiscount !== 'number'
        ) {
          return item.variation;
        }

        return `${item.variation} (${item.variationPrice.toFixed(2)} -> ${item.priceAfterDiscount.toFixed(2)})`;
      },
    },
    { header: tTable('dealType'), dataKey: 'dealType' },
    {
      header: tTable('discount'),
      dataKey: 'discount',
      formatter: (item: Deal) =>
        getDiscountDisplayValue(
          item.discountType || 'percentage',
          item.discount,
          resolvedCurrencyCode,
        ),
    },
    {
      header: tTable('startDate'),
      dataKey: 'startDate',
      formatter: (item: Deal) => moment(item.startDate).format(DEAL_DATE_FORMAT),
    },
    {
      header: tTable('endDate'),
      dataKey: 'endDate',
      formatter: (item: Deal) => moment(item.endDate).format(DEAL_DATE_FORMAT),
    },
    {
      header: tTable('status'),
      dataKey: 'status',
      formatter: (item: Deal) =>
        item.status === 'active' ? tStatus('active') : tStatus('inactive'),
    },
  ];
  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<Deal>
          fileName="deals_report"
          columns={dealDownloadColumns}
          data={deals}
          fetchAll={fetchAll}
        />
      </div>

      <div className="rounded-md border overflow-auto mt-4">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={tTable('dealName')}
                sortKey="dealName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('product')}
                sortKey="product"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('variation')}
                sortKey="variation"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('dealType')}
                sortKey="dealType"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('discount')}
                sortKey="discount"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('startDate')}
                sortKey="startDate"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('endDate')}
                sortKey="endDate"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{tTable('status')}</TableHead>
              <TableHead>{tTable('action')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10} columns={9} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <DisplayError
                    title={tTable('fetchFailedTitle')}
                    message={errorMessage}
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <NoDataFound title={tTable('noDataTitle')} />
                </TableCell>
              </TableRow>
            ) : (
              items.map((deal) => (
                <TableRow className="!h-[55px]" key={deal.id}>
                  <TableCell>{deal.dealName}</TableCell>
                  <TableCell>
                    <p className="truncate">{deal.product}</p>
                    {deal.isProductLevelDeal &&
                      typeof deal.productPrice === 'number' &&
                      typeof deal.priceAfterDiscount === 'number' && (
                        <p className="text-xs text-muted-foreground">
                          {`${formatCurrency(deal.productPrice, resolvedCurrencySymbol)} -> ${formatCurrency(
                            deal.priceAfterDiscount,
                            resolvedCurrencySymbol,
                          )}`}
                        </p>
                      )}
                  </TableCell>
                  <TableCell>
                    <p className="truncate">{deal.variation}</p>
                    {typeof deal.variationPrice === 'number' &&
                      typeof deal.priceAfterDiscount === 'number' && (
                        <p className="text-xs text-muted-foreground">
                          {`${formatCurrency(deal.variationPrice, resolvedCurrencySymbol)} -> ${formatCurrency(
                            deal.priceAfterDiscount,
                            resolvedCurrencySymbol,
                          )}`}
                        </p>
                      )}
                  </TableCell>
                  <TableCell>{deal.dealType}</TableCell>
                  <TableCell>
                    {getDiscountDisplayValue(
                      deal.discountType || 'percentage',
                      deal.discount,
                      resolvedCurrencyCode,
                    )}
                  </TableCell>
                  <TableCell>
                    {moment(deal.startDate).format(DEAL_DATE_FORMAT)}
                  </TableCell>
                  <TableCell>
                    {moment(deal.endDate).format(DEAL_DATE_FORMAT)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={deal.status === 'active'}
                      disabled={statusLoadingDealId === deal.id}
                      onCheckedChange={(checked) => {
                        onToggleDealStatus?.(deal, checked);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <DealsActions
                      deal={deal}
                      onEdit={onEditDeal}
                      onDelete={onDeleteDeal}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          {!isLoading && !isError && items.length > 0 && (
            <AppPagination
              page={page}
              totalPages={totalPages}
              totalData={totalData}
              defaultLimit={10}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DealsTable;
