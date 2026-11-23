const STORE_DELIVERIES_ROOT = '/store/deliveries';
const LEGACY_STORE_SEGMENTS = new Set([
  'coupons',
  'orders',
  'product-management',
  'rating-reviews',
  'subscription-plans',
  'store',
  'wallet',
]);

export const splitPath = (pathname: string | null): string[] =>
  pathname?.split('/').filter(Boolean) ?? [];

export const getStoreBasePath = (storeId?: string): string =>
  storeId ? `${STORE_DELIVERIES_ROOT}/${storeId}` : STORE_DELIVERIES_ROOT;

export const getStorePath = (storeId: string | undefined, suffix = ''): string => {
  const normalizedSuffix = suffix
    ? suffix.startsWith('/')
      ? suffix
      : `/${suffix}`
    : '';

  return `${getStoreBasePath(storeId)}${normalizedSuffix}`;
};

export const withBackToPath = (
  path: string,
  backToPath?: string,
): string => {
  if (!backToPath) {
    return path;
  }

  const params = new URLSearchParams({ backTo: backToPath });
  return `${path}?${params.toString()}`;
};

export const getStoreIdFromPath = (
  pathname: string | null,
): string | undefined => {
  const segments = splitPath(pathname);
  const isStorePath = segments[0] === 'store' && segments[1] === 'deliveries';

  if (!isStorePath) return undefined;

  const candidate = segments[2];
  if (!candidate || LEGACY_STORE_SEGMENTS.has(candidate)) {
    return undefined;
  }

  return candidate;
};

export const getLegacyStoreSuffixFromPath = (
  pathname: string | null,
): string | null => {
  const segments = splitPath(pathname);
  const isStorePath = segments[0] === 'store' && segments[1] === 'deliveries';

  if (!isStorePath) return null;

  const suffixSegments = segments.slice(2);

  if (suffixSegments.length === 0) {
    return '';
  }

  if (!LEGACY_STORE_SEGMENTS.has(suffixSegments[0])) {
    return null;
  }

  return `/${suffixSegments.join('/')}`;
};

export const
  isStoreCouponsBasePath = (basePath: string): boolean => {
    if (basePath === getStorePath(undefined, '/coupons')) {
      return true;
    }

    return /^\/store\/deliveries\/[^/]+\/coupons$/.test(basePath);
  };

export const isStoreOrdersPath = (pathname: string | null): boolean => {
  if (!pathname) return false;

  if (
    pathname === getStorePath(undefined, '/orders') ||
    pathname.startsWith(`${getStorePath(undefined, '/orders')}/`)
  ) {
    return true;
  }

  return /^\/store\/deliveries\/[^/]+\/orders(?:\/.*)?$/.test(pathname);
};
