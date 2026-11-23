import { useFormikContext } from 'formik';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { useCurrency } from '@/hooks/use-currency';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { StoreSlugField } from '@/components/shared/form/StoreSlugField';
import { Store } from './types';
import { useZoneLocationMismatch } from './useZoneLocationMismatch';

export function BasicInformationSection({ isLegacyMigrated = false }: { isLegacyMigrated?: boolean }) {
  const { values, setFieldValue } = useFormikContext<Store>();
  const t = useTranslations('lumiFood.stores.addStore.step1');
  const tLegacy = useTranslations('legacyStoreProfile');
  const tLocation = useTranslations('storeLocation');
  const isZoneMismatch = useZoneLocationMismatch(
    values.zoneId,
    values.exactStoreLocation,
  );

  // Fetch zones from API
  const { data: zones, isLoading: isLoadingZones } = useGetZonesSimple();
  
  // Get currency symbol
  const { currencySymbol } = useCurrency();

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  return (
    <div className="bg-white p-10 rounded-xl shadow space-y-5">
      <h3 className="text-2xl font-semibold mb-10">{t('title')}</h3>
      {isLegacyMigrated && <p className="text-sm text-muted-foreground">{tLegacy('useProfileHint')}</p>}

      <AppInputField
        label={t('storeNameLabel')}
        name="name"
        type="text"
        placeholder={t('storeNamePlaceholder')}
        requiredAsterisk
        disabled={isLegacyMigrated}
      />
      <StoreSlugField label={t('slugLabel')} helperText={t('slugHint')} />

      {/* Email - Read Only */}
      <div>
        <AppInputField
          label={t('emailLabel')}
          name="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          requiredAsterisk={!isLegacyMigrated}
          disabled
        />
        <p className="text-xs text-muted-foreground mt-1">
          {isLegacyMigrated ? tLegacy('loginHint') : t('emailImmutableHint')}
        </p>
      </div>

      <AppPhoneField
        label={t('phoneLabel')}
        name="phone"
        placeholder={t('phonePlaceholder')}
        requiredAsterisk={!isLegacyMigrated}
        disabled={isLegacyMigrated}
        validateOnChange
      />

      <AppFileInput
        name="logo"
        label={t('logoLabel')}
        requiredAsterisk
        previewHeight={120}
      />

      <AppFileInput
        name="banner"
        label={t('bannerLabel')}
        previewHeight={120}
      />

      <AppSelect
        name="zoneId"
        label={t('zoneLabel')}
        placeholder={isLoadingZones ? t('loadingZones') : t('zonePlaceholder')}
        options={zoneOptions}
        value={values.zoneId}
        onValueChange={(value) => setFieldValue('zoneId', value)}
        requiredAsterisk={!isLegacyMigrated}
        disabled={isLoadingZones}
      />
      {isZoneMismatch && (
        <p
          role="alert"
          className="-mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {tLocation('storeOutsideZone')}
        </p>
      )}

      <AppInputField
        name="minimumOrderValue"
        label={t('minimumOrderLabel')}
        type="number"
        placeholder={t('minimumOrderPlaceholder')}
        prefix={currencySymbol}
        step="0.01"
        min="0"
        requiredAsterisk
      />

      <AppInputField
        label={t('tagLineLabel')}
        name="tagLine"
        type="text"
        placeholder={t('tagLinePlaceholder')}
      />

      <AppTextarea
        label={t('descriptionLabel')}
        name="description"
        placeholder={t('descriptionPlaceholder')}
        rows={3}
      />

      <AppTextarea
        label={t('addressLabel')}
        name="address"
        placeholder={t('addressPlaceholder')}
        rows={3}
        requiredAsterisk
      />
    </div>
  );
}
