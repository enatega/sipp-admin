import { useGetZonesSimple } from '@/hooks/api/common/zones';
import { useCurrency } from '@/hooks/use-currency';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPhoneField } from '@/components/shared/form/AppPhoneInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { VendorStore } from './types';

export function BasicInformationSection() {
  const { values, setFieldValue } = useFormikContext<VendorStore>();
  const t = useTranslations('vendorDeliveriesStores.addStore.step1');
  const { data: zones, isLoading: isLoadingZones } = useGetZonesSimple();
  const { currencySymbol } = useCurrency();

  const zoneOptions =
    zones?.map((zone) => ({
      key: zone.title,
      value: zone.id,
    })) || [];

  return (
    <div className="bg-white p-10 rounded-xl shadow space-y-5">
      <h3 className="text-2xl font-semibold mb-10">{t('title')}</h3>

      <AppInputField
        label={t('storeNameLabel')}
        name="name"
        type="text"
        placeholder={t('storeNamePlaceholder')}
        requiredAsterisk
        disabled
      />
      <p className="-mt-3 text-xs text-muted-foreground">
        {t('storeNameImmutableHint')}
      </p>
      <AppPhoneField
        label={t('phoneLabel')}
        name="phone"
        placeholder={t('phonePlaceholder')}
        requiredAsterisk
        disabled
      />
      <p className="-mt-3 text-xs text-muted-foreground">
        {t('phoneImmutableHint')}
      </p>
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
      <AppInputField
        label={t('emailLabel')}
        name="email"
        type="email"
        placeholder={t('emailPlaceholder')}
        requiredAsterisk
        disabled
      />
      <p className="-mt-3 text-xs text-muted-foreground">
        {t('emailImmutableHint')}
      </p>
      <AppSelect
        name="zoneId"
        label={t('zoneLabel')}
        placeholder={isLoadingZones ? t('loadingZones') : t('zonePlaceholder')}
        options={zoneOptions}
        value={values.zoneId}
        onValueChange={(value) => setFieldValue('zoneId', value)}
        requiredAsterisk
        disabled={isLoadingZones}
      />
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
