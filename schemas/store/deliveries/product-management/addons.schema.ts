import * as Yup from 'yup';

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

const emptyToUndefined = (value: unknown, original: unknown) =>
  original === '' || original === null ? undefined : value;

// Limits only apply to multi-select groups; single-select never sends them.
const isMulti = (parent: { selectionType?: string }) =>
  parent.selectionType === 'multi';

const optionCount = (parent: { optionIds?: string[] }) =>
  parent.optionIds?.length ?? 0;

// Shared by every add-on form (addons page, product-edit dialogs, vendor
// drawer) so they all validate selection limits the same way.
export const selectionLimitRules = (t: TranslationFn) => ({
  // Multi-select limits; blank means no limit (sent as 0).
  minSelect: Yup.number()
    .transform(emptyToUndefined)
    .typeError(t('validation.minSelectNumber'))
    .integer(t('validation.minSelectNumber'))
    .min(0, t('validation.minSelectMin'))
    .optional()
    .test(
      'min-zero-when-optional',
      t('validation.minSelectNotRequired'),
      function (minSelect) {
        if (!isMulti(this.parent) || this.parent.requiredCheck) return true;
        return !minSelect;
      },
    )
    .test('min-within-options', function (minSelect) {
      const count = optionCount(this.parent);
      if (!isMulti(this.parent) || !minSelect || count === 0) return true;
      return minSelect <= count
        ? true
        : this.createError({
            message: t('validation.minSelectAboveOptions', { count }),
          });
    }),
  maxSelect: Yup.number()
    .transform(emptyToUndefined)
    .typeError(t('validation.maxSelectNumber'))
    .integer(t('validation.maxSelectNumber'))
    .min(0, t('validation.maxSelectMin'))
    .optional()
    .test(
      'max-not-below-min',
      t('validation.maxSelectLessThanMin'),
      function (maxSelect) {
        const minSelect = Number(this.parent.minSelect || 0);
        if (!isMulti(this.parent) || minSelect === 0) return true;
        // The API treats 0 as "no max" but still rejects min > max.
        return maxSelect !== undefined && maxSelect >= minSelect;
      },
    )
    .test('max-within-options', function (maxSelect) {
      const count = optionCount(this.parent);
      if (!isMulti(this.parent) || !maxSelect || count === 0) return true;
      return maxSelect <= count
        ? true
        : this.createError({
            message: t('validation.maxSelectAboveOptions', { count }),
          });
    }),
});

export const addonFormValidationSchema = (t: TranslationFn) =>
  Yup.object().shape({
    name: Yup.string().trim().required(t('validation.nameRequired')),
    description: Yup.string().optional(),
    requiredCheck: Yup.boolean().required(
      t('validation.requiredCheckRequired'),
    ),
    selectionType: Yup.string()
      .oneOf(['single', 'multi'], t('validation.selectionTypeInvalid'))
      .required(t('validation.selectionTypeRequired')),
    optionIds: Yup.array()
      .of(Yup.string().required())
      .min(1, t('validation.optionIdsRequired'))
      .required(t('validation.optionIdsRequired')),
    ...selectionLimitRules(t),
  });
