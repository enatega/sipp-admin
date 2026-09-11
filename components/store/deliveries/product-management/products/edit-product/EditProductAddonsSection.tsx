'use client';

import type { ProductCustomizationGroup } from '@/types';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { CustomizationRowActions } from './CustomizationRowActions';

interface EditProductAddonsSectionProps {
  addOns: ProductCustomizationGroup[];
  disabled?: boolean;
  addButtonLabel: string;
  editLabel: string;
  deleteLabel: string;
  onCreate: () => void;
  onEdit: (group: ProductCustomizationGroup) => void;
  onDelete: (group: ProductCustomizationGroup) => void;
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
}: EditProductAddonsSectionProps) {
  const tForm = useTranslations('products.form');
  const tDetailFields = useTranslations('products.detail.fields');
  const tDetailMessages = useTranslations('products.detail.messages');
  const tDetailValues = useTranslations('products.detail.values');

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tForm('addonsLabel')}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{addOns.length}</span>
          <AppButton
            type="button"
            variant="secondary"
            onClick={onCreate}
            leftIcon={<Plus className="size-4" />}
            disabled={disabled}
          >
            {addButtonLabel}
          </AppButton>
        </div>
      </div>

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
                />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  {tForm('nameLabel')}
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
