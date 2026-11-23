import moment from 'moment';

// A future or unparsable value is bad source data, not a valid login event.
// Do not guess an offset: it could be a timezone error or a bad stored value.
export function formatLastLogin(value: string | null | undefined): string {
  if (!value) return 'N/A';
  const date = moment(value);
  if (!date.isValid()) return 'Invalid login time';
  if (date.valueOf() > Date.now()) return 'Invalid future login time';
  return date.format('DD MMM YYYY, hh:mm A');
}
