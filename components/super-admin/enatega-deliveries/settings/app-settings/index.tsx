'use client';

import React from 'react';
import { AppSettingsFormValues } from '@/schemas/enatega-deliveries/settings/app-settings.schema';
import { useTranslations } from 'next-intl';
import type {
  AppSettings,
  WebSettings,
} from '@/types/entities/super-admin/enatega-deliveries/settings';
import {
  useGetAdminSettings,
  useGetAppSettings,
  useGetWebSettings,
} from '@/hooks/api/super-admin/enatega-deliveries/settings';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import AppSettingsSkeleton from './AppSettingsSkeleton';
import AppSettingsForm from './forms/AppSettingsForm';

const APP_TYPES = [
  { key: 'rider-app', labelKey: 'riderApp' },
  { key: 'store-app', labelKey: 'storeApp' },
  { key: 'customer-app', labelKey: 'customerApp' },
  { key: 'web', labelKey: 'web' },
  { key: 'admin', labelKey: 'admin' },
];
export function AppSettingsTabs() {
  const t = useTranslations('settings.appTypes');
  const { getParam, setParams } = useQueryParams();

  const appType = getParam('appType') || 'rider-app';
  const isWebTab = appType === 'web';
  const isAdminTab = appType === 'admin';

  // Use the correct hook based on the selected tab
  const { data: appSettingsData, isLoading: isAppLoading } = useGetAppSettings(
    appType,
    {
      enabled: !!appType && !isWebTab && !isAdminTab, // Disable for web & admin tabs
    },
  );

  const { data: webSettingsData, isLoading: isWebLoading } = useGetWebSettings({
    enabled: isWebTab, // Only enabled for web tab
  });

  const { data: adminSettingsData, isLoading: isAdminLoading } =
    useGetAdminSettings({
      enabled: isAdminTab, // Only enabled for admin tab
    });

  const isLoading = isWebTab
    ? isWebLoading
    : isAdminTab
      ? isAdminLoading
      : isAppLoading;

  // Get the correct API data based on the selected tab
  const apiData: AppSettings | WebSettings | null = isWebTab
    ? webSettingsData ?? null
    : isAdminTab
      ? adminSettingsData ?? null
      : Array.isArray(appSettingsData)
        ? appSettingsData[0] ?? null
        : appSettingsData ?? null;

  // Map API data to form initial values
  const initialValues: AppSettingsFormValues = React.useMemo(() => {
    const defaultValues: AppSettingsFormValues = {
      logo: null,
      splashImage: null,
      maintenanceImage: null,
      promotionalBanner: null,
      maintenanceEnabled: false,
      maintenanceMessage: '',
      primaryColor: '#000000',
      secondaryColor: '#666666',
      tertiaryColor: '#CCCCCC',
    };

    if (!apiData) return defaultValues;

    return {
      logo: apiData.global_logo || null,
      splashImage: apiData.splash_screen || null,
      maintenanceImage: apiData.maintenance_message_image || null,
      promotionalBanner: apiData.promotional_banner || null,
      maintenanceEnabled: apiData.is_maintenance_mode || false,
      maintenanceMessage: apiData.maintenance_message || '',
      primaryColor: apiData.primary_color || '#000000',
      secondaryColor: apiData.secondary_color || '#666666',
      tertiaryColor: apiData.tertiary_color || '#CCCCCC',
    };
  }, [apiData]);

  const handleTabChange = (type: string) => {
    setParams({ appType: type }, { method: 'push' });
  };

  return (
    <div className="space-y-6">
      {/* App Type Tabs */}
      <div className="flex gap-2 border-y border-border py-4">
        {APP_TYPES.map(({ key, labelKey }) => (
          <AppButton
            key={key}
            onClick={() => handleTabChange(key)}
            variant={appType === key ? 'primary' : 'mute'}
          >
            {t(labelKey)}
          </AppButton>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <AppSettingsSkeleton
          showSplashScreen={['rider-app', 'store-app', 'customer-app'].includes(appType)}
          showPromotionalBanner={appType === 'customer-app'}
        />
      ) : (
        <AppSettingsForm
          key={appType} // Force re-mount when appType changes
          appType={appType}
          initialValues={initialValues}
          apiData={apiData || undefined}
          onSubmit={undefined}
        />
      )}
    </div>
  );
}
