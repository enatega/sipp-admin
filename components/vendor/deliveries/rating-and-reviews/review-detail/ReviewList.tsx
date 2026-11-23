'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  ApiErrorResponse,
  ManageStoreReviewAction,
  VendorStoreReviewItem,
} from '@/types';
import { handleApiError } from '@/lib/toast-error';
import { useManageStoreReview } from '@/hooks/api/vendor/deliveries/rating-and-reviews';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { Skeleton } from '@/components/ui/skeleton';
import { TLimitType } from '@/components/shared/TableShimmer';
import ReviewItem from './ReviewItem';

interface ReviewListProps {
  storeId: string;
  reviews: VendorStoreReviewItem[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  page: number;
  totalPages: number;
  totalData: number;
  limit: number;
}

type PendingAction = {
  reviewId: string;
  action: ManageStoreReviewAction;
} | null;

const ReviewList = ({
  storeId,
  reviews,
  isLoading,
  isError,
  errorMessage,
  page,
  totalPages,
  totalData,
  limit,
}: ReviewListProps) => {
  const tHideDialog = useTranslations(
    'vendorRatingReviews.detail.list.hideDialog',
  );
  const tDeleteDialog = useTranslations(
    'vendorRatingReviews.detail.list.deleteDialog',
  );
  const tToast = useTranslations('vendorRatingReviews.detail.list.toast');
  const tErrors = useTranslations('vendorRatingReviews.detail.list.errors');
  const tNoData = useTranslations('vendorRatingReviews.detail.list.noData');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const { mutateAsync: manageReview, isPending: isManaging } = useManageStoreReview();

  const dialogMeta = useMemo(() => {
    if (!pendingAction) return null;
    if (pendingAction.action === 'hide') {
      return {
        title: tHideDialog('title'),
        subTitle: tHideDialog('subTitle'),
        description: tHideDialog('description'),
        variant: 'primary' as const,
        confirmLabel: tHideDialog('confirm'),
      };
    }

    return {
      title: tDeleteDialog('title'),
      subTitle: tDeleteDialog('subTitle'),
      description: tDeleteDialog('description'),
      variant: 'delete' as const,
      confirmLabel: tDeleteDialog('confirm'),
    };
  }, [pendingAction, tDeleteDialog, tHideDialog]);

  const onConfirmAction = async () => {
    if (!pendingAction || !storeId) return;

    try {
      const result = await manageReview({
        store_id: storeId,
        review_id: pendingAction.reviewId,
        action: pendingAction.action,
      });
      toast.success(result.message || tToast('updateSuccess'));
      setPendingAction(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-white px-4 sm:px-6">
        {isLoading ? (
          <div className="space-y-5 py-5">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="space-y-3 border-b last:border-0 pb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6">
            <DisplayError
              title={tErrors('fetchFailedTitle')}
              message={errorMessage}
              variant="error"
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-6">
            <NoDataFound
              title={tNoData('title')}
              subtitle={tNoData('subtitle')}
            />
          </div>
        ) : (
          reviews.map((item, index) => (
            <ReviewItem
              key={item.review_id}
              item={item}
              isLast={index === reviews.length - 1}
              onAction={(reviewId, action) => {
                setPendingAction({ reviewId, action });
              }}
              disabled={isManaging}
            />
          ))
        )}
        {!isLoading && !isError && reviews.length > 0 && totalPages > 0 && (
          <div className="border-t -mx-4 sm:-mx-6 mt-2 px-4 sm:px-6 py-3 bg-accent/30 rounded-b-lg">
            <AppPagination
              page={page}
              totalPages={totalPages}
              totalData={totalData}
              defaultLimit={limit as TLimitType}
            />
          </div>
        )}
      </div>

      {pendingAction && dialogMeta && (
        <AppAlertDialog
          open={Boolean(pendingAction)}
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
          title={dialogMeta.title}
          subTitle={dialogMeta.subTitle}
          description={dialogMeta.description}
          variant={dialogMeta.variant}
          confirmLabel={dialogMeta.confirmLabel}
          onConfirm={onConfirmAction}
          loading={isManaging}
        />
      )}
    </>
  );
};

export default ReviewList;
