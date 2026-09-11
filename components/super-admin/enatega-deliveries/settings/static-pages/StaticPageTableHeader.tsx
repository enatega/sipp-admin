import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import SearchUrl from '@/components/shared/SearchUrl';
import AddStaticPageDrawer from './AddStaticPageDrawer';

export default function StaticPageTableHeader() {
  const t = useTranslations('settings.staticPages.header');
  const [isCreating, setIsCreating] = useState(false);
  return (
    <div className="space-y-3 mb-4">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <div className="flex justify-between items-center">
        <div className="w-[320px]">
          <SearchUrl
            inputClassName="h-11 rounded-[6px]"
            placeholder={t('searchPlaceholder')}
            paramKey="search"
          />
        </div>
        <AppButton
          leftIcon={<PlusIcon size={20} />}
          onClick={() => setIsCreating(true)}
        >
          {t('createButton')}
        </AppButton>
      </div>

      <AddStaticPageDrawer
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
}
