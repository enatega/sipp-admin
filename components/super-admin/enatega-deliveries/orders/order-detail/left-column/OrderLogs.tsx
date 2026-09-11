'use client';

import { Heading } from '@/components/shared/Heading';
import Status from '@/components/shared/Status';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderLog } from '@/types';
import { useTranslations } from 'next-intl';
import { formatOrderStatusLabel } from '../../utils';

interface OrderLogsProps {
  logs: OrderLog[];
}

export function OrderLogs({ logs }: OrderLogsProps) {
  const t = useTranslations('orders.orderDetail.orderLogs');
  const tHeaders = useTranslations('orders.orderDetail.orderLogs.headers');
  const tStatuses = useTranslations('orders.statuses');

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white shadow-sm">
      <Heading title={t('title')} containerClassName="mb-6 text-black" />

      <div className="rounded-t-md border overflow-hidden">
        <Table className="w-full text-start">
          <TableHeader className="bg-accent">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="p-4 text-black font-medium text-sm">
                {tHeaders('status')}
              </TableHead>
              <TableHead className="p-4 text-black font-medium text-sm">
                {tHeaders('by')}
              </TableHead>
              <TableHead className="p-4 text-black font-medium text-sm">
                {tHeaders('date')}
              </TableHead>
              <TableHead className="p-4 text-black font-medium text-sm">
                {tHeaders('ipDevice')}
              </TableHead>
              <TableHead className="p-4 text-black font-medium text-sm">
                {tHeaders('notes')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs && logs.length > 0 ? (
              logs.map((log, index) => (
                <TableRow
                  key={index}
                  className="border-b border-sidebar-border last:border-0 hover:bg-transparent"
                >
                  <TableCell className="p-4">
                    <Status
                      status={log?.status || t('notAvailable')}
                      label={formatOrderStatusLabel(
                        log?.status,
                        tStatuses,
                        t('notAvailable'),
                      )}
                    />
                  </TableCell>
                  <TableCell className="p-4 text-black text-sm">
                    {log?.by || t('notAvailable')}
                  </TableCell>
                  <TableCell className="p-4 text-black text-sm">
                    {log?.date || t('notAvailable')}
                  </TableCell>
                  <TableCell className="p-4 text-black text-sm">
                    {log?.ipDevice || t('notAvailable')}
                  </TableCell>
                  <TableCell className="p-4 text-black text-sm">
                    {log?.notes || t('notAvailable')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-8 text-center text-mute text-sm"
                >
                  {t('noLogs')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
