'use client';

import { getIn, useFormikContext } from 'formik';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { NUTRITION_FACT_MAX_LENGTH } from '@/lib/nutrition-facts';
import { useAutoTextTranslation } from './useAutoTextTranslation';

interface NutritionFactTranslationsProps {
  /** Formik path of one nutrition fact, e.g. `variations.0.nutritionFacts.2`. */
  factPath: string;
  disabled?: boolean;
}

/**
 * Translated label and value of one nutrition fact, auto-filled from the
 * English row and editable. An empty value falls back to English for customers.
 */
export function NutritionFactTranslations({ factPath, disabled }: NutritionFactTranslationsProps) {
  const t = useTranslations('catalogTranslations');
  const label = useAutoTextTranslation({
    sourceName: `${factPath}.label`,
    translationsName: `${factPath}.labelTranslations`,
    maxLength: NUTRITION_FACT_MAX_LENGTH,
  });
  const value = useAutoTextTranslation({
    sourceName: `${factPath}.value`,
    translationsName: `${factPath}.valueTranslations`,
    maxLength: NUTRITION_FACT_MAX_LENGTH,
  });
  const isPending = label.isPending || value.isPending;

  if (label.isLoadingLanguages || label.targetLanguages.length === 0) return null;
  if (!label.text && !value.text) return null;

  return (
    <div className="space-y-1.5 border-l-2 border-primary/20 pl-3" aria-busy={isPending}>
      {label.targetLanguages.map((language, index) => (
        <div key={language.code} className="space-y-1">
          <span className="text-[11px] font-medium text-gray-500">{language.name}</span>
          <div className="grid grid-cols-[1fr_1fr_2.25rem] gap-2">
            <TranslationInput
              path={`${factPath}.labelTranslations.${language.code}`}
              placeholder={label.text || t('placeholder', { language: language.name })}
              ariaLabel={`${language.name}: ${label.text}`}
              disabled={disabled}
            />
            <TranslationInput
              path={`${factPath}.valueTranslations.${language.code}`}
              placeholder={value.text || t('placeholder', { language: language.name })}
              ariaLabel={`${language.name}: ${value.text}`}
              disabled={disabled}
            />
            {index === 0 ? (
              <button
                type="button"
                onClick={() => {
                  void label.translate(true);
                  void value.translate(true);
                }}
                disabled={disabled || isPending}
                aria-label={isPending ? t('translating') : t('refresh')}
                title={isPending ? t('translating') : t('refresh')}
                className="grid size-9 place-items-center rounded-md text-gray-400 transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-50"
              >
                <RefreshCw aria-hidden="true" className={isPending ? 'size-4 animate-spin' : 'size-4'} />
              </button>
            ) : null}
          </div>
        </div>
      ))}
      {label.isError || value.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {t('error')}
        </p>
      ) : null}
    </div>
  );
}

function TranslationInput({
  path,
  placeholder,
  ariaLabel,
  disabled,
}: {
  path: string;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
}) {
  const { values, handleChange, handleBlur } = useFormikContext<Record<string, unknown>>();
  return (
    <Input
      name={path}
      value={getIn(values, path) ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={NUTRITION_FACT_MAX_LENGTH}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      className="h-9 bg-white"
    />
  );
}
