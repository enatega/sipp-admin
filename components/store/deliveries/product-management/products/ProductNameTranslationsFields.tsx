'use client';

import * as React from 'react';
import { useFormikContext } from 'formik';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useActiveDeliveryLanguages } from '@/hooks/api/deliveries/languages';
import { useTranslateProductTitle } from '@/hooks/api/store/deliveries/product-management/products';
import type { CreateProductFormValues } from '@/types';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';

type ProductNameValues = Pick<
  CreateProductFormValues,
  'name' | 'nameTranslations'
>;

export function ProductNameTranslationsFields() {
  const t = useTranslations('products.addProduct.step1.translations');
  const { values, setFieldValue } = useFormikContext<ProductNameValues>();
  const { data: languages = [], isLoading: isLoadingLanguages } =
    useActiveDeliveryLanguages();
  const translation = useTranslateProductTitle();
  const lastAutomaticTitle = React.useRef('');
  const automaticTranslations = React.useRef<Record<string, string>>({});
  const targetLanguages = React.useMemo(
    () => languages.filter((language) => language.code !== 'en'),
    [languages],
  );
  const title = values.name.trim();

  const translate = React.useCallback(
    async (overwrite: boolean) => {
      if (!title || translation.isPending) return;

      let response;
      try {
        response = await translation.mutateAsync(title);
      } catch {
        return;
      }
      const current = values.nameTranslations || {};
      const next: Record<string, string> = { ...current, en: title };

      for (const language of targetLanguages) {
        const translatedValue = response.translations[language.code];
        const currentValue = current[language.code]?.trim();
        const wasAutomaticallyGenerated =
          currentValue === automaticTranslations.current[language.code];
        if (
          translatedValue &&
          (overwrite || !currentValue || wasAutomaticallyGenerated)
        ) {
          next[language.code] = translatedValue;
          automaticTranslations.current[language.code] = translatedValue;
        }
      }

      await setFieldValue('nameTranslations', next, false);
    }, [setFieldValue, targetLanguages, title, translation, values.nameTranslations]);

  React.useEffect(() => {
    const needsAutomaticTranslation = targetLanguages.some(
      (language) => {
        const currentValue = values.nameTranslations?.[language.code]?.trim();
        return (
          !currentValue ||
          currentValue === automaticTranslations.current[language.code]
        );
      },
    );
    if (
      title.length < 2 ||
      targetLanguages.length === 0 ||
      !needsAutomaticTranslation ||
      lastAutomaticTitle.current === title
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      lastAutomaticTitle.current = title;
      void translate(false);
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [targetLanguages, title, translate, values.nameTranslations]);

  if (isLoadingLanguages || targetLanguages.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-stroke bg-white p-4"
      aria-busy={translation.isPending}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('title')}</h3>
          <p className="mt-1 text-sm text-mute">{t('description')}</p>
        </div>
        <AppButton
          type="button"
          variant="mute"
          size="sm"
          disabled={!title || translation.isPending}
          onClick={() => void translate(true)}
        >
          <RefreshCw
            className={translation.isPending ? 'animate-spin' : undefined}
            size={16}
          />
          {translation.isPending ? t('translating') : t('refresh')}
        </AppButton>
      </div>

      {translation.isError ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {t('error')}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {targetLanguages.map((language) => (
          <AppInputField
            key={language.code}
            label={language.name}
            name={`nameTranslations.${language.code}`}
            maxLength={255}
            placeholder={t('placeholder', { language: language.name })}
            helperText={t('editable')}
          />
        ))}
      </div>
    </section>
  );
}
