export const isGoogleMapsRefererNotAllowedError = (
  error: Error | null | undefined,
): boolean => {
  if (!error?.message) return false;
  return error.message.includes('RefererNotAllowedMapError');
};
