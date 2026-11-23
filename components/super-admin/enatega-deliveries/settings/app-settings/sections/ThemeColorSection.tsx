'use client';

import { AppColorInput } from '@/components/shared/form/AppColorInput';
import { useTranslations } from 'next-intl';

interface ThemeColorSectionProps {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  showSecondary?: boolean;
  showTertiary?: boolean;
}

export default function ThemeColorSection({
  showSecondary = true,
  showTertiary = true,
}: ThemeColorSectionProps) {
  const t = useTranslations('settings.appSettings.themeColor');

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold mb-4">{t('title')}</h3>

      {/* Colors in a Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Color */}
        <AppColorInput
          name="primaryColor"
          label={t('primaryColor')}
        />

        {showSecondary && (
          <AppColorInput
            name="secondaryColor"
            label={t('secondaryColor')}
          />
        )}

        {showTertiary && (
          <AppColorInput
            name="tertiaryColor"
            label={t('tertiaryColor')}
          />
        )}
      </div>

      {/* Helper Text */}
      <p className="text-sm text-muted-foreground mt-4">{t('helperText')}</p>
    </div>
  );
}
