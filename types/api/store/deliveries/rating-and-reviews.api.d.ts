import {
  StoreRatingReviewStore,
  StoreRatingStarDistribution,
  StoreReviewItem,
} from '@/types/entities/store/deliveries/rating-and-reviews';

export interface GetStoreSummaryRatingResponse {
  data: StoreRatingReviewStore[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total_reviews: number;
  average_rating: number;
  star_distribution: StoreRatingStarDistribution;
}

export interface GetStoreReviewsByStoreIdResponse {
  data: StoreReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total_reviews: number;
  average_rating: number;
  star_distribution: StoreRatingStarDistribution;
}

export interface GetStoreRatingReviewsByStoreIdParams {
  store_id: string;
  start_date?: string;
  end_date?: string;
  star_ratings?: string;
  page?: number;
  limit?: number;
}

export type StoreManageReviewAction = 'hide' | 'delete';

export interface StoreManageReviewParams {
  store_id: string;
  review_id: string;
  action: StoreManageReviewAction;
}

export interface StoreManageReviewPayload {
  review_id: string;
  action: StoreManageReviewAction;
}

export interface StoreManageReviewResponse {
  message: string;
}
