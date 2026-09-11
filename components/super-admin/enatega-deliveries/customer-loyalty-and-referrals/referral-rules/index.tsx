'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  useGetReferralPoints,
  useUpdateReferralPoints,
} from '@/hooks/api/super-admin/enatega-deliveries/referral-rules';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DisplayError from '@/components/shared/DisplayError';
import { LoyaltyTabType, ReferralPointItem, ReferralRule } from '../types';
import { EditRuleSheet } from './EditRuleSheet';
import { RuleCard } from './RuleCard';

export type { ReferralRule };

const ReferralRules = () => {
  const t = useTranslations(
    'deliveriesCustomerLoyaltyAndReferrals.referralRules',
  );
  const { getParam } = useQueryParams();
  const activeTab = (getParam('type') || 'customer') as LoyaltyTabType;

  // Fetch referral points from API
  const { data, isLoading, isError, error } = useGetReferralPoints(activeTab);
  const updateMutation = useUpdateReferralPoints(activeTab);

  const [editingRule, setEditingRule] = useState<ReferralRule | null>(null);

  // Transform API data to ReferralRule format with translated trigger title
  const rules: ReferralRule[] =
    data?.data?.map((item: ReferralPointItem) => ({
      id: item.id,
      triggerEvent: item.triggerEvent,
      points: item.points,
    })) || [];
  const sectionTitle =
    activeTab === 'customer' ? 'Customer Referral Points' : t('title');
  const sectionDescription =
    activeTab === 'customer'
      ? 'Manage customer referral point adjustments'
      : 'Manage rider referral point adjustments';

  const handleEditRule = (rule: ReferralRule) => {
    setEditingRule(rule);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60 mt-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="w-[220px] h-[100px] rounded-lg" />
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
              <CardTitle>{sectionTitle}</CardTitle>
              <CardDescription className="mt-1">
                {sectionDescription}
              </CardDescription>
            </div>
            {/* Create button commented out for now */}
            {/* <AppButton
              size="sm"
              onClick={handleCreateRule}
              leftIcon={<Plus className="size-4" />}
            >
              {t('createButton')}
            </AppButton> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={() => handleEditRule(rule)}
              />
            ))}
          </div>
          {rules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('noRules')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CreateRuleSheet commented out for now */}
      {/* <CreateRuleSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSave={handleCreateSave}
      /> */}

      <EditRuleSheet
        open={!!editingRule}
        onOpenChange={(open) => !open && setEditingRule(null)}
        rule={editingRule}
        updateMutation={updateMutation}
      />

      {/* Delete dialog commented out for now */}
      {/* <AppAlertDialog
        open={!!deletingRule}
        onOpenChange={(open) => !open && setDeletingRule(null)}
        variant="delete"
        title={t('deleteDialog.title')}
        subTitle={t('deleteDialog.subTitle')}
        description={t('deleteDialog.description')}
        confirmLabel={t('deleteDialog.confirmButton')}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      /> */}
    </>
  );
};

export { ReferralRules };
