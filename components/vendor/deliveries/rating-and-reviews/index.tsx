'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useVendorRatingReviews } from '@/hooks/api/vendor/deliveries/rating-and-reviews';
import { Heading } from '@/components/shared/Heading';
import { Skeleton } from '@/components/ui/skeleton';
import RatingCard, { RatingBreakdownItem } from './rating-card';
import RatingAndReviewsTable from './table';

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

const RatingAndReviews = () => {
  const t = useTranslations('vendorRatingReviews');
  const { data, isLoading, isError, error } = useVendorRatingReviews();
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
      <Heading title={t('title')} />
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
      <RatingAndReviewsTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default RatingAndReviews;
