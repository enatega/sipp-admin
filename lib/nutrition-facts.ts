import * as Yup from 'yup';

export interface NutritionFact {
  label: string;
  value: string;
  /** Other languages only; English stays in `label` / `value`. */
  labelTranslations?: Record<string, string>;
  valueTranslations?: Record<string, string>;
}

// Mirror the server limits in nutrition-facts.helper.ts.
export const NUTRITION_FACTS_MAX_ENTRIES = 30;
export const NUTRITION_FACT_MAX_LENGTH = 60;

/**
 * Reads a field defensively: rows come from the API, Formik and Yup casting,
 * and any of them may hold a missing or non-string label or value.
 */
export const nutritionText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();

const cleanTranslations = (translations: unknown): Record<string, string> | undefined => {
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) return undefined;
  const entries = Object.entries(translations)
    .map(([code, text]) => [code, nutritionText(text)] as const)
    .filter(([, text]) => text);
  return entries.length ? Object.fromEntries(entries) : undefined;
};

/** Rows the admin left completely blank are not sent. */
export const cleanNutritionFacts = (
  facts?: ReadonlyArray<Partial<NutritionFact> | null | undefined> | null,
): NutritionFact[] =>
  (Array.isArray(facts) ? facts : [])
    .map((fact) => {
      const cleaned: NutritionFact = { label: nutritionText(fact?.label), value: nutritionText(fact?.value) };
      const labelTranslations = cleanTranslations(fact?.labelTranslations);
      const valueTranslations = cleanTranslations(fact?.valueTranslations);
      if (labelTranslations) cleaned.labelTranslations = labelTranslations;
      if (valueTranslations) cleaned.valueTranslations = valueTranslations;
      return cleaned;
    })
    .filter((fact) => fact.label || fact.value);

type Translate = (key: string, values?: Record<string, string | number>) => string;

export const nutritionFactsSchema = (t: Translate) =>
  Yup.array()
    .of(
      Yup.object({
        label: Yup.string()
          .trim()
          .max(NUTRITION_FACT_MAX_LENGTH, t('nutrition.errors.tooLong', { max: NUTRITION_FACT_MAX_LENGTH }))
          .test('label-with-value', t('nutrition.errors.labelRequired'), function check(label) {
            return Boolean(nutritionText(label)) || !nutritionText(this.parent?.value);
          }),
        value: Yup.string()
          .trim()
          .max(NUTRITION_FACT_MAX_LENGTH, t('nutrition.errors.tooLong', { max: NUTRITION_FACT_MAX_LENGTH }))
          .test('value-with-label', t('nutrition.errors.valueRequired'), function check(value) {
            return Boolean(nutritionText(value)) || !nutritionText(this.parent?.label);
          }),
      }),
    )
    .test('max-facts', t('nutrition.errors.tooMany', { max: NUTRITION_FACTS_MAX_ENTRIES }), (facts) =>
      cleanNutritionFacts(facts as Partial<NutritionFact>[] | undefined).length <= NUTRITION_FACTS_MAX_ENTRIES,
    )
    .test('unique-labels', t('nutrition.errors.duplicate'), (facts) => {
      const labels = cleanNutritionFacts(facts as Partial<NutritionFact>[] | undefined).map((fact) => fact.label.toLowerCase());
      return new Set(labels).size === labels.length;
    })
    .optional();
