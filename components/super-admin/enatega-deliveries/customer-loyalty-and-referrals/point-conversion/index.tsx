'use client';

import { useMemo, useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { ArrowRight, Coins, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  useGetPointsToBalance,
  useUpdatePointsToBalance,
} from '@/hooks/api/super-admin/enatega-deliveries/point-conversion';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField } from '@/components/shared/form/AppInput';
import { LoyaltyTabType } from '../types';
import EditConversionSheet from './EditConversionSheet';

const PointConversion = () => {
  const t = useTranslations(
    'deliveriesCustomerLoyaltyAndReferrals.pointConversion',
  );
  const { currencyCode } = useCurrency();
  const { getParam } = useQueryParams();
  const activeTab = (getParam('type') || 'customer') as LoyaltyTabType;

  const [points, setPoints] = useState<string>('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch points to balance data from API
  const {
    data: pointsData,
    isLoading,
    isError,
    error,
  } = useGetPointsToBalance(activeTab);
  const updateMutation = useUpdatePointsToBalance(activeTab);

  // Get the first item from the response array (or default values)
  const conversionData = pointsData?.[0];
  const pointsEqualsOne = conversionData?.points_equals_one || 100;

  const calculatedValue = useMemo(() => {
    const numPoints = parseFloat(points) || 0;
    if (numPoints <= 0 || pointsEqualsOne <= 0) return 0;
    return numPoints / pointsEqualsOne;
  }, [points, pointsEqualsOne]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60 mt-2" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Skeleton className="h-16 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10">
          <DisplayError
            title={t('errorLoading')}
            message={returnErrorMessage(error as ApiErrorResponse)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coins className="size-5" />
                {t('title')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('description')}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-2"
              disabled={isLoading}
            >
              <Pencil className="size-4" />
              {t('editButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Current Conversion Rate Display */}
            <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('currentRate')}:
                </span>
                <span className="font-semibold">
                  {pointsEqualsOne} {t('points')}
                </span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span className="font-semibold text-primary">
                {currencyCode} 1.00
              </span>
            </div>

            {/* Conversion Calculator */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t('calculator')}</h4>
              <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                {/* Points Input */}
                <AppInputField
                  label={t('enterPoints')}
                  type="number"
                  placeholder={t('pointsPlaceholder')}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="0"
                  postfix={
                    <span className="text-sm text-muted-foreground">
                      {t('points')}
                    </span>
                  }
                />

                {/* Arrow */}
                <div className="flex items-center justify-center pb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ArrowRight className="size-5 text-primary" />
                  </div>
                </div>

                {/* Calculated Value Display */}
                <div className="flex flex-col items-start gap-1.5">
                  <label className="text-[15px] font-medium">
                    {t('convertedValue')}
                  </label>
                  <div className="h-11 w-full flex items-center px-3 rounded-[12px] border bg-muted/50">
                    <span className="text-lg font-semibold text-primary">
                      {currencyCode} {calculatedValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditConversionSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        pointsEqualsOne={pointsEqualsOne}
        updateMutation={updateMutation}
      />
    </>
  );
};

export default PointConversion;
