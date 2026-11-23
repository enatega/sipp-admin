'use client';

import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DeliveryFeeSettings } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DeliveryFeeCalculatorSheetProps {
  feeData?: DeliveryFeeSettings;
  disabled?: boolean;
}

type FeeCalculation =
  | {
      mode: 'distance';
      total: number;
      baseFee: number;
      thresholdKm: number;
      extraDistanceKm: number;
      extraCharge: number;
    }
  | {
      mode: 'fixed';
      total: number;
    }
  | {
      mode: 'unavailable';
      total: null;
    };

export function DeliveryFeeCalculatorSheet({
  feeData,
  disabled,
}: DeliveryFeeCalculatorSheetProps) {
  const t = useTranslations('lumiFood.deliveryFee.calculator');
  const locale = useLocale();
  const { formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [distance, setDistance] = useState('');
  const [submittedDistance, setSubmittedDistance] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const calculation = useMemo<FeeCalculation | null>(() => {
    if (submittedDistance === null || !feeData) return null;

    if (feeData.is_distance_delivery_fee_active) {
      const baseFee = Number(feeData.base_distance_fee || 0);
      const thresholdKm = Number(feeData.distance_greater_than || 0);
      const perKmCharge = Number(feeData.per_km_charges || 0);
      const extraDistanceKm = Math.max(submittedDistance - thresholdKm, 0);
      const extraCharge = extraDistanceKm * perKmCharge;

      return {
        mode: 'distance',
        total: baseFee + extraCharge,
        baseFee,
        thresholdKm,
        extraDistanceKm,
        extraCharge,
      };
    }

    if (feeData.is_fixed_delivery_fee_active) {
      return {
        mode: 'fixed',
        total: Number(feeData.fixed_delivery_fee || 0),
      };
    }

    return { mode: 'unavailable', total: null };
  }, [feeData, submittedDistance]);

  const formatDistance = (value: number) =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 3,
    }).format(value);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDistance('');
      setSubmittedDistance(null);
      setError(null);
    }
  };

  const handleCalculate = () => {
    const parsedDistance = Number(distance);
    if (distance.trim() === '' || !Number.isFinite(parsedDistance)) {
      setError(t('invalidDistance'));
      setSubmittedDistance(null);
      return;
    }
    if (parsedDistance < 0) {
      setError(t('negativeDistance'));
      setSubmittedDistance(null);
      return;
    }

    setError(null);
    setSubmittedDistance(parsedDistance);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <AppButton
          type="button"
          variant="secondary"
          leftIcon={<Calculator className="size-4" aria-hidden />}
          disabled={disabled}
        >
          {t('button')}
        </AppButton>
      </SheetTrigger>

      <SheetContent className="h-full w-full overflow-y-auto p-6 sm:max-w-lg">
        <SheetHeader className="p-0 pr-8">
          <SheetTitle className="text-xl">{t('title')}</SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleCalculate();
            }}
          >
            <AppInputField
              label={t('distanceLabel')}
              name="calculator_distance"
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={distance}
              onChange={(event) => {
                setDistance(event.target.value);
                setError(null);
                setSubmittedDistance(null);
              }}
              postfix="km"
              placeholder={t('distancePlaceholder')}
              error={error ?? undefined}
              helperText={t('distanceHelper')}
              requiredAsterisk
            />
            <AppButton type="submit" className="w-full">
              {t('calculateButton')}
            </AppButton>
          </form>

          <div aria-live="polite">
            {calculation?.mode === 'distance' && (
              <section className="rounded-[12px] bg-primary/5 p-5">
                <p className="text-sm text-mute">{t('estimatedFee')}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-black">
                  {formatCurrency(calculation.total)}
                </p>
                <dl className="mt-5 space-y-3 border-t border-primary/15 pt-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-mute">
                      {t('baseFee', {
                        distance: formatDistance(calculation.thresholdKm),
                      })}
                    </dt>
                    <dd className="font-medium tabular-nums text-black">
                      {formatCurrency(calculation.baseFee)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-mute">
                      {t('extraDistance', {
                        distance: formatDistance(
                          calculation.extraDistanceKm,
                        ),
                      })}
                    </dt>
                    <dd className="font-medium tabular-nums text-black">
                      {formatCurrency(calculation.extraCharge)}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            {calculation?.mode === 'fixed' && (
              <section className="rounded-[12px] bg-primary/5 p-5">
                <p className="text-sm text-mute">{t('fixedMode')}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-black">
                  {formatCurrency(calculation.total)}
                </p>
              </section>
            )}

            {calculation?.mode === 'unavailable' && (
              <section className="rounded-[12px] border border-sidebar-border p-5">
                <p className="font-medium text-black">{t('noActiveFee')}</p>
                <p className="mt-1 text-sm text-mute">
                  {t('noActiveFeeDescription')}
                </p>
              </section>
            )}
          </div>

          <p className="text-sm leading-6 text-mute">{t('checkoutNote')}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
