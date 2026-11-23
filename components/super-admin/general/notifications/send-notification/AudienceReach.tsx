'use client';

import { Loader2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AudiencePreview } from '@/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AudienceReachProps {
  preview?: AudiencePreview;
  /** False while a newer audience is still being computed. */
  settled: boolean;
  isError: boolean;
  hasSelection: boolean;
  /** Zones were chosen as the filter but none is picked yet. */
  zonePending: boolean;
  zonesSelected: boolean;
  customersSelected: boolean;
  onRemoveZoneFilter: () => void;
}

const GROUP_LABEL_KEYS: Record<string, string> = {
  Customer: 'customer',
  Rider: 'rider',
  Store: 'store',
  Admin: 'admin',
  Staff: 'staff',
  Vendor: 'vendor',
};

/** Live "who will this reach"; push-enabled devices are what actually get a notification. */
export default function AudienceReach({
  preview,
  settled,
  isError,
  hasSelection,
  zonePending,
  zonesSelected,
  customersSelected,
  onRemoveZoneFilter,
}: AudienceReachProps) {
  const t = useTranslations('notifications');
  const tReach = useTranslations('notifications.reach');
  const [showWho, setShowWho] = useState(false);

  const groupLabel = (userType: string) => {
    const key = GROUP_LABEL_KEYS[userType];
    return key ? t(`userTypes.${key}`) : userType;
  };

  let body: ReactNode;

  if (!hasSelection) {
    body = <p className="text-muted-foreground">{tReach('empty')}</p>;
  } else if (zonePending) {
    body = <p className="text-muted-foreground">{tReach('pickZone')}</p>;
  } else if (isError) {
    body = <p className="text-muted-foreground">{tReach('error')}</p>;
  } else if (!preview || (!settled && preview.total === 0)) {
    // A zero result that is still on screen belongs to the previous selection
    // (typically "nothing selected"), so it says nothing about this audience.
    body = (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {tReach('loading')}
      </p>
    );
  } else if (preview.total === 0) {
    body = <p className="text-destructive">{tReach('noMatch')}</p>;
  } else {
    const unreachable = preview.total - preview.pushEnabled;
    const canRemoveFilter =
      zonesSelected && preview.pushEnabled === 0 && (preview.unfiltered?.pushEnabled ?? 0) > 0;
    body = (
      <div className={cn('space-y-3', !settled && 'opacity-60 transition-opacity')}>
        <p>
          <span
            className={cn(
              'text-3xl font-medium tabular-nums',
              preview.pushEnabled === 0 && 'text-destructive',
            )}
          >
            {preview.pushEnabled}
          </span>{' '}
          <span className="text-muted-foreground">
            {tReach('devices', { count: preview.pushEnabled })}
          </span>
        </p>

        <ul className="space-y-2">
          {preview.groups.map((group) => (
            <li key={group.userType}>
              <div className="flex justify-between gap-3">
                <span>{groupLabel(group.userType)}</span>
                <span className="tabular-nums text-muted-foreground">
                  {tReach('groupLine', {
                    pushEnabled: group.pushEnabled,
                    total: group.total,
                  })}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${
                      group.pushEnabled
                        ? Math.max(3, (group.pushEnabled / group.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        {unreachable > 0 && (
          <p className="text-muted-foreground">
            {tReach('unreachable', { count: unreachable })}
          </p>
        )}
        <p className="text-muted-foreground">{tReach('senderNote')}</p>
        {zonesSelected && customersSelected && (
          <p className="text-muted-foreground">{tReach('customerZoneNote')}</p>
        )}

        {canRemoveFilter && (
          <div className="rounded-lg bg-amber-50 p-3 text-amber-800">
            {tReach('noReachInZone', { count: preview.unfiltered?.pushEnabled ?? 0 })}{' '}
            <button
              type="button"
              onClick={onRemoveZoneFilter}
              className="font-medium underline"
            >
              {tReach('removeFilter')}
            </button>
          </div>
        )}
        {!canRemoveFilter && preview.pushEnabled === 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-destructive">
            {tReach('nobodyReachable')}
          </div>
        )}

        {preview.recipients && preview.recipients.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowWho((value) => !value)}
              className="text-primary hover:underline"
              aria-expanded={showWho}
            >
              {showWho
                ? tReach('hideWho')
                : tReach('showWho', { count: preview.recipients.length })}
            </button>
            {showWho && (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {preview.recipients.map((person) => (
                  <li key={person.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">
                      {person.name || person.email || person.id}
                      <span className="text-muted-foreground">
                        {' '}
                        · {person.userTypes.join(', ')}
                      </span>
                    </span>
                    {!person.hasPush && (
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-muted-foreground">
                        {tReach('noPush')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stroke bg-white p-4 text-sm" aria-live="polite">
      <p className="mb-2 text-[15px] font-medium">{tReach('title')}</p>
      {body}
    </div>
  );
}
