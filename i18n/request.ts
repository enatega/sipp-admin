import { cookies } from 'next/headers';
import { defaultLocale, isLocale } from '@/i18n/config';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Get locale from cookies, default to 'en'
  const cookieStore = await cookies();
  const candidate = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isLocale(candidate) ? candidate : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
