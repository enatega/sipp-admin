'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { AppSettingsTabs } from '@/components/super-admin/enatega-deliveries/settings/app-settings';
import { ConfigurationForm } from '@/components/super-admin/enatega-deliveries/settings/configuration';
import { ProfileAccount } from '@/components/super-admin/enatega-deliveries/settings/profile-account';
import { StaticPagesTable } from './static-pages/StaticPagesTable';

export default function SettingsTabs() {
  const t = useTranslations('settings');

  const TAB_DEFS: TabDef[] = React.useMemo(
    () => [
      { value: 'profile-account', label: t('tabs.profileAccount') },
      { value: 'app-settings', label: t('tabs.appSettings') },
      { value: 'static-pages', label: t('tabs.staticPages') },
      { value: 'configuration', label: t('tabs.configuration') },
    ],
    [t],
  );

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'profile-account',
    paramName: 'tab',
    mode: 'url-only',
  });

  return (
    <Tabs value={active} onValueChange={setActive}>
      <ScrollableTabsNav
        tabs={tabs}
        value={active}
        onChange={setActive}
        className=""
      />
      <TabsContent value={active} className="mt-4">
        <React.Suspense fallback={<div className="p-4">{t('loading')}</div>}>
          {active === 'profile-account' && <ProfileAccount />}
          {active === 'app-settings' && <AppSettingsTabs />}
          {active === 'static-pages' && <StaticPagesTable />}
          {active === 'configuration' && <ConfigurationForm />}
        </React.Suspense>
      </TabsContent>
    </Tabs>
  );
}
