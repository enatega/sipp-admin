'use client';

import * as React from 'react';
import { getIn, useFormikContext } from 'formik';

import { useActiveDeliveryLanguages } from '@/hooks/api/deliveries/languages';
import { useTranslateCatalogText } from '@/hooks/api/store/deliveries/product-management/products';

interface UseAutoTextTranslationOptions {
  /** Formik path of the English source text. */
  sourceName: string;
  /** Formik path of the `{ languageCode: text }` map. */
  translationsName: string;
  /** Legacy descriptions can contain markup that must survive translation. */
  textType?: 'plain' | 'html';
  maxLength?: number;
}

/**
 * Fills the enabled languages from the English text automatically. Values the
 * admin typed are kept; only empty or previously auto-filled ones change,
 * unless `translate(true)` is called from the refresh button.
 */
export function useAutoTextTranslation({
  sourceName,
  translationsName,
  textType = 'plain',
  maxLength = 255,
}: UseAutoTextTranslationOptions) {
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
  const { data: languages = [], isLoading: isLoadingLanguages } =
    useActiveDeliveryLanguages();
  const translation = useTranslateCatalogText();
  const lastAutomaticText = React.useRef('');
  const automaticTranslations = React.useRef<Record<string, string>>({});
  const targetLanguages = React.useMemo(
    () => languages.filter((language) => language.code !== 'en'),
    [languages],
  );
  const sourceValue = getIn(values, sourceName);
  const text = typeof sourceValue === 'string' ? sourceValue.trim() : '';
  const storedTranslations = getIn(values, translationsName) as
    | Record<string, string>
    | undefined;
  const currentTranslations = React.useMemo(
    () => storedTranslations || {},
    [storedTranslations],
  );

  const translate = React.useCallback(
    async (overwrite: boolean) => {
      if (!text || translation.isPending) return;

      let response;
      try {
        response = await translation.mutateAsync({ text, textType });
      } catch {
        return;
      }
      const next: Record<string, string> = { ...currentTranslations };

      for (const language of targetLanguages) {
        const translatedValue = response.translations[language.code];
        const currentValue = currentTranslations[language.code]?.trim();
        const wasAutomaticallyGenerated =
          currentValue === automaticTranslations.current[language.code];
        if (
          translatedValue &&
          (overwrite || !currentValue || wasAutomaticallyGenerated)
        ) {
          next[language.code] = translatedValue.slice(0, maxLength);
          automaticTranslations.current[language.code] = next[language.code];
        }
      }

      await setFieldValue(translationsName, next, false);
    },
    [
      currentTranslations,
      maxLength,
      setFieldValue,
      targetLanguages,
      text,
      textType,
      translation,
      translationsName,
    ],
  );

  React.useEffect(() => {
    const needsAutomaticTranslation = targetLanguages.some((language) => {
      const currentValue = currentTranslations[language.code]?.trim();
      return (
        !currentValue ||
        currentValue === automaticTranslations.current[language.code]
      );
    });
    if (
      text.length < 2 ||
      targetLanguages.length === 0 ||
      !needsAutomaticTranslation ||
      lastAutomaticText.current === text
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      lastAutomaticText.current = text;
      void translate(false);
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [currentTranslations, targetLanguages, text, translate]);

  return {
    text,
    targetLanguages,
    isLoadingLanguages,
    isPending: translation.isPending,
    isError: translation.isError,
    translate,
  };
}
