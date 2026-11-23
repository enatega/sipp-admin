'use client';

import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteLoyaltyPointsRange,
  useGetLoyaltyPointsRange,
} from '@/hooks/api/super-admin/enatega-deliveries/loyalty-points-range';
import { useGetPointsToBalance } from '@/hooks/api/super-admin/enatega-deliveries/point-conversion';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { ApiErrorResponse } from '@/types';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerBreakdown, LoyaltyPointsRangeItem } from '../../types';
import { AddCustomerBreakdownSheet } from './AddCustomerBreakdownSheet';
import { CustomerBreakdownTable } from './CustomerBreakdownTable';
import { EditCustomerBreakdownSheet } from './EditCustomerBreakdownSheet';

const CustomerLoyalPointsBreakdown = () => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.loyalPointsBreakdown');

  const { data: apiData, isLoading, isError, error } = useGetLoyaltyPointsRange();
  const { data: pointsData } = useGetPointsToBalance('customer');
  const { mutateAsync: deleteRange, isPending: isDeleting } = useDeleteLoyaltyPointsRange();

  // Get points conversion rate
  const pointsEqualsOne = pointsData?.[0]?.points_equals_one || 100;

  // Map API response to component format with calculated pointsWorth
  const breakdowns = useMemo<CustomerBreakdown[]>(() => {
    if (!apiData?.data) return [];
    return apiData.data.map((item: LoyaltyPointsRangeItem) => ({
      id: item.id,
      rangeFrom: item.from,
      rangeTo: item.to,
      points: item.points,
      pointsWorth: pointsEqualsOne > 0 ? item.points / pointsEqualsOne : 0,
    }));
  }, [apiData, pointsEqualsOne]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerBreakdown | null>(null);
  const [deletingItem, setDeletingItem] = useState<CustomerBreakdown | null>(null);

  const handleAdd = () => {
    setIsAddSheetOpen(true);
  };

  const handleEdit = (item: CustomerBreakdown) => {
    setEditingItem(item);
  };

  const handleDelete = (item: CustomerBreakdown) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteRange(deletingItem.id);
      toast.success(t('toast.deleteSuccess'));
      setDeletingItem(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription className="mt-1">
                {t('description')}
              </CardDescription>
            </div>
            <AppButton
              size="sm"
              onClick={handleAdd}
              leftIcon={<Plus className="size-4" />}
            >
              {t('addButton')}
            </AppButton>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <DisplayError
              title={t('errorLoading')}
              message={returnErrorMessage(error as ApiErrorResponse)}
            />
          ) : (
            <>
              <CustomerBreakdownTable
                data={breakdowns}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              {breakdowns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noData')}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AddCustomerBreakdownSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />

      <EditCustomerBreakdownSheet
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
      />

      <AppAlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        variant="delete"
        title={t('deleteDialog.title')}
        subTitle={t('deleteDialog.subTitle')}
        description={t('deleteDialog.description')}
        confirmLabel={t('deleteDialog.confirmButton')}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
};

export { CustomerLoyalPointsBreakdown };
