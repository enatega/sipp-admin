'use client';

import { Bike, ShieldCheck, Store, Users, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AudiencePreviewGroup } from '@/types';
import { cn } from '@/lib/utils';
import { AUDIENCE_GROUPS, AudienceGroup, GROUP_USER_TYPE } from './audience';

const GROUP_ICONS: Record<AudienceGroup, LucideIcon> = {
  customer: Users,
  rider: Bike,
  store: Store,
  admin: ShieldCheck,
};

interface GroupCardsProps {
  selected: AudienceGroup[];
  onChange: (next: AudienceGroup[]) => void;
  /** Reach of every group under the current zone filter. */
  catalog?: AudiencePreviewGroup[];
  error?: string;
}

export default function GroupCards({
  selected,
  onChange,
  catalog,
  error,
}: GroupCardsProps) {
  const t = useTranslations('notifications.composer');
  const everyoneSelected = selected.length === AUDIENCE_GROUPS.length;

  const toggle = (group: AudienceGroup) =>
    onChange(
      selected.includes(group)
        ? selected.filter((item) => item !== group)
        : [...selected, group],
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium">{t('audienceStep')}</p>
        <button
          type="button"
          onClick={() => onChange(everyoneSelected ? [] : [...AUDIENCE_GROUPS])}
          className="rounded-md px-2 py-1 text-sm text-primary hover:bg-primary/10"
        >
          {everyoneSelected ? t('clearAll') : t('everyone')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AUDIENCE_GROUPS.map((group) => {
          const Icon = GROUP_ICONS[group];
          const isSelected = selected.includes(group);
          const reach = catalog?.find(
            (item) => item.userType === GROUP_USER_TYPE[group],
          );
          return (
            <button
              key={group}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(group)}
              title={
                reach
                  ? t('reachableOf', {
                      pushEnabled: reach.pushEnabled,
                      total: reach.total,
                    })
                  : undefined
              }
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-stroke bg-white hover:bg-gray-50',
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4" aria-hidden="true" />
                {t(`groups.${group}`)}
              </span>
              <span
                className={cn(
                  'mt-1 block text-xs',
                  isSelected ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {reach ? t('reachable', { count: reach.pushEnabled }) : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
