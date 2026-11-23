'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AverageRatingDisplay } from '@/components/shared/AverageRatingDisplay';

export type RatingBreakdownItem = {
  rating: number;
  percent: number;
};

interface RatingCardProps {
  totalReviews: number | string;
  averageRating: number;
  ratingBreakdown: RatingBreakdownItem[];
}

const RatingCard = ({
  totalReviews,
  averageRating,
  ratingBreakdown,
}: RatingCardProps) => {
  const t = useTranslations('vendorRatingReviews.card');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-lg border bg-white shadow-sm p-4 sm:p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t('totalReviews')}</p>
          <p className="mt-1 text-2xl font-semibold">{totalReviews}</p>
        </div>
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <Star className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm p-4 sm:p-6 flex items-center justify-between gap-4">
        <AverageRatingDisplay rating={averageRating} />
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <Star className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm p-4 sm:p-6 space-y-2">
        {ratingBreakdown.map((item) => (
          <div key={item.rating} className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-10">
              <Star className="h-3.5 w-3.5 text-orange-500 fill-current" />
              <span className="text-sm">{item.rating}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingCard;
