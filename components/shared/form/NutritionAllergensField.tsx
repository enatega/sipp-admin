'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { getIn, useFormikContext } from 'formik';
import { ChevronDown, Leaf } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { cleanNutritionFacts } from '@/lib/nutrition-facts';
import { cleanAllergens } from '@/lib/allergens';
import { AllergenRows } from './AllergenRows';
import { NutritionFactsRows } from './NutritionFactsRows';

interface NutritionAllergensFieldProps {
  /** Formik path of the nutrition facts list, e.g. `variations.0.nutritionFacts`. */
  nutritionName: string;
  /** Formik path of the allergens list, e.g. `variations.0.allergens`. */
  allergensName: string;
  disabled?: boolean;
  /** Extra fields under each nutrition fact row, e.g. its translations. */
  renderNutritionFactExtras?: (factPath: string) => ReactNode;
  renderAllergenExtras?: (rowPath: string) => ReactNode;
  /** Replaces the default collapsed-state line, which speaks of a variant. */
  subtitle?: string;
  /** Replaces the default "no allergens yet" line, which speaks of a variant. */
  allergensEmptyText?: string;
}

/**
 * Optional "Nutrition & Allergens" section of a variation form. Each part has
 * its own toggle: switching one off empties that list, so saving clears it.
 * The rows are kept aside until the form unmounts, so switching straight back
 * on restores them.
 */
export function NutritionAllergensField({
  nutritionName,
  allergensName,
  disabled,
  renderNutritionFactExtras,
  renderAllergenExtras,
  subtitle,
  allergensEmptyText,
}: NutritionAllergensFieldProps) {
  const t = useTranslations('products.addProduct.step2.nutritionAllergens');
  const { values } = useFormikContext<Record<string, unknown>>();
  const nutritionCount = cleanNutritionFacts(getIn(values, nutritionName)).length;
  const allergenCount = cleanAllergens(getIn(values, allergensName)).length;
  const [isOpen, setIsOpen] = useState(nutritionCount + allergenCount > 0);
  const panelId = useId();

  const summary = [
    nutritionCount ? t('nutritionCount', { count: nutritionCount }) : null,
    allergenCount ? t('allergenCount', { count: allergenCount }) : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[0.03]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Leaf aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              {t('title')}
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{t('optional')}</span>
            </span>
            <span className="block truncate text-xs text-gray-500">{summary || subtitle || t('subtitle')}</span>
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-gray-500 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Kept mounted while collapsed so the toggles remember their stashed rows. */}
      <div id={panelId} hidden={!isOpen} className="divide-y divide-gray-200 border-t border-primary/15 bg-white px-4">
        <ToggledSection name={nutritionName} label={t('nutritionToggle')} disabled={disabled} emptyRow={{ label: '', value: '' }}>
          <NutritionFactsRows name={nutritionName} disabled={disabled} renderFactExtras={renderNutritionFactExtras} />
        </ToggledSection>
        <ToggledSection name={allergensName} label={t('allergensToggle')} disabled={disabled} emptyRow={{ allergen: '', note: '' }}>
          <AllergenRows name={allergensName} disabled={disabled} renderRowExtras={renderAllergenExtras} emptyText={allergensEmptyText} />
        </ToggledSection>
      </div>
    </div>
  );
}

interface ToggledSectionProps {
  name: string;
  label: string;
  disabled?: boolean;
  emptyRow: Record<string, string>;
  children: React.ReactNode;
}

function ToggledSection({ name, label, disabled, emptyRow, children }: ToggledSectionProps) {
  const switchId = useId();
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
  const rows: unknown = getIn(values, name);
  const hasRows = Array.isArray(rows) && rows.length > 0;
  const [isEnabled, setIsEnabled] = useState(hasRows);
  const stash = useRef<unknown[]>([]);

  const toggle = (next: boolean) => {
    setIsEnabled(next);
    if (next) {
      void setFieldValue(name, stash.current.length ? stash.current : [{ ...emptyRow }]);
      stash.current = [];
    } else {
      stash.current = Array.isArray(rows) ? rows : [];
      void setFieldValue(name, []);
    }
  };

  return (
    <div className="space-y-3 py-4">
      <div className="flex items-center gap-3">
        <Switch id={switchId} checked={isEnabled} onCheckedChange={toggle} disabled={disabled} />
        <label htmlFor={switchId} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
      </div>
      {isEnabled ? children : null}
    </div>
  );
}
