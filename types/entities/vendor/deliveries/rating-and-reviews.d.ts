export interface VendorRatingReviewStore {
  store_id: string;
  store_name: string;
  store_image: string | null;
  average_rating: number;
  total_reviews: number;
  created_at: string;
}

export interface VendorRatingStarDistribution {
  one_star: number;
  two_star: number;
  three_star: number;
  four_star: number;
  five_star: number;
}

export interface VendorStoreReviewUser {
  name: string;
  email: string;
  image: string | null;
}

export interface VendorStoreReviewItem {
  review_id: string;
  user: VendorStoreReviewUser;
  rating: number;
  comment: string;
  order_id: string | null;
  review_date: string;
  is_hidden: boolean;
}
