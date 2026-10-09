'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse, SubscriptionPlanFeature } from '@/types';
import { handleApiError } from '@/lib/toast-error';
import {
  useCreateSubscriptionFeature,
  useDeleteSubscriptionFeature,
  useGetSubscriptionPlanFeatures,
  useUpdateSubscriptionFeature,
} from '@/hooks/api/super-admin/enatega-deliveries/subscription-plans';
import { AppButton } from '@/components/shared/AppButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Mirrors SubscriptionFeatureType on the API.
const FEATURE_TYPES = ['promotions', 'support', 'analytics', 'ranking', 'store'] as const;

const SELECT_CLASS =
  'h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs';

interface ManageFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Lets admins define the features subscription plans can list (BUG-025). */
export function ManageFeaturesDialog({ open, onOpenChange }: ManageFeaturesDialogProps) {
  const t = useTranslations('enategaDeliveriesPages.subscriptionPlans.featuresManager');
  const { data, isLoading } = useGetSubscriptionPlanFeatures({ enabled: open });
  const createFeature = useCreateSubscriptionFeature();
  const updateFeature = useUpdateSubscriptionFeature();
  const deleteFeature = useDeleteSubscriptionFeature();

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>(FEATURE_TYPES[0]);
  const [editing, setEditing] = useState<{ id: string; title: string; type: string } | null>(null);
  const features: SubscriptionPlanFeature[] = data?.title ?? [];
  const isBusy = createFeature.isPending || updateFeature.isPending || deleteFeature.isPending;

  const typeLabel = (type: string) =>
    (FEATURE_TYPES as readonly string[]).includes(type) ? t(`types.${type}`) : type;

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;
    try {
      await createFeature.mutateAsync({ title, type: newType });
      toast.success(t('created'));
      setNewTitle('');
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  }

  async function handleSave() {
    if (!editing?.title.trim()) return;
    try {
      await updateFeature.mutateAsync({
        id: editing.id,
        title: editing.title.trim(),
        type: editing.type,
      });
      toast.success(t('updated'));
      setEditing(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFeature.mutateAsync(id);
      toast.success(t('deleted'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-end gap-2 border-b pb-4">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
            {t('titleLabel')}
            <Input
              value={newTitle}
              maxLength={255}
              placeholder={t('titlePlaceholder')}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleAdd();
              }}
              disabled={isBusy}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t('typeLabel')}
            <select
              className={SELECT_CLASS}
              value={newType}
              onChange={(event) => setNewType(event.target.value)}
              disabled={isBusy}
            >
              {FEATURE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {typeLabel(type)}
                </option>
              ))}
            </select>
          </label>
          <AppButton
            type="button"
            onClick={() => void handleAdd()}
            disabled={isBusy || !newTitle.trim()}
            isLoading={createFeature.isPending}
          >
            {t('add')}
          </AppButton>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-mute">{t('loading')}</p>
          ) : features.length === 0 ? (
            <p className="text-sm text-mute">{t('empty')}</p>
          ) : (
            features.map((feature) =>
              editing?.id === feature.id ? (
                <div key={feature.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
                  <Input
                    className="min-w-40 flex-1"
                    value={editing.title}
                    maxLength={255}
                    aria-label={t('titleLabel')}
                    onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                    disabled={isBusy}
                  />
                  <select
                    className={SELECT_CLASS}
                    value={editing.type}
                    aria-label={t('typeLabel')}
                    onChange={(event) => setEditing({ ...editing, type: event.target.value })}
                    disabled={isBusy}
                  >
                    {FEATURE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {typeLabel(type)}
                      </option>
                    ))}
                  </select>
                  <button type="button" aria-label={t('save')} className="rounded-md p-2 hover:bg-light" onClick={() => void handleSave()} disabled={isBusy}>
                    <Check className="size-4" />
                  </button>
                  <button type="button" aria-label={t('cancel')} className="rounded-md p-2 hover:bg-light" onClick={() => setEditing(null)} disabled={isBusy}>
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div key={feature.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{feature.title}</span>
                  <span className="rounded-full border px-2 py-0.5 text-xs text-mute">{typeLabel(String(feature.type))}</span>
                  <button
                    type="button"
                    aria-label={t('edit')}
                    className="rounded-md p-2 hover:bg-light"
                    onClick={() => setEditing({ id: feature.id, title: feature.title, type: String(feature.type) })}
                    disabled={isBusy}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={t('delete')}
                    className="rounded-md p-2 text-help-red hover:bg-red-100"
                    onClick={() => void handleDelete(feature.id)}
                    disabled={isBusy}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ),
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
