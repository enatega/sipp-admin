'use client';

import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import AppPagination from '@/components/shared/AppPagination';
import { Badge } from '@/components/ui/badge';
import { HistoryItem } from '../types';

interface HistoryTableProps {
  data: HistoryItem[];
  isCustomer: boolean;
  currentPage: number;
  totalPages: number;
  totalData: number;
}

const HistoryTable = ({
  data,
  isCustomer,
  currentPage,
  totalPages,
  totalData,
}: HistoryTableProps) => {
  const t = useTranslations(
    'deliveriesCustomerLoyaltyAndReferrals.referralAndLoyaltyHistory',
  );
  const { items, requestSort, sortConfig } = useSortableData(data);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className="min-w-[700px]">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHeaderCell
              label={isCustomer ? t('table.customerName') : t('table.riderName')}
              sortKey="name"
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={t('table.totalPoints')}
              sortKey="totalPoints"
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHead>{t('table.type')}</TableHead>
            <TableHeaderCell
              label={t('table.lastPurchase')}
              sortKey="lastPurchase"
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <NoDataFound title={t('table.noData')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow className="!h-[55px]" key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.totalPoints.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.type === 'referral' ? 'default' : 'secondary'}
                    className={
                      item.type === 'referral'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'bg-green-100 text-green-700 hover:bg-green-100'
                    }
                  >
                    {t(`table.types.${item.type}`)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(item.lastPurchase)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalData > 0 && (
        <div className="bg-accent/30 border-t p-3">
          <AppPagination
            page={currentPage}
            totalPages={totalPages}
            totalData={totalData}
            defaultLimit={10}
          />
        </div>
      )}
    </div>
  );
};

export { HistoryTable };
