'use client';

import { useState } from 'react';
import { VendorWithdrawalRequest } from '@/types';
import { CircleCheckBig, CircleX, Copy, Eye, MoreVertical } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetwithdrawalRequests } from '@/hooks/api/super-admin/enatega-deliveries/withdrawal-request';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { AppButton } from '@/components/shared/AppButton';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { ApproveWithdrawalDialog } from '../dialogs/ApproveWithdrawalRequest';
import { BankDetailsDialog } from '../dialogs/BankDetailDialog';
import { RejectWithdrawalDialog } from '../dialogs/RejectWithdrawalDialog';
import { WithdrawalDetailsDialog } from '../dialogs/WithdrawalRequestDetail';

type DialogTypes =
  | 'approve-request'
  | 'reject-request'
  | 'bank-details'
  | 'view-details'
  | '';

export default function VendorWithdrawalTable() {
  const tTable = useTranslations('withdrawalRequests.table');
  const [selectedRequest, setSelectedRequest] =
    useState<VendorWithdrawalRequest | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogTypes>('');

  const { getParam } = useQueryParams();
  const page = Number(getParam('page')) || 1;
  const limit = (Number(getParam('limit')) || 10) as TLimitType;

  // Use the API hook
  const { data, isLoading, isFetching, isError, error } = useGetwithdrawalRequests({
    placeholderData: (prev) => prev,
  });
  const showTableLoading = isLoading || isFetching;

  const vendorWithdrawalRequests = (data?.data ||
    []) as VendorWithdrawalRequest[];
  const totalItems = data?.total || 0;

  const {
    items: sortedWithdrawalRequests,
    requestSort,
    sortConfig,
  } = useSortableData(vendorWithdrawalRequests);

  const handleAction = (
    request: VendorWithdrawalRequest,
    dialog: DialogTypes,
  ) => {
    setSelectedRequest(request);
    setActiveDialog(dialog);
  };

  const handleCopyRequestID = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    toast.success(tTable('requestIdCopied'));
  };

  const { currencySymbol } = useCurrency();
  const notAvailable = tTable('notAvailable');

  return (
    <div className="rounded-md border mb-8 overflow-auto">
      <Table className="min-w-[1200px] w-full ">
        <TableHeader className="bg-accent">
          <TableRow className="!h-[55px]">
            <TableHeaderCell
              label={tTable('requestId')}
              sortKey={'request_id'}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={tTable('vendorName')}
              sortKey={'vendor_name'}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={tTable('totalVendorBalance')}
              sortKey={'total_vendor_balance'}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={tTable('requestedAmount')}
              sortKey={'requested_amount'}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={tTable('requestDate')}
              sortKey={'request_date'}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHeaderCell
              label={tTable('status')}
              sortKey={'status'}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
            <TableHead>{tTable('bankDetails')}</TableHead>
            <TableHead>{tTable('actions')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {showTableLoading && <TableShimmer columns={8} limit={10} />}

          {isError && (
            <TableRow>
              <TableCell colSpan={8}>
                <DisplayError
                  title={tTable('errorTitle')}
                  message={
                    error instanceof Error
                      ? returnErrorMessage(error)
                      : tTable('errorMessage')
                  }
                />
              </TableCell>
            </TableRow>
          )}

          {!showTableLoading && !isError && sortedWithdrawalRequests?.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <NoDataFound
                  title={tTable('noData')}
                  subtitle={tTable('noDataSubtitle')}
                />
              </TableCell>
            </TableRow>
          )}

          {!showTableLoading &&
            !isError &&
            sortedWithdrawalRequests?.map((withdrawalRequest) => (
              <TableRow
                key={withdrawalRequest?.request_id}
                className="!h-[55px] hover:bg-accent/50"
              >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>
                    {withdrawalRequest?.request_id
                      ? withdrawalRequest.request_id.slice(0, 8)
                      : notAvailable}
                  </span>
                  {withdrawalRequest?.request_id && (
                    <Copy
                      className="ml-2 w-5 h-5 text-gray-500 cursor-pointer hover:text-primary"
                      onClick={() =>
                        handleCopyRequestID(withdrawalRequest.request_id)
                      }
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-accent">
                    {withdrawalRequest?.vendor_name?.slice(0, 1)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {withdrawalRequest?.vendor_name || notAvailable}
              </TableCell>
              <TableCell>
                {withdrawalRequest?.total_vendor_balance != null
                  ? `${currencySymbol || 'QAR '}${withdrawalRequest.total_vendor_balance}`
                  : notAvailable}
              </TableCell>

              <TableCell>
                {withdrawalRequest?.requested_amount != null
                  ? `${currencySymbol || 'QAR '}${withdrawalRequest.requested_amount}`
                  : notAvailable}
              </TableCell>

              <TableCell>
                {withdrawalRequest?.request_date &&
                moment(withdrawalRequest.request_date).isValid()
                  ? moment(withdrawalRequest.request_date).format(
                      'DD MMM YYYY, hh:mm A',
                    )
                  : notAvailable}
              </TableCell>
              <TableCell>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(withdrawalRequest, 'view-details');
                  }}
                >
                  <Status
                    status={withdrawalRequest?.status?.toLocaleLowerCase()}
                  />
                </div>
              </TableCell>
              <TableCell>
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(withdrawalRequest, 'bank-details');
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{tTable('view')}</span>
                </AppButton>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
                    <MoreVertical size={20} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="p-0 rounded-xl shadow-lg"
                  >
                    {withdrawalRequest?.status?.toUpperCase() === 'PENDING' && (
                      <>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(withdrawalRequest, 'approve-request');
                          }}
                        >
                          <CircleCheckBig className="size-[18px] text-help-green" />
                          <span className="text-sm text-help-green ">
                            {tTable('approve')}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(withdrawalRequest, 'reject-request');
                          }}
                        >
                          <CircleX className="size-[18px] text-help-red" />
                          <span className="text-sm text-help-red">
                            {tTable('reject')}
                          </span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {(withdrawalRequest?.status?.toUpperCase() === 'APPROVED' ||
                      withdrawalRequest?.status?.toUpperCase() ===
                        'TRANSFERED') && (
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(withdrawalRequest, 'view-details');
                        }}
                      >
                        <CircleCheckBig className="size-[18px] text-help-green" />
                        <span className="text-sm text-help-green ">
                          {tTable('approvalDetails')}
                        </span>
                      </DropdownMenuItem>
                    )}

                    {withdrawalRequest?.status?.toUpperCase() ===
                      'REJECTED' && (
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(withdrawalRequest, 'view-details');
                        }}
                      >
                        <CircleX className="size-[18px] text-help-red" />
                        <span className="text-sm text-help-red ">
                          {tTable('rejectionDetails')}
                        </span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className="p-3 bg-accent/30 border-t rounded-b-md">
        {!showTableLoading && !isError && totalItems > 0 && (
          <AppPagination
            page={page}
            totalPages={data?.totalPages || 1}
            totalData={totalItems}
            defaultLimit={limit}
          />
        )}
      </div>

      {selectedRequest && activeDialog === 'approve-request' && (
        <ApproveWithdrawalDialog
          open={activeDialog === 'approve-request'}
          onOpenChange={() => setActiveDialog('')}
          withdrawId={selectedRequest.request_id}
          requestedAmount={selectedRequest.requested_amount}
        />
      )}

      {selectedRequest && activeDialog === 'reject-request' && (
        <RejectWithdrawalDialog
          open={activeDialog === 'reject-request'}
          onOpenChange={() => setActiveDialog('')}
          withdrawId={selectedRequest.request_id}
        />
      )}

      {selectedRequest && activeDialog === 'bank-details' && (
        <BankDetailsDialog
          open={activeDialog === 'bank-details'}
          onOpenChange={() => setActiveDialog('')}
          withdrawRequest={selectedRequest}
        />
      )}

      {selectedRequest && activeDialog === 'view-details' && (
        <WithdrawalDetailsDialog
          open={activeDialog === 'view-details'}
          onOpenChange={() => setActiveDialog('')}
          withdrawRequest={selectedRequest}
        />
      )}
    </div>
  );
}
