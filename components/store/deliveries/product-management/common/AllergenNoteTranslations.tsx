'use client';

import { getIn, useFormikContext } from 'formik';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { ALLERGEN_NOTE_MAX_LENGTH } from '@/lib/allergens';
import { useAutoTextTranslation } from './useAutoTextTranslation';

interface Props {
  rowPath: string;
  disabled?: boolean;
}

export function AllergenNoteTranslations({ rowPath, disabled }: Props) {
  const t = useTranslations('catalogTranslations');
  const { values, handleChange, handleBlur } = useFormikContext<Record<string, unknown>>();
  const translation = useAutoTextTranslation({
    sourceName: `${rowPath}.note`,
    translationsName: `${rowPath}.noteTranslations`,
    maxLength: ALLERGEN_NOTE_MAX_LENGTH,
  });

  if (translation.isLoadingLanguages || !translation.targetLanguages.length || !translation.text) return null;

  return (
    <div className="space-y-1.5 border-l-2 border-primary/20 pl-3" aria-busy={translation.isPending}>
      {translation.targetLanguages.map((language, index) => {
        const path = `${rowPath}.noteTranslations.${language.code}`;
        return (
          <div key={language.code} className="space-y-1">
            <label htmlFor={path} className="text-[11px] font-medium text-gray-500">{language.name}</label>
            <div className="flex gap-2">
              <Input
                id={path}
                name={path}
                value={getIn(values, path) ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={ALLERGEN_NOTE_MAX_LENGTH}
                placeholder={translation.text}
                disabled={disabled}
                className="h-9 bg-white"
              />
              {index === 0 ? (
                <button
                  type="button"
                  onClick={() => void translation.translate(true)}
                  disabled={disabled || translation.isPending}
                  aria-label={translation.isPending ? t('translating') : t('refresh')}
                  title={translation.isPending ? t('translating') : t('refresh')}
                  className="grid size-9 shrink-0 place-items-center rounded-md text-gray-400 transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                >
                  <RefreshCw aria-hidden="true" className={translation.isPending ? 'size-4 animate-spin' : 'size-4'} />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
      {translation.isError ? <p className="text-xs text-destructive" role="alert">{t('error')}</p> : null}
    </div>
  );
}
