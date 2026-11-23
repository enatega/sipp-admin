export interface FavouriteFoodShopType {
  id: string;
  name: string;
  image?: string | null;
}

export interface FavouriteFood {
  id: string;
  name: string;
  nameTranslations: Record<string, string>;
  identifier: string;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  shopTypes: FavouriteFoodShopType[];
  createdAt: string;
  updatedAt: string;
}
