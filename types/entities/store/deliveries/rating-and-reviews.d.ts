export interface StoreRatingReviewStore {
  store_id: string;
  store_name: string;
  store_image: string | null;
  average_rating: number;
  total_reviews: number;
  created_at?: string;
}

export interface StoreRatingStarDistribution {
  one_star: number;
  two_star: number;
  three_star: number;
  four_star: number;
  five_star: number;
}

export interface StoreReviewUser {
  name: string;
  email: string;
  image: string | null;
}

export interface StoreReviewItem {
  review_id: string;
  user: StoreReviewUser;
  rating: number;
  comment: string;
  order_id: string | null;
  review_date: string;
  is_hidden: boolean;
  [key: string]: unknown;
}

export interface StoreRatingReviewsResponse {
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

export type StoreRatingReviews = StoreReviewItem[];
