'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Package,
  type LucideIcon,
  XCircle,
} from 'lucide-react';
import type { TabDef } from '@/hooks/use-synced-tabs';
import { useHorizontalOverflow } from '@/hooks/use-horizontel-overflow';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/shared/SearchInput';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import type { MenuCard } from './types';

type HeaderCardsProps = {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (value: string) => void;
  searchText: string;
  onSearchTextChange: (value: string) => void;
  searchPlaceholder: string;
  menuCards: MenuCard[];
  selectedMenuId: string | null;
  onSelectMenu: (menuId: string) => void;
  isLoading?: boolean;
};

type MenuSummaryStatProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  iconContainerClassName: string;
  iconClassName: string;
};

const MenuSummaryStat = ({
  icon: Icon,
  label,
  value,
  iconContainerClassName,
  iconClassName,
}: MenuSummaryStatProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/70 bg-white/70 px-2.5 py-2">
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          iconContainerClassName,
        )}
      >
        <Icon className={cn('h-4 w-4', iconClassName)} />
      </div>
      <div>
        <p className="text-[11px] leading-none text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-none text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
};

export default function HeaderCards({
  tabs,
  activeTab,
  onTabChange,
  searchText,
  onSearchTextChange,
  searchPlaceholder,
  menuCards,
  selectedMenuId,
  onSelectMenu,
  isLoading = false,
}: HeaderCardsProps) {
  const t = useTranslations('products.assignedMenuProducts');
  const {
    ref: cardsRef,
    showLeft: showCardsLeft,
    showRight: showCardsRight,
    scrollByAmount: scrollCardsByAmount,
  } = useHorizontalOverflow<HTMLDivElement>();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <ScrollableTabsNav
              tabs={tabs}
              value={activeTab}
              onChange={onTabChange}
            />
          </div>

          <div className="w-full max-w-[360px]">
            <SearchInput
              inputClassName="h-11"
              placeholder={searchPlaceholder}
              text={searchText}
              onChangeText={onSearchTextChange}
            />
          </div>
        </div>
      </div>

      <div className="relative">
        {showCardsLeft && (
          <div className="pointer-events-none absolute top-0 left-0 z-[5] h-full w-8 rounded-l-xl bg-gradient-to-r from-white to-transparent" />
        )}
        {showCardsRight && (
          <div className="pointer-events-none absolute top-0 right-0 z-[5] h-full w-8 rounded-r-xl bg-gradient-to-l from-white to-transparent" />
        )}

        {showCardsLeft && (
          <button
            type="button"
            onClick={() => scrollCardsByAmount('left')}
            className="absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full border bg-white/90 p-1.5 shadow hover:bg-white"
            aria-label={t('scrollLeft')}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        {showCardsRight && (
          <button
            type="button"
            onClick={() => scrollCardsByAmount('right')}
            className="absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full border bg-white/90 p-1.5 shadow hover:bg-white"
            aria-label={t('scrollRight')}
          >
            <ArrowRight size={16} />
          </button>
        )}

        <div ref={cardsRef} className="no-scrollbar overflow-x-auto scroll-smooth">
          <div className="flex min-w-max gap-3 py-1">
            {isLoading && menuCards.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`menu-card-skeleton-${index}`}
                  className="w-[230px] shrink-0 overflow-hidden rounded-2xl border border-sidebar-border bg-white p-3.5"
                >
                  <Skeleton className="h-6 w-3/5 rounded-md" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-9 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </div>
                </div>
              ))
            ) : (
              menuCards.map((menuCard) => {
                const isSelected = selectedMenuId === menuCard.id;

                return (
                  <button
                    key={menuCard.id}
                    type="button"
                    onClick={() => onSelectMenu(menuCard.id)}
                    className={cn(
                      'group relative w-[230px] shrink-0 overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200',
                      isSelected
                        ? 'border-primary bg-sky-50 shadow-[0_10px_24px_-20px_rgba(2,132,199,0.8)]'
                        : 'border-sidebar-border bg-white hover:border-primary/40 hover:shadow-[0_10px_24px_-22px_rgba(15,23,42,0.6)]',
                    )}
                  >
                    <p className="text-lg font-semibold text-foreground">
                      {menuCard.name}
                    </p>

                    <div className="mt-3 space-y-2">
                      <MenuSummaryStat
                        icon={Package}
                        label={t('totalProducts')}
                        value={menuCard.totalProducts}
                        iconContainerClassName="bg-sky-100"
                        iconClassName="text-sky-700"
                      />
                      <MenuSummaryStat
                        icon={CheckCircle2}
                        label={t('inStock')}
                        value={menuCard.inStockProducts}
                        iconContainerClassName="bg-green-100"
                        iconClassName="text-green-700"
                      />
                      <MenuSummaryStat
                        icon={XCircle}
                        label={t('outOfStock')}
                        value={menuCard.outOfStockProducts}
                        iconContainerClassName="bg-red-100"
                        iconClassName="text-red-700"
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
