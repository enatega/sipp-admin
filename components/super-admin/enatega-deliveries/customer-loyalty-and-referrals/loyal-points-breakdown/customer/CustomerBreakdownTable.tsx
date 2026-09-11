'use client';

import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CustomerBreakdown } from '../../types';

interface CustomerBreakdownTableProps {
  data: CustomerBreakdown[];
  onEdit: (item: CustomerBreakdown) => void;
  onDelete: (item: CustomerBreakdown) => void;
}

const CustomerBreakdownTable = ({
  data,
  onEdit,
  onDelete,
}: CustomerBreakdownTableProps) => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.loyalPointsBreakdown');
  // const { currencyCode } = useCurrency();
  const { items, requestSort, sortConfig } = useSortableData(data);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className="min-w-[600px]">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHeaderCell
              label={t('table.spendingRange')}
              sortKey="rangeFrom"
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={t('table.percentage')}
              sortKey="points"
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={t('table.points')}
              sortKey="pointsWorth"
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHead className="text-right">{t('table.actions')}</TableHead>
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
                <TableCell className="font-medium">
                  {item.rangeFrom} - {item.rangeTo}
                </TableCell>
                <TableCell>{item.points}%</TableCell>
                <TableCell>{item.pointsWorth.toFixed(0)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
                      <MoreVertical size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
                    >
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                        onClick={() => onEdit(item)}
                      >
                        <PenIcon className="size-[18px]" />
                        <span className="text-sm">{t('table.edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                        onClick={() => onDelete(item)}
                      >
                        <TrashIcon className="size-[18px] text-help-red" />
                        <span className="text-sm text-help-red">
                          {t('table.delete')}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { CustomerBreakdownTable };

