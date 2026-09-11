import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EnategaDeliveriesDashboardTopVendor } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer } from '@/components/shared/TableShimmer';

interface TopVendorTableProps {
  data?: EnategaDeliveriesDashboardTopVendor[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

export default function TopVendorTable({
  data,
  isLoading,
  isError,
  errorMessage,
}: TopVendorTableProps) {
  const t = useTranslations('lumiFood.dashboard.tables.topVendors');
  const { currencySymbol } = useCurrency();
  const vendors = data ?? [];
  const notAvailable = t('notAvailable');
  const { items, requestSort, sortConfig } = useSortableData(vendors);

  return (
    <div className="flex flex-col">
      <h2 className="text-base font-semibold mb-3 sm:mb-4">{t('title')}</h2>
      <div className="rounded-md border flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={t('vendor')}
                sortKey={'vendorName'}
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-3"
              />
              <TableHeaderCell
                label={t('orders')}
                sortKey={'orders'}
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-3"
              />
              <TableHeaderCell
                label={t('revenue')}
                sortKey={'revenue'}
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-3"
              />
              <TableHeaderCell
                label={t('rating')}
                sortKey={'rating'}
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-3"
              />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10} columns={4} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <DisplayError
                    title={t('loadFailedTitle')}
                    message={errorMessage}
                    variant="error"
                  />
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <NoDataFound
                    title={t('noDataTitle')}
                    subtitle={t('noDataSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.vendorId} className="!h-[55px]">
                  <TableCell className="font-medium">
                    {item.vendorName || notAvailable}
                  </TableCell>
                  <TableCell>{item.orders ?? 0}</TableCell>
                  <TableCell>
                    {currencySymbol || '$'}
                    {Number(item.revenue ?? 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Star
                      className="inline mr-2 fill-current text-orange-500"
                      height={17}
                      width={17}
                    />
                    <span>{item.rating ?? 0}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
