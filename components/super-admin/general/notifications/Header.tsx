'use client';

import dynamic from 'next/dynamic';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const SendNotificationDrawer = dynamic(() => import('./send-notification'), {
  ssr: false,
});

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const t = useTranslations('notifications');

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <Heading title={t('title')} />
        <div className="flex gap-2 items-center">
          <AppButton
            leftIcon={<Send size={16} />}
            onClick={() => setIsDrawerOpen(true)}
          >
            {t('send')}
          </AppButton>
        </div>
      </div>

      {isDrawerOpen ? (
        <SendNotificationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      ) : null}
    </div>
  );
}
