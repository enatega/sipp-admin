'use client';

import * as React from 'react';
import { localeNames, locales, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { setUserLocale } from '@/lib/locale';
import { useActiveDeliveryLanguages } from '@/hooks/api/deliveries/languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

export function LanguageSelector() {
  const currentLocale = useLocale();
  const [isPending, startTransition] = React.useTransition();
  const { data: configuredLanguages } = useActiveDeliveryLanguages();
  const activeLocales = React.useMemo(() => {
    if (!configuredLanguages) {
      return currentLocale === 'en'
        ? (['en'] as Locale[])
        : (['en', currentLocale] as Locale[]);
    }

    return locales.filter(
      (locale) =>
        locale === 'en' ||
        configuredLanguages?.some((language) => language.code === locale),
    );
  }, [configuredLanguages, currentLocale]);

  React.useEffect(() => {
    if (
      configuredLanguages &&
      !activeLocales.includes(currentLocale as Locale)
    ) {
      startTransition(async () => {
        await setUserLocale('en');
        window.location.reload();
      });
    }
  }, [activeLocales, configuredLanguages, currentLocale]);

  const handleChange = (newLocale: string) => {
    startTransition(async () => {
      await setUserLocale(newLocale as Locale);
      // Force page refresh to apply the new locale
      window.location.reload();
    });
  };

  return (
    <Select
      value={currentLocale}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={`h-9 w-fit border-none shadow-none focus-visible:ring-0 ring-0 justify-between rounded-md px-3 [&>svg]:opacity-100 [&>svg]:text-black`}
        aria-label="Language"
      >
        <span className="font-medium">
          {localeNames[currentLocale as Locale]}
        </span>
      </SelectTrigger>

      <SelectContent align="end" className="min-w-[200px]">
        {activeLocales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
