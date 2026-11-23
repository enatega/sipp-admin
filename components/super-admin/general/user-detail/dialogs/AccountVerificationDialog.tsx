'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import clsx from 'clsx';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateUserVerification } from '@/hooks/api/super-admin/general/users';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';

interface AccountVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  email?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface VerificationRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled: boolean;
}

function VerificationRow({
  icon,
  label,
  value,
  checked,
  onCheckedChange,
  disabled,
}: VerificationRowProps) {
  const t = useTranslations('userDetail.dialogs.verification');

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-ink flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-black">{label}</span>
          <span
            className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              checked
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600',
            )}
          >
            {checked ? t('verified') : t('unverified')}
          </span>
        </div>
        <p className="text-sm text-mute truncate">
          {value || t('notProvided')}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled || (!value && !checked)}
        aria-label={label}
      />
    </div>
  );
}

export function AccountVerificationDialog({
  open,
  onClose,
  onSuccess,
  userId,
  email,
  phone,
  emailVerified,
  phoneVerified,
}: AccountVerificationDialogProps) {
  const t = useTranslations('userDetail.dialogs.verification');
  const [emailChecked, setEmailChecked] = useState(emailVerified);
  const [phoneChecked, setPhoneChecked] = useState(phoneVerified);
  const { mutateAsync: updateVerification, isPending } =
    useUpdateUserVerification();

  const emailChanged = emailChecked !== emailVerified;
  const phoneChanged = phoneChecked !== phoneVerified;

  const handleSubmit = async () => {
    try {
      await updateVerification({
        userId,
        ...(emailChanged && { email_is_verified: emailChecked }),
        ...(phoneChanged && { phone_is_verified: phoneChecked }),
      });
      toast.success(t('success'));
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title=""
      size="md"
      showDefaultFooter={false}
    >
      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-ink" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">
            {t('title')}
          </h3>
          <p className="text-sm text-mute">{t('subtitle')}</p>
        </div>

        <div className="border rounded-lg divide-y">
          <VerificationRow
            icon={<Mail className="size-[18px]" />}
            label={t('email')}
            value={email}
            checked={emailChecked}
            onCheckedChange={setEmailChecked}
            disabled={isPending}
          />
          <VerificationRow
            icon={<Phone className="size-[18px]" />}
            label={t('phone')}
            value={phone}
            checked={phoneChecked}
            onCheckedChange={setPhoneChecked}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 w-full mt-6">
        <AppButton
          type="button"
          variant="secondary"
          className="w-full"
          onClick={onClose}
          disabled={isPending}
        >
          {t('cancel')}
        </AppButton>
        <AppButton
          type="button"
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          isLoading={isPending}
          disabled={(!emailChanged && !phoneChanged) || isPending}
        >
          {t('confirm')}
        </AppButton>
      </div>
    </AppDialog>
  );
}
