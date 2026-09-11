'use client';

import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetUserDetails } from '@/hooks/api/super-admin/general/users';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Table, TableBody } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { TableShimmer } from '@/components/shared/TableShimmer';
import { ProfileSection } from '../ProfileSection';

// Lazy load tab components
const ProfileInfo = lazy(() =>
  import('./screens/PersonalInfo').then((mod) => ({
    default: mod.ProfileInfo,
  })),
);
const History = lazy(() =>
  import('./screens/History').then((mod) => ({ default: mod.History })),
);
const RegisterAddresses = lazy(() =>
  import('./screens/RegisterAddresses').then((mod) => ({
    default: mod.RegisterAddresses,
  })),
);
const Reviews = lazy(() =>
  import('./screens/reviews').then((mod) => ({ default: mod.Reviews })),
);

export function UserDetailTabs() {
  const t = useTranslations('userDetail');
  const params = useParams();
  const userId = params.userId as string;

  const { data, isLoading, isError, error } = useGetUserDetails(userId);

  const TAB_DEFS: TabDef[] = useMemo(
    () => [
      { value: 'personal-information', label: t('tabs.personalInformation') },
      { value: 'history', label: t('tabs.history') },
      { value: 'register-addresses', label: t('tabs.registerAddresses') },
      { value: 'reviews', label: t('tabs.reviews') },
    ],
    [t],
  );

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'personal-information',
    paramName: 'tab',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full animate-pulse bg-gray-200 rounded-lg" />
        <div className="h-12 w-full animate-pulse bg-gray-200 rounded-lg" />
        <Table>
          <TableBody>
            <TableShimmer limit={10} columns={3} />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError) {
    return (
      <DisplayError message={returnErrorMessage(error as ApiErrorResponse)} />
    );
  }

  if (!data?.user) {
    return (
      <NoDataFound
        title={t('errors.userNotFound')}
        subtitle={t('errors.userNotFoundSubtitle')}
      />
    );
  }

  return (
    <>
      <ProfileSection user={data.user} />
      <Tabs value={active} onValueChange={setActive} className="w-full mt-6">
        <ScrollableTabsNav
          tabs={tabs}
          value={active}
          onChange={setActive}
          className="mb-6"
        />

        <TabsContent value="personal-information">
          <Suspense
            fallback={
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableShimmer limit={10} columns={2} />
                  </TableBody>
                </Table>
              </div>
            }
          >
            <ProfileInfo userId={userId} user={data?.user?.userProfile} />
          </Suspense>
        </TabsContent>

        <TabsContent value="history">
          <Suspense
            fallback={
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableShimmer limit={10} columns={4} />
                  </TableBody>
                </Table>
              </div>
            }
          >
            <History userId={userId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="register-addresses">
          <Suspense
            fallback={
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableShimmer limit={10} columns={3} />
                  </TableBody>
                </Table>
              </div>
            }
          >
            <RegisterAddresses userId={userId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="reviews">
          <Suspense
            fallback={
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableShimmer limit={10} columns={4} />
                  </TableBody>
                </Table>
              </div>
            }
          >
            <Reviews userId={userId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
}
