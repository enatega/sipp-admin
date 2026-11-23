'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Check, Copy } from 'lucide-react';
import {
  GetVendorRatingReviewsResponse,
  VendorRatingReviewStore,
} from '@/types';
import moment from 'moment';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import { AverageRatingDisplay } from '@/components/shared/AverageRatingDisplay';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import Filters from './Filters';

interface RatingAndReviewsTableProps {
  data?: GetVendorRatingReviewsResponse;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const RatingAndReviewsTable = ({
  data,
  isLoading,
  isError,
  errorMessage,
}: RatingAndReviewsTableProps) => {
  const t = useTranslations('vendorRatingReviews.table');
  const tColumns = useTranslations('vendorRatingReviews.table.columns');
  const tErrors = useTranslations('vendorRatingReviews.table.errors');
  const tNoData = useTranslations('vendorRatingReviews.table.noData');
  const tActions = useTranslations('vendorRatingReviews.table.actions');
  const router = useRouter();
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const params = useParams();
  const routeVendorId = params?.vendorId;
  const vendorId = Array.isArray(routeVendorId) ? routeVendorId[0] : routeVendorId;
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const page = Number(getParam('page')) || 1;
  const rows = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const { items, requestSort, sortConfig } =
    useSortableData<VendorRatingReviewStore>(rows);

  const tableColumns: Array<{
    label: string;
    sortKey: keyof VendorRatingReviewStore;
  }> = [
    { label: tColumns('storeId'), sortKey: 'store_id' },
    { label: tColumns('storeName'), sortKey: 'store_name' },
    { label: tColumns('averageRating'), sortKey: 'average_rating' },
    { label: tColumns('totalReviews'), sortKey: 'total_reviews' },
    { label: tColumns('creationDate'), sortKey: 'created_at' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {t('title')}
          </h3>

          <div className="flex flex-wrap justify-between gap-4 mb-4">
            <div>
              <Filters />
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHeaderCell
                    key={column.sortKey}
                    label={column.label}
                    sortKey={column.sortKey}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                  />
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={5} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <DisplayError
                      title={tErrors('fetchFailedTitle')}
                      message={errorMessage}
                      variant="error"
                    />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <NoDataFound
                      title={tNoData('title')}
                      subtitle={tNoData('subtitle')}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow
                    key={row.store_id}
                    className="!h-[60px] cursor-pointer"
                      onClick={() => {
                        if (!vendorId) return;
                        router.push(
                          `/vendor/deliveries/${vendorId}/rating-reviews/${row.store_id}?store_name=${encodeURIComponent(row.store_name)}`,
                        );
                      }}
                    >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="max-w-[130px] truncate" title={row.store_id}>
                          {row.store_id}
                        </span>
                        <button
                          type="button"
                          onClick={async (event) => {
                            event.stopPropagation();
                            await navigator.clipboard.writeText(row.store_id);
                            setCopiedStoreId(row.store_id);
                            setTimeout(() => {
                              setCopiedStoreId((prev) =>
                                prev === row.store_id ? null : prev,
                              );
                            }, 1500);
                          }}
                          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          title={tActions('copyStoreId')}
                          aria-label={tActions('copyStoreIdWithValue', {
                            storeId: row.store_id,
                          })}
                        >
                          {copiedStoreId === row.store_id ? (
                            <Check className="h-4 w-4 text-green-600 animate-in zoom-in-75 duration-200" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            row.store_image || '/images/enatega-deliveries/profile.jpg'
                          }
                          width={32}
                          height={32}
                          alt={row.store_name}
                          className="h-8 w-8 rounded-full object-cover"
                          unoptimized
                        />
                        <span>{row.store_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AverageRatingDisplay
                        rating={row.average_rating}
                        showLabel={false}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>{row.total_reviews}</TableCell>
                    <TableCell>
                      {moment(row.created_at).format('DD MMM YYYY, hh:mm A')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && !isError && items.length > 0 && totalPages > 0 && (
            <div className="p-3 bg-accent/30 border-t rounded-b-md">
              <AppPagination
                page={page}
                totalPages={totalPages}
                totalData={data?.total || 0}
                defaultLimit={limit as TLimitType}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingAndReviewsTable;
