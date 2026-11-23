'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import SettingsTabs from '@/components/super-admin/enatega-deliveries/settings';

export default function SettingsPage() {
  const t = useTranslations('navigation');
  return (
    <div className="space-y-6">
      <Heading title={t('settings')} />
      <SettingsTabs />
    </div>
  );
}
