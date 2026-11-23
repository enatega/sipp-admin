import {
  VendorRatingReviewStore,
  VendorRatingStarDistribution,
  VendorStoreReviewItem,
} from '@/types/entities/vendor/deliveries/rating-and-reviews';

export interface GetVendorRatingReviewsResponse {
  data: VendorRatingReviewStore[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total_reviews: number;
  average_rating: number;
  star_distribution: VendorRatingStarDistribution;
}

export interface GetVendorRatingReviewsParams {
  vendor_id: string;
  search_store_name?: string;
  start_date?: string;
  end_date?: string;
  star_ratings?: string;
  page?: number;
  limit?: number;
}

export interface GetStoreRatingReviewsResponse {
  data: VendorStoreReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total_reviews: number;
  average_rating: number;
  star_distribution: VendorRatingStarDistribution;
}

export interface GetStoreRatingReviewsParams {
  store_id: string;
  start_date?: string;
  end_date?: string;
  star_ratings?: string;
  page?: number;
  limit?: number;
}

export type ManageStoreReviewAction = 'hide' | 'delete';

export interface ManageStoreReviewParams {
  store_id: string;
  review_id: string;
  action: ManageStoreReviewAction;
}

export interface ManageStoreReviewPayload {
  review_id: string;
  action: ManageStoreReviewAction;
}

export interface ManageStoreReviewResponse {
  message: string;
}
