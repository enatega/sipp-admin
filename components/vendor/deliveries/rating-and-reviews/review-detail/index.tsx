'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useStoreRatingReviewsByStoreId } from '@/hooks/api/vendor/deliveries/rating-and-reviews';
import ReviewHeader from './ReviewHeader';
import RatingCard, { RatingBreakdownItem } from '../rating-card';
import ReviewList from './ReviewList';
import { Skeleton } from '@/components/ui/skeleton';

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

const ReviewDetailsPage = () => {
  const params = useParams();
  const routeStoreId = params?.id;
  const storeId = Array.isArray(routeStoreId) ? routeStoreId[0] : routeStoreId || '';
  const { data, isLoading, isError, error } = useStoreRatingReviewsByStoreId();
  const errorMessage = Array.isArray(error?.message)
    ? error.message.join(', ')
    : error?.message;

  const totalReviews = data?.total_reviews ?? 0;
  const averageRating = data?.average_rating ?? 0;
  const starDistribution = data?.star_distribution;

  const ratingBreakdown: RatingBreakdownItem[] = useMemo(() => {
    const countsByStar: Record<number, number> = {
      5: starDistribution?.five_star ?? 0,
      4: starDistribution?.four_star ?? 0,
      3: starDistribution?.three_star ?? 0,
      2: starDistribution?.two_star ?? 0,
      1: starDistribution?.one_star ?? 0,
    };

    return STAR_LEVELS.map((rating) => ({
      rating,
      percent: totalReviews ? (countsByStar[rating] / totalReviews) * 100 : 0,
    }));
  }, [starDistribution, totalReviews]);

  return (
    <div className="space-y-6">
      <ReviewHeader />
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-lg bg-white shadow-sm p-6 h-[128px] space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <RatingCard
          totalReviews={totalReviews}
          averageRating={averageRating}
          ratingBreakdown={ratingBreakdown}
        />
      )}
      <ReviewList
        storeId={storeId}
        reviews={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        page={data?.page || 1}
        totalPages={data?.totalPages || 0}
        totalData={data?.total || 0}
        limit={data?.limit || 10}
      />
    </div>
  );
};

export default ReviewDetailsPage;
