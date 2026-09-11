'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinned, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getFilteredSidebarSearchItems } from '@/config/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { CurrencyCode } from '@/components/shared/CurrencyDisplay';
import { SearchInput } from '@/components/shared/SearchInput';
import { LanguageSelector } from './LanguageSelector';
import { UserDropdownMenu } from './UserDropMenu';

interface Props {
  containerClass?: string;
}

const AppHeader = ({ containerClass }: Props) => {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslations();

  const [searchQuery, setSearchQuery] = useState('');
  const suggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];
    const getLabel = (translationKey: string, fallback: string) =>
      t.has(translationKey) ? t(translationKey) : fallback;

    return getFilteredSidebarSearchItems()
      .map((item) => {
        const label = getLabel(item.translationKey, item.path);
        const parentLabel = item.parentTranslationKey
          ? getLabel(item.parentTranslationKey, '')
          : null;

        return {
          ...item,
          label,
          parentLabel,
        };
      })
      .filter((item) => {
        const haystack =
          `${item.label} ${item.parentLabel ?? ''}`.toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 8);
  }, [searchQuery, t]);

  const handleSelectSuggestion = (path: string) => {
    setSearchQuery('');
    router.push(path);
  };

  const showSuggestions =
    searchQuery.trim().length > 0 && suggestions.length > 0;

  return (
    <div
      className={cn(
        'w-full bg-light h-[72px] py-4 fixed top-0 left-0 right-0 z-40 px-6 border-b',
        containerClass,
      )}
    >
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <Menu
            size={24}
            className="md:hidden block cursor-pointer"
            onClick={() => setOpenMobile(true)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push('/deliveries/live-tracking')}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Live Tracking
          </Button>

          <div className="relative">
            <SearchInput
              containerClass="w-[350px]"
              text={searchQuery}
              onChangeText={setSearchQuery}
              inputMode="search"
              aria-label="Search pages"
            />

            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-stroke rounded-md shadow-lg max-h-80 overflow-auto z-50">
                {suggestions.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm flex flex-col"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(item.path);
                    }}
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.parentLabel && (
                      <span className="text-xs text-gray-500">
                        {item.parentLabel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <CurrencyCode />
          <LanguageSelector />
          {/* <NotificationPopover /> */}
          <UserDropdownMenu />
        </div>
      </div>
    </div>
  );
};

export { AppHeader };
