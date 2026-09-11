'use client';

import { StoreBillingHistoryItem } from '@/types';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';

type Props = {
  rows: StoreBillingHistoryItem[];
};

export function BillingHistoryTable({ rows }: Props) {
  const { items, requestSort, sortConfig } =
    useSortableData<StoreBillingHistoryItem>(rows);

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (value: number) => `$${value.toFixed(2)}`;

  const formatStatus = (value: string) =>
    value.toLowerCase() === 'paid' ? 'Paid' : 'Failed';

  return (
    <div className="rounded-md border overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-accent rounded-t-md">
          <TableRow>
            <TableHeaderCell
              label="Invoice"
              sortKey="invoiceId"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
            <TableHeaderCell
              label="Date"
              sortKey="date"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
            <TableHeaderCell
              label="Plan"
              sortKey="plan"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
            <TableHeaderCell
              label="Billing Cycle"
              sortKey="billingCycle"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
            <TableHeaderCell
              label="Method"
              sortKey="method"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
            <TableHeaderCell
              label="Amount"
              sortKey="amount"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
            <TableHeaderCell
              label="Status"
              sortKey="status"
              requestSort={requestSort}
              sortConfig={sortConfig}
              containerClass="pl-3"
            />
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <NoDataFound
                  title="No billing history found"
                  subtitle="No invoices are available yet."
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((row) => (
              <TableRow key={row.invoiceId} className="!h-[55px] text-black">
                <TableCell>{row.invoiceId}</TableCell>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell>{row.plan}</TableCell>
                <TableCell className="capitalize">{row.billingCycle}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell>{formatAmount(row.amount)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      row.status.toLowerCase() === 'paid'
                        ? 'bg-help-green/20 text-help-green hover:bg-help-green/20'
                        : 'bg-help-red/20 text-help-red hover:bg-help-red/20'
                    }
                  >
                    {formatStatus(row.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="p-3 bg-accent/30 border-t rounded-b-md">
        <AppPagination
          page={1}
          totalPages={1}
          totalData={items.length}
          defaultLimit={10}
        />
      </div>
    </div>
  );
}
