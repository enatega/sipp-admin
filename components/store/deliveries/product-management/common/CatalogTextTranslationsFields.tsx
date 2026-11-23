'use client';

import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { useAutoTextTranslation } from './useAutoTextTranslation';

export type CatalogTextTranslationKind =
  | 'categoryName'
  | 'subCategoryName'
  | 'productDescription'
  | 'addonName'
  | 'addonDescription'
  | 'optionTitle'
  | 'optionDescription'
  | 'variationName';

interface CatalogTextTranslationsFieldsProps {
  kind: CatalogTextTranslationKind;
  /** Formik path of the English source text. */
  sourceName: string;
  /** Formik path of the `{ languageCode: text }` map. */
  translationsName: string;
  multiline?: boolean;
  /** Legacy descriptions can contain markup that must survive translation. */
  textType?: 'plain' | 'html';
  maxLength?: number;
}

/**
 * Same behaviour as the product-name translations: enabled languages are
 * filled from the English text automatically, every value stays editable,
 * and an empty value falls back to English for customers.
 */
export function CatalogTextTranslationsFields({
  kind,
  sourceName,
  translationsName,
  multiline = false,
  textType = 'plain',
  maxLength = 255,
}: CatalogTextTranslationsFieldsProps) {
  const t = useTranslations('catalogTranslations');
  const { text, targetLanguages, isLoadingLanguages, isPending, isError, translate } =
    useAutoTextTranslation({ sourceName, translationsName, textType, maxLength });
  const titles: Record<CatalogTextTranslationKind, string> = {
    categoryName: t('categoryName'),
    subCategoryName: t('subCategoryName'),
    productDescription: t('productDescription'),
    addonName: t('addonName'),
    addonDescription: t('addonDescription'),
    optionTitle: t('optionTitle'),
    optionDescription: t('optionDescription'),
    variationName: t('variationName'),
  };

  if (isLoadingLanguages || targetLanguages.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-stroke bg-white p-4"
      aria-busy={isPending}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-semibold text-gray-900">
          {titles[kind]}
        </h3>
        <AppButton
          type="button"
          variant="mute"
          size="sm"
          className="h-9 w-9 shrink-0 px-0 py-0"
          aria-label={isPending ? t('translating') : t('refresh')}
          title={isPending ? t('translating') : t('refresh')}
          disabled={!text || isPending}
          onClick={() => void translate(true)}
        >
          <RefreshCw
            aria-hidden="true"
            className={isPending ? 'animate-spin' : undefined}
            size={16}
          />
        </AppButton>
      </div>

      {isError ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {t('error')}
        </p>
      ) : null}

      <div className="mt-3 space-y-3">
        {targetLanguages.map((language) =>
          multiline ? (
            <AppTextarea
              key={language.code}
              label={language.name}
              name={`${translationsName}.${language.code}`}
              maxLength={maxLength}
              rows={3}
              placeholder={t('placeholder', { language: language.name })}
            />
          ) : (
            <AppInputField
              key={language.code}
              label={language.name}
              name={`${translationsName}.${language.code}`}
              maxLength={maxLength}
              placeholder={t('placeholder', { language: language.name })}
            />
          ),
        )}
      </div>
    </section>
  );
}
