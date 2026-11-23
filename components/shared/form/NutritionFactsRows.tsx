'use client';

import type { ReactNode } from 'react';
import { ErrorMessage, FieldArray, getIn, useFormikContext } from 'formik';
import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  NUTRITION_FACT_MAX_LENGTH,
  NUTRITION_FACTS_MAX_ENTRIES,
  nutritionText,
  type NutritionFact,
} from '@/lib/nutrition-facts';

// Quick-add labels; admins can still type any label they need.
const SUGGESTED_LABELS = ['calories', 'protein', 'carbohydrates', 'fat', 'sugar', 'fiber', 'sodium'] as const;

interface NutritionFactsRowsProps {
  /** Formik path of the `NutritionFact[]` value, e.g. `variations.0.nutritionFacts`. */
  name: string;
  disabled?: boolean;
  /** Extra fields under each row, e.g. its translations; gets the row's Formik path. */
  renderFactExtras?: (factPath: string) => ReactNode;
}

/** Key/value rows for a variation's nutrition facts; shown inside NutritionAllergensField. */
export function NutritionFactsRows({ name, disabled, renderFactExtras }: NutritionFactsRowsProps) {
  const t = useTranslations('products.addProduct.step2.nutrition');
  const { values, errors } = useFormikContext<Record<string, unknown>>();
  const rawFacts: unknown = getIn(values, name);
  const facts: Partial<NutritionFact>[] = Array.isArray(rawFacts) ? rawFacts : [];
  const listError = getIn(errors, name);
  const usedLabels = new Set(facts.map((fact) => nutritionText(fact?.label).toLowerCase()));
  const isFull = facts.length >= NUTRITION_FACTS_MAX_ENTRIES;

  return (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <div className="space-y-3">
          {facts.length ? (
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_1fr_2.25rem] gap-2 px-1 text-xs font-medium text-gray-500 sm:grid">
                <span>{t('labelHeader')}</span>
                <span>{t('valueHeader')}</span>
              </div>
              {facts.map((fact, index) => {
                const labelPath = `${name}.${index}.label`;
                const valuePath = `${name}.${index}.value`;
                return (
                  <div key={index} className="space-y-1">
                    <div className="grid grid-cols-[1fr_1fr_2.25rem] gap-2">
                      <NutritionInput path={labelPath} placeholder={t('labelPlaceholder')} ariaLabel={t('labelAria', { index: index + 1 })} disabled={disabled} />
                      <NutritionInput path={valuePath} placeholder={t('valuePlaceholder')} ariaLabel={t('valueAria', { index: index + 1 })} disabled={disabled} />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={disabled}
                        aria-label={t('remove', { label: nutritionText(fact?.label) || index + 1 })}
                        className="grid size-9 place-items-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <ErrorMessage name={labelPath} render={(message) => <p className="text-xs text-red-600">{message}</p>} />
                    <ErrorMessage name={valuePath} render={(message) => <p className="text-xs text-red-600">{message}</p>} />
                    {renderFactExtras?.(`${name}.${index}`)}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">{t('empty')}</p>
          )}

          {typeof listError === 'string' ? <p className="text-xs text-red-600">{listError}</p> : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => push({ label: '', value: '' })}
              disabled={disabled || isFull}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/40 px-3 text-xs font-medium text-ink transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              {t('add')}
            </button>
            {SUGGESTED_LABELS.map((key) => {
              const label = t(`suggestions.${key}`);
              if (usedLabels.has(label.toLowerCase())) return null;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => push({ label, value: '' })}
                  disabled={disabled || isFull}
                  className="inline-flex h-8 items-center rounded-full bg-white px-3 text-xs text-gray-600 ring-1 ring-gray-200 transition-colors hover:text-ink hover:ring-ink/40 disabled:opacity-50"
                >
                  + {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </FieldArray>
  );
}

function NutritionInput({ path, placeholder, ariaLabel, disabled }: { path: string; placeholder: string; ariaLabel: string; disabled?: boolean }) {
  const { values, errors, touched, handleChange, handleBlur } = useFormikContext<Record<string, unknown>>();
  const hasError = Boolean(getIn(errors, path) && getIn(touched, path));
  return (
    <Input
      name={path}
      value={getIn(values, path) ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={NUTRITION_FACT_MAX_LENGTH}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={hasError}
      disabled={disabled}
      className="h-9 bg-white"
    />
  );
}
