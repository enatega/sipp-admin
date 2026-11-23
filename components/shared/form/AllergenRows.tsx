'use client';

import type { ReactNode } from 'react';
import { ErrorMessage, FieldArray, getIn, useFormikContext } from 'formik';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { nutritionText } from '@/lib/nutrition-facts';
import {
  ALLERGEN_KEYS,
  ALLERGEN_NOTE_MAX_LENGTH,
  type VariationAllergen,
} from '@/lib/allergens';

interface AllergenRowsProps {
  /** Formik path of the `VariationAllergen[]` value, e.g. `variations.0.allergens`. */
  name: string;
  disabled?: boolean;
  renderRowExtras?: (rowPath: string) => ReactNode;
  /** Replaces the default "no allergens yet" line. */
  emptyText?: string;
}

/** Allergen picker rows with an optional note; shown inside NutritionAllergensField. */
export function AllergenRows({ name, disabled, renderRowExtras, emptyText }: AllergenRowsProps) {
  const t = useTranslations('products.addProduct.step2.allergens');
  const { values, errors, touched, setFieldValue, setFieldTouched, handleChange, handleBlur } =
    useFormikContext<Record<string, unknown>>();
  const raw: unknown = getIn(values, name);
  const rows: Partial<VariationAllergen>[] = Array.isArray(raw) ? raw : [];
  const chosen = rows.map((row) => nutritionText(row?.allergen));
  const listError = getIn(errors, name);
  const isFull = rows.length >= ALLERGEN_KEYS.length;

  return (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <div className="space-y-3">
          {rows.length ? (
            <div className="space-y-2">
              <div className="hidden grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_2.25rem] gap-2 px-1 text-xs font-medium text-gray-500 sm:grid">
                <span>{t('allergenHeader')}</span>
                <span>{t('noteHeader')}</span>
              </div>
              {rows.map((row, index) => {
                const allergenPath = `${name}.${index}.allergen`;
                const notePath = `${name}.${index}.note`;
                const current = nutritionText(row?.allergen);
                const allergenInvalid = Boolean(getIn(errors, allergenPath) && getIn(touched, allergenPath));
                return (
                  <div key={index} className="space-y-1">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_2.25rem]">
                      <Select
                        value={current || undefined}
                        disabled={disabled}
                        onValueChange={(value) => {
                          void setFieldValue(allergenPath, value);
                          void setFieldTouched(allergenPath, true, false);
                        }}
                      >
                        <SelectTrigger
                          aria-label={t('allergenAria', { index: index + 1 })}
                          aria-invalid={allergenInvalid}
                          className="h-9 w-full bg-white"
                        >
                          <SelectValue placeholder={t('allergenPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {ALLERGEN_KEYS.map((key) => (
                            // Each allergen once per variation; keep this row's own choice selectable.
                            <SelectItem key={key} value={key} disabled={key !== current && chosen.includes(key)}>
                              {t(`names.${key}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 sm:contents">
                        <Input
                          name={notePath}
                          value={typeof row?.note === 'string' ? row.note : ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          maxLength={ALLERGEN_NOTE_MAX_LENGTH}
                          placeholder={t('notePlaceholder')}
                          aria-label={t('noteAria', { index: index + 1 })}
                          disabled={disabled}
                          className="h-9 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={disabled}
                          aria-label={t('remove', { allergen: current ? t(`names.${current}`) : index + 1 })}
                          className="grid size-9 shrink-0 place-items-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </div>
                    {renderRowExtras?.(`${name}.${index}`)}
                    <ErrorMessage name={allergenPath} render={(message) => <p className="text-xs text-red-600">{message}</p>} />
                    <ErrorMessage name={notePath} render={(message) => <p className="text-xs text-red-600">{message}</p>} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">{emptyText ?? t('empty')}</p>
          )}

          {typeof listError === 'string' ? <p className="text-xs text-red-600">{listError}</p> : null}

          <button
            type="button"
            onClick={() => push({ allergen: '', note: '' })}
            disabled={disabled || isFull}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/40 px-3 text-xs font-medium text-ink transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            {t('add')}
          </button>
        </div>
      )}
    </FieldArray>
  );
}
