'use client';

import Image from 'next/image';
import { ApiErrorResponse } from '@/types';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useCurrency } from '@/hooks/use-currency';
import { useUpdateStoreSetting } from '@/hooks/api/store/deliveries/profile';
import { Switch } from '@/components/ui/switch';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { ImagePreview } from '@/components/shared/ImagePreview';
import { useStoreProfileViewModel } from './profileData';
import StatusBadge from './StatusBadge';

const ProfileDetail = () => {
  const t = useTranslations('storeProfile.detail');
  const tErrors = useTranslations('storeProfile.detail.errors');
  const tToast = useTranslations('storeProfile.detail.toast');
  const tSections = useTranslations('storeProfile.detail.sections');
  const tSettings = useTranslations('storeProfile.detail.settingsFields');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = resolveCurrencySymbol(currencySymbol);
  const { mutateAsync: updateSetting, isPending } = useUpdateStoreSetting();

  const {
    storeId,
    profile,
    settings,
    additionalNotes,
    BasicInformation,
    contactDetails,
    kycDocuments,
    isLoading,
    isError,
    error,
  } = useStoreProfileViewModel();

  if (isLoading) return [1, 2, 3, 4, 5].map((i) => <CardShimmer key={i} />);
  if (isError)
    return (
      <DisplayError
        title={tErrors('fetchFailedTitle')}
        message={returnErrorMessage(error as ApiErrorResponse)}
        variant="error"
      />
    );
  const handleUpdateSetting = async (field: string, value: boolean) => {
    if (!storeId) return;

    try {
      const response = await updateSetting({
        storeId,
        field,
        value,
      });
      toast.success(response.message || tToast('settingsUpdatedSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };
  return (
    <div className="rounded-xl border bg-white">
      <div className="flex flex-wrap items-center gap-4 rounded-tl-lg rounded-tr-lg bg-mute/10 p-4">
        <Image
          src={profile?.image || 'https://placehold.co/600x400'}
          width={70}
          height={70}
          alt={t('profileImageAlt')}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{profile?.name || t('notAvailable')}</h2>
            <StatusBadge />
          </div>
          <p className="text-xs text-mute">{profile?.email || t('notAvailable')}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-mute">
            <span className="font-medium text-foreground">
              {profile?.rating || t('notAvailable')}
            </span>
            <div className="flex items-center gap-0.5 text-orange-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= 4 ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span>
              ({profile?.totalReviews || t('notAvailable')} {t('reviewsLabel')})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-4 md:p-6">
        <section>
          <h3 className="text-lg font-semibold text-foreground">
            {tSections('basicInformation')}
          </h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {BasicInformation.map((item) => (
              <div key={`${item.key}-${item.label}`} className="space-y-1">
                <p className="text-sm text-mute">{item.label}</p>
                <p className="text-sm text-foreground">
                  {item.key === 'minimumOrderValue' && item.value !== null && item.value !== undefined && item.value !== ''
                    ? formatCurrency(Number(item.value), resolvedCurrencySymbol)
                    : item.value || t('notAvailable')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="">
            <h3 className="text-lg font-semibold text-foreground">
              {tSections('contactDetails')}
            </h3>
            <div className="flex items-center justify-between">
              <div className="mt-4 flex flex-col flex-1 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-mute">
                    {contactDetails?.email.label}
                  </p>
                  <p className="text-sm text-foreground">
                    {contactDetails?.email.value || t('notAvailable')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-mute">
                    {contactDetails?.phone.label}
                  </p>
                  <p className="text-sm text-foreground">
                    {contactDetails?.phone.value || t('notAvailable')}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 text-sm text-mute">
                <span>{contactDetails?.showContactInStorePage.label}</span>
                <Switch
                  name="show_contact_on_store_page"
                  checked={Boolean(contactDetails?.showContactInStorePage.value)}
                  onCheckedChange={(checked) =>
                    handleUpdateSetting('show_contact_on_store_page', checked)
                  }
                  disabled={isPending}
                  aria-label={t('showContactInStorePageAria')}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground">{tSections('settings')}</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between w-[250px]">
              <p className="text-sm text-mute">{tSettings('pickupAllowed')}</p>
              <Switch
                checked={Boolean(settings?.pickupAllowed)}
                onCheckedChange={(checked) =>
                  handleUpdateSetting('pickup_allow', checked)
                }
                disabled={isPending}
                aria-label={tSettings('pickupAllowedAria')}
              />
            </div>
            <div className="flex items-center justify-between gap-4 w-[250px]">
              <p className="text-sm text-mute">{tSettings('cardPaymentAllowed')}</p>
              <Switch
                checked={Boolean(settings?.cardPaymentAllowed)}
                onCheckedChange={(checked) =>
                  handleUpdateSetting('card_payment', checked)
                }
                disabled={isPending}
                aria-label={tSettings('cardPaymentAllowedAria')}
              />
            </div>
            <div className="flex items-center justify-between w-[250px]">
              <p className="text-sm text-mute">{tSettings('deliveryAllowed')}</p>
              <Switch
                checked={Boolean(settings?.deliveryAllowed)}
                onCheckedChange={(checked) =>
                  handleUpdateSetting('delivery_allow', checked)
                }
                disabled={isPending}
                aria-label={tSettings('deliveryAllowedAria')}
              />
            </div>
            <div className="flex items-center justify-between gap-4 w-[250px]">
              <p className="text-sm text-mute">{tSettings('codPaymentAllowed')}</p>
              <Switch
                checked={Boolean(settings?.codPaymentAllowed)}
                onCheckedChange={(checked) =>
                  handleUpdateSetting('cod_allow', checked)
                }
                disabled={isPending}
                aria-label={tSettings('codPaymentAllowedAria')}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground">
            {tSections('additionalNotes')}
          </h3>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-mute">{t('notesLabel')}</p>
            <p className="text-sm text-foreground">
              {additionalNotes || t('notAvailable')}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground">
            {tSections('kycDocuments')}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kycDocuments?.slice(0, 6).map((doc) => (
              <div key={doc.label} className="space-y-2">
                <p className="text-sm text-mute">{doc.label}</p>
                <div className="overflow-hidden rounded-lg border bg-mute/5">
                  <ImagePreview
                    image={doc.src || 'https://placehold.co/600x400'}
                    className="h-28 w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileDetail;
