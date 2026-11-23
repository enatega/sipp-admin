'use client';

import { ApiErrorResponse } from '@/types';
import { Star } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetUserReviews } from '@/hooks/api/super-admin/general/users';
import { useSortableData } from '@/hooks/use-sortable-data';
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
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';

interface ReviewsReceivedProps {
  userId: string;
}

export function ReviewsReceived({ userId }: ReviewsReceivedProps) {
  const t = useTranslations('userDetail.reviews');
  const { data, isLoading, isError, error } = useGetUserReviews(userId);

  const {
    items: sortedReviews,
    requestSort,
    sortConfig,
  } = useSortableData(data?.received || []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= Math.floor(rating)
                ? 'fill-orange-400 text-orange-400'
                : 'fill-none text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className=" rounded-md border bg-white">
      <div className="">
        <Table>
          <TableHeader className="bg-light">
            <TableRow>
              <TableHeaderCell
                label={t('from')}
                sortKey="reviewed.name"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('ratings')}
                sortKey="rating"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('comments')}</TableHead>
              <TableHeaderCell
                label={t('date')}
                sortKey="createdAt"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10 as TLimitType} columns={4} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="p-4">
                  <DisplayError
                    title={t('fetchFailed')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('../errors.tryAgain')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : sortedReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-4">
                  <NoDataFound
                    title={t('noReviewsTitle')}
                    subtitle={t('noReviewsReceivedSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              sortedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {review?.reviewer?.name || t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {review.rating}
                      {renderStars(review.rating)}
                    </div>
                  </TableCell>
                  <TableCell>{review.description}</TableCell>
                  <TableCell className="text-mute">
                    {moment(review.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-3 bg-accent/30 border-t">
        {!isError && !isLoading && sortedReviews.length > 0 && (
          <AppPagination
            page={data?.page || 1}
            totalPages={Math.ceil(
              (data?.receivedCount || 0) / (data?.limit || 10),
            )}
            totalData={data?.receivedCount || 0}
            defaultLimit={(data?.limit || 10) as TLimitType}
          />
        )}
      </div>
    </div>
  );
}
