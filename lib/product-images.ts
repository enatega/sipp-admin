type ProductImageSource = {
  imageUrl?: string | null;
  images?: Array<string | null | undefined> | null;
  productImages?: Array<string | null | undefined> | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeStringArray = (
  values?: Array<string | null | undefined> | null,
): string[] =>
  Array.isArray(values) ? values.filter(isNonEmptyString) : [];

export const getNormalizedProductImages = (
  source?: ProductImageSource | null,
): string[] => {
  if (!source) {
    return [];
  }

  const preferredImages = normalizeStringArray(source.productImages);
  if (preferredImages.length > 0) {
    return preferredImages;
  }

  const fallbackImages = normalizeStringArray(source.images);
  if (fallbackImages.length > 0) {
    return fallbackImages;
  }

  return isNonEmptyString(source.imageUrl) ? [source.imageUrl] : [];
};

export const getProductCoverImage = (
  source?: ProductImageSource | null,
): string | null => getNormalizedProductImages(source)[0] ?? null;

export const splitProductFormImages = (
  images?: Array<File | string | null | undefined> | null,
) => {
  const gallery = Array.isArray(images) ? images.filter(Boolean) : [];

  return {
    prevImages: gallery.filter(isNonEmptyString),
    newImages: gallery.filter((image): image is File => image instanceof File),
  };
};
