'use client';

import { BellRing } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AudienceGroup } from './audience';

interface PhonePreviewProps {
  title: string;
  description: string;
  groups: AudienceGroup[];
}

/** How the notification will look on a lock screen, and which apps it lands in. */
export default function PhonePreview({ title, description, groups }: PhonePreviewProps) {
  const t = useTranslations('notifications');
  const tComposer = useTranslations('notifications.composer');

  const apps = groups.map((group) => t(`userTypes.${group}`)).join(', ');

  return (
    <div className="rounded-xl border border-stroke bg-gray-50 p-4">
      <p className="mb-2 text-[15px] font-medium">{tComposer('previewTitle')}</p>
      <div className="rounded-2xl border border-stroke bg-white p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex size-[18px] items-center justify-center rounded bg-primary/10 text-ink">
            <BellRing className="size-3" aria-hidden="true" />
          </span>
          <span className="flex-1 text-xs text-muted-foreground">Pohanch</span>
          <span className="text-xs text-muted-foreground">{tComposer('previewNow')}</span>
        </div>
        <p className="break-words text-sm font-medium leading-snug">
          {title.trim() || tComposer('previewTitlePlaceholder')}
        </p>
        <p className="mt-0.5 break-words text-[13px] leading-snug text-muted-foreground">
          {description.trim() || tComposer('previewBodyPlaceholder')}
        </p>
      </div>
      {apps && (
        <p className="mt-2 text-xs text-muted-foreground">
          {tComposer('previewApps', { apps })}
        </p>
      )}
    </div>
  );
}
