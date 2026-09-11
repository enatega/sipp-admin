'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { deployment } from '@/config/deployment';
import {
  useGetAdminSettings,
  useGetWebSettings,
} from '@/hooks/api/super-admin/enatega-deliveries/settings';
import { BrandingShimmerLayout } from '@/components/layouts/BrandingShimmerLayout';

export interface BrandingContextValue {
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  appName: string;
  appNameClassName: string;
  isLoading: boolean;
  isRefreshing: boolean;
  brandTitle: string;
}

const DEFAULT_APP_NAME_CLASS = 'text-[18px] font-[600] text-foreground';
const BRANDING_STORAGE_KEY = 'adminBranding';

function getContrastForeground(hexColor: string): '#000000' | '#ffffff' {
  const normalized = hexColor.trim().replace(/^#/, '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => character.repeat(2))
          .join('')
      : normalized;

  if (!/^[\da-f]{6}$/i.test(expanded)) {
    return '#ffffff';
  }

  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  const blackContrast = (luminance + 0.05) / 0.05;
  const whiteContrast = 1.05 / (luminance + 0.05);

  return blackContrast >= whiteContrast ? '#000000' : '#ffffff';
}

interface CachedBranding {
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  appName: string;
  brandTitle: string;
  description: string;
}

const BrandingContext = createContext<BrandingContextValue>({
  logo: deployment.brand.logo,
  primaryColor: deployment.brand.colors.primary,
  secondaryColor: deployment.brand.colors.secondary,
  tertiaryColor: deployment.brand.colors.tertiary,
  appName: deployment.brand.appName,
  appNameClassName: DEFAULT_APP_NAME_CLASS,
  isLoading: false,
  isRefreshing: false,
  brandTitle: deployment.brand.titles.admin,
});

export const useBranding = () => useContext(BrandingContext);

function getCachedBranding(): CachedBranding | null {
  try {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedBranding>;

    return {
      logo: typeof parsed.logo === 'string' ? parsed.logo : null,
      favicon: typeof parsed.favicon === 'string' ? parsed.favicon : null,
      primaryColor:
        typeof parsed.primaryColor === 'string' && parsed.primaryColor.trim()
          ? parsed.primaryColor
          : deployment.brand.colors.primary,
      secondaryColor:
        typeof parsed.secondaryColor === 'string' &&
        parsed.secondaryColor.trim()
          ? parsed.secondaryColor
          : deployment.brand.colors.secondary,
      tertiaryColor:
        typeof parsed.tertiaryColor === 'string' && parsed.tertiaryColor.trim()
          ? parsed.tertiaryColor
          : deployment.brand.colors.tertiary,
      appName:
        typeof parsed.appName === 'string' && parsed.appName.trim()
          ? parsed.appName
          : deployment.brand.appName,
      brandTitle:
        typeof parsed.brandTitle === 'string' && parsed.brandTitle.trim()
          ? parsed.brandTitle
          : deployment.brand.titles.admin,
      description:
        typeof parsed.description === 'string' && parsed.description.trim()
          ? parsed.description
          : deployment.brand.description,
    };
  } catch (error) {
    console.error('Error reading cached branding:', error);
    return null;
  }
}

function storeCachedBranding(branding: CachedBranding): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
  } catch (error) {
    console.error('Error caching branding:', error);
  }
}

export function BrandingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const cachedBranding = useMemo(
    () => (isHydrated ? getCachedBranding() : null),
    [isHydrated],
  );

  const {
    data: adminSettings,
    isLoading: isAdminSettingsLoading,
    isFetching: isAdminSettingsFetching,
  } = useGetAdminSettings({
    enabled: isHydrated,
  });
  const {
    data: webSettings,
    isLoading: isWebSettingsLoading,
    isFetching: isWebSettingsFetching,
  } = useGetWebSettings({
    enabled: isHydrated,
  });

  const {
    logo,
    appName,
    description,
    favicon,
    colors: { primary, secondary, tertiary },
    titles,
  } = deployment.brand;

  const resolvedBranding = useMemo<CachedBranding>(() => {
    const base = cachedBranding ?? {
      logo,
      favicon,
      primaryColor: primary,
      secondaryColor: secondary,
      tertiaryColor: tertiary,
      appName,
      brandTitle: titles.admin,
      description,
    };

    return {
      logo: adminSettings?.global_logo || webSettings?.global_logo || base.logo,
      favicon: webSettings?.favicon || base.favicon,
      primaryColor:
        adminSettings?.primary_color ||
        webSettings?.primary_color ||
        base.primaryColor,
      secondaryColor:
        adminSettings?.secondary_color ||
        webSettings?.secondary_color ||
        base.secondaryColor,
      tertiaryColor:
        adminSettings?.tertiary_color ||
        webSettings?.tertiary_color ||
        base.tertiaryColor,
      appName: webSettings?.site_title || base.appName,
      brandTitle: webSettings?.site_title || base.brandTitle,
      description: webSettings?.site_description || base.description,
    };
  }, [
    adminSettings,
    appName,
    cachedBranding,
    description,
    favicon,
    logo,
    primary,
    secondary,
    tertiary,
    titles.admin,
    webSettings,
  ]);

  const isLoading =
    isHydrated &&
    !cachedBranding &&
    (isAdminSettingsLoading || isWebSettingsLoading);
  const isRefreshing =
    (isAdminSettingsFetching || isWebSettingsFetching) &&
    Boolean(cachedBranding || adminSettings || webSettings);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--primary',
      resolvedBranding.primaryColor,
    );
    document.documentElement.style.setProperty(
      '--secondary',
      resolvedBranding.secondaryColor,
    );
    document.documentElement.style.setProperty(
      '--secondary-foreground',
      getContrastForeground(resolvedBranding.secondaryColor),
    );
    document.documentElement.style.setProperty(
      '--tertiary',
      resolvedBranding.tertiaryColor,
    );
  }, [
    resolvedBranding.primaryColor,
    resolvedBranding.secondaryColor,
    resolvedBranding.tertiaryColor,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (resolvedBranding.brandTitle) {
      document.title = resolvedBranding.brandTitle;
    }

    if (!resolvedBranding.favicon) return;

    let faviconElement = document.querySelector<HTMLLinkElement>(
      "link[rel='icon']",
    );

    if (!faviconElement) {
      faviconElement = document.createElement('link');
      faviconElement.rel = 'icon';
      document.head.appendChild(faviconElement);
    }

    faviconElement.href = resolvedBranding.favicon;
  }, [resolvedBranding.brandTitle, resolvedBranding.favicon]);

  useEffect(() => {
    if (!isHydrated) return;
    storeCachedBranding(resolvedBranding);
  }, [isHydrated, resolvedBranding]);

  const value = useMemo<BrandingContextValue>(
    () => ({
      logo: resolvedBranding.logo,
      primaryColor: resolvedBranding.primaryColor,
      secondaryColor: resolvedBranding.secondaryColor,
      tertiaryColor: resolvedBranding.tertiaryColor,
      appName: resolvedBranding.appName,
      appNameClassName: DEFAULT_APP_NAME_CLASS,
      isLoading,
      isRefreshing,
      brandTitle: resolvedBranding.brandTitle,
    }),
    [isLoading, isRefreshing, resolvedBranding],
  );

  if (isLoading) {
    return <BrandingShimmerLayout />;
  }

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}
