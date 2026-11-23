export interface Category extends Record<string, unknown> {
  id: string;
  store_id: string;
  categoryName: string;
  nameTranslations?: Record<string, string>;
  imageURL?: string | null;
  parentId?: string | null;
  is_active: boolean;
  scheduleAvailability?: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
  /** Per-day windows; when present they override availableFrom/availableTo. */
  availabilityDays?: CategoryAvailabilityDay[] | null;
  createdAt: string;
  updatedAt?: string;
}

/** day follows JS Date#getDay: 0 = Sunday … 6 = Saturday. Times are store-local HH:MM. */
export interface CategoryAvailabilityDay {
  day: number;
  from: string;
  to: string;
}

export interface CategoryFormData {
  name: string;
  nameTranslations?: Record<string, string>;
  image?: File | string;
  scheduleAvailability: boolean;
  availabilityDays: CategoryAvailabilityDay[];
}
