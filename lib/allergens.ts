import * as Yup from 'yup';
import { nutritionText } from '@/lib/nutrition-facts';

/** Must match ALLERGEN_KEYS in sipp-server's allergens.helper.ts. */
export const ALLERGEN_KEYS = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soy',
  'milk',
  'tree_nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
] as const;

export type AllergenKey = (typeof ALLERGEN_KEYS)[number];

/** Form row: `allergen` is '' until the admin picks one. */
export interface VariationAllergen {
  allergen: AllergenKey | '';
  note: string;
  noteTranslations?: Record<string, string>;
}

export const ALLERGEN_NOTE_MAX_LENGTH = 120;

/** Rows with neither an allergen nor a note are not sent. */
export const cleanAllergens = (
  allergens?: ReadonlyArray<Partial<{ allergen: unknown; note: unknown; noteTranslations: unknown }> | null | undefined> | null,
): VariationAllergen[] =>
  (Array.isArray(allergens) ? allergens : [])
    .map((row) => {
      const cleaned: VariationAllergen = {
        allergen: nutritionText(row?.allergen).toLowerCase() as VariationAllergen['allergen'],
        note: nutritionText(row?.note),
      };
      const translations = row?.noteTranslations;
      if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
        const entries = Object.entries(translations)
          .filter(([, value]) => typeof value === 'string' && value.trim())
          .map(([code, value]) => [code, (value as string).trim()]);
        if (entries.length) cleaned.noteTranslations = Object.fromEntries(entries);
      }
      return cleaned;
    })
    .filter((row) => row.allergen || row.note);

type Translate = (key: string, values?: Record<string, string | number>) => string;

export const allergensSchema = (t: Translate) =>
  Yup.array()
    .of(
      Yup.object({
        allergen: Yup.string()
          .oneOf([...ALLERGEN_KEYS, ''], t('allergens.errors.allergenRequired'))
          .test('allergen-with-note', t('allergens.errors.allergenRequired'), function check(allergen) {
            return Boolean(nutritionText(allergen)) || !nutritionText(this.parent?.note);
          }),
        note: Yup.string()
          .trim()
          .max(ALLERGEN_NOTE_MAX_LENGTH, t('allergens.errors.noteTooLong', { max: ALLERGEN_NOTE_MAX_LENGTH })),
      }),
    )
    .test('unique-allergens', t('allergens.errors.duplicate'), (rows) => {
      const keys = cleanAllergens(rows).map((row) => row.allergen).filter(Boolean);
      return new Set(keys).size === keys.length;
    })
    .optional();
