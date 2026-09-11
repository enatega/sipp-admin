const VENDOR_DELIVERIES_ROOT = '/vendor/deliveries';

export const getVendorBasePath = (vendorId?: string): string =>
  vendorId ? `${VENDOR_DELIVERIES_ROOT}/${vendorId}` : VENDOR_DELIVERIES_ROOT;

export const getVendorPath = (
  vendorId: string | undefined,
  suffix = '',
): string => {
  const normalizedSuffix = suffix
    ? suffix.startsWith('/')
      ? suffix
      : `/${suffix}`
    : '';

  return `${getVendorBasePath(vendorId)}${normalizedSuffix}`;
};
