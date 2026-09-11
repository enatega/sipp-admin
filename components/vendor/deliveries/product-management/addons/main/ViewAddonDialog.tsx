'use client';

import moment from 'moment';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { Badge } from '@/components/ui/badge';
import { AppDialog } from '@/components/shared/AppDialog';
import type { VendorAddon } from '@/types/api/vendor/deliveries/addons.api';

interface ViewAddonDialogProps {
  open: boolean;
  onClose: () => void;
  addon: VendorAddon | null;
}

export default function ViewAddonDialog({
  open,
  onClose,
  addon,
}: ViewAddonDialogProps) {
  const t = useTranslations('storeAddons');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';

  if (!addon) {
    return null;
  }

  const formattedPrice = Number.isFinite(Number(addon.price))
    ? formatCurrency(Number(addon.price), resolvedCurrencySymbol)
    : '-';
  const description = addon.description?.trim() || '-';
  const details = [
    {
      label: t('view.fields.price'),
      value: formattedPrice,
    },
    {
      label: t('view.fields.minSelect'),
      value: String(addon.minSelect),
    },
    {
      label: t('view.fields.maxSelect'),
      value: String(addon.maxSelect),
    },
    {
      label: t('view.fields.required'),
      value: addon.requiredCheck
        ? t('table.requiredYes')
        : t('table.requiredNo'),
    },
    { label: t('view.fields.selectionType'), value: addon.selectionType },
    { label: t('view.fields.type'), value: addon.type },
    {
      label: t('view.fields.status'),
      value: addon.status ? t('view.active') : t('view.inactive'),
    },
    {
      label: t('view.fields.createdAt'),
      value: moment(addon.createdAt).format('DD MMM YYYY, hh:mm A'),
    },
    {
      label: t('view.fields.updatedAt'),
      value: moment(addon.updatedAt).format('DD MMM YYYY, hh:mm A'),
    },
  ];

  return (
    <AppDialog open={open} onClose={onClose} title={t('view.title')} size="4xl">
      <div className="space-y-6">
        <div className="rounded-2xl border border-stroke bg-gradient-to-br from-primary/5 via-white to-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('view.fields.name')}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">
                  {addon.name}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {addon.type}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {addon.selectionType}
                </Badge>
                <Badge
                  variant={addon.status ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {addon.status ? t('view.active') : t('view.inactive')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stroke bg-white p-5">
          <p className="text-sm font-medium text-muted-foreground">
            {t('view.fields.description')}
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-2xl border border-stroke bg-white p-4"
            >
              <p className="text-sm text-muted-foreground">{detail.label}</p>
              <p className="mt-1 font-medium capitalize">{detail.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stroke bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">
              {t('view.optionsTitle')}
            </h3>
            <Badge variant="secondary">{addon.options.length}</Badge>
          </div>

          {addon.options.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('view.noOptions')}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {addon.options.map((option) => (
                <div
                  key={option.id}
                  className="rounded-xl border border-stroke bg-accent/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{option.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description || '-'}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(Number(option.price), resolvedCurrencySymbol)}
                    </p>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('view.optionFields.stockQuantity')}
                      </p>
                      <p className="text-sm font-medium">
                        {option.stockQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppDialog>
  );
}
