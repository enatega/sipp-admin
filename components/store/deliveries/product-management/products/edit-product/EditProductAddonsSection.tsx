'use client';

import type { ReactNode } from 'react';
import type { ProductCustomizationGroup } from '@/types';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { CustomizationRowActions } from './CustomizationRowActions';

interface EditProductAddonsSectionProps {
  addOns: ProductCustomizationGroup[];
  disabled?: boolean;
  addButtonLabel?: string;
  editLabel: string;
  deleteLabel: string;
  /** Omitted when the picker's own "Add new add-on" is the create path. */
  onCreate?: () => void;
  onEdit: (group: ProductCustomizationGroup) => void;
  onDelete: (group: ProductCustomizationGroup) => void;
  detachLabel?: string;
  onDetach?: (group: ProductCustomizationGroup) => void;
  /** Picker for attaching existing add-on groups, same as Add Product. */
  picker?: ReactNode;
}

export function EditProductAddonsSection({
  addOns,
  disabled,
  addButtonLabel,
  editLabel,
  deleteLabel,
  onCreate,
  onEdit,
  onDelete,
  detachLabel,
  onDetach,
  picker,
}: EditProductAddonsSectionProps) {
  const tForm = useTranslations('products.form');
  const tAddonsForm = useTranslations('storeAddons.form');
  const tDetailFields = useTranslations('products.detail.fields');
  const tDetailMessages = useTranslations('products.detail.messages');
  const tDetailValues = useTranslations('products.detail.values');

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tForm('addonsLabel')}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{addOns.length}</span>
          {onCreate && (
            <AppButton
              type="button"
              variant="secondary"
              onClick={onCreate}
              leftIcon={<Plus className="size-4" />}
              disabled={disabled}
            >
              {addButtonLabel}
            </AppButton>
          )}
        </div>
      </div>

      {picker}

      {addOns.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tDetailMessages('noAddOns')}
        </p>
      ) : (
        <div className="space-y-3">
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="relative rounded-xl border bg-light p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="absolute right-3 top-3">
                <CustomizationRowActions
                  disabled={disabled}
                  editLabel={editLabel}
                  deleteLabel={deleteLabel}
                  onEdit={() => onEdit(addOn)}
                  onDelete={() => onDelete(addOn)}
                  detachLabel={detachLabel}
                  onDetach={onDetach ? () => onDetach(addOn) : undefined}
                />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {tAddonsForm('productEditNameLabel')}
                </p>
                <p className="font-medium">{addOn.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {tDetailFields('selectionType')}
                </p>
                <p className="font-medium">{addOn.selectionType}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {tDetailFields('required')}
                </p>
                <p className="font-medium">
                  {addOn.requiredCheck
                    ? tDetailValues('yes')
                    : tDetailValues('no')}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {tDetailFields('options')}
                </p>
                <p className="font-medium">{addOn.options.length}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
