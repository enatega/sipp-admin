'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { cn } from '@/lib/utils';
import { ZoneMode } from './audience';

interface ZoneFilterProps {
  mode: ZoneMode;
  zoneIds: string[];
  onModeChange: (mode: ZoneMode) => void;
  onZonesChange: (zoneIds: string[]) => void;
  error?: string;
}

export default function ZoneFilter({
  mode,
  zoneIds,
  onModeChange,
  onZonesChange,
  error,
}: ZoneFilterProps) {
  const t = useTranslations('notifications.composer');
  const { data: zones, isLoading } = useGetZonesSimple();

  const toggleZone = (id: string) =>
    onZonesChange(
      zoneIds.includes(id) ? zoneIds.filter((item) => item !== id) : [...zoneIds, id],
    );

  const modes: Array<{ value: ZoneMode; label: string }> = [
    { value: 'all', label: t('everywhere') },
    { value: 'zones', label: t('specificZones') },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[15px] font-medium">{t('where')}</p>

      <div
        role="radiogroup"
        aria-label={t('where')}
        className="inline-flex overflow-hidden rounded-lg border border-stroke"
      >
        {modes.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => onModeChange(value)}
            className={cn(
              'px-4 py-2 text-sm transition-colors',
              mode === value
                ? 'bg-primary/10 font-medium text-primary'
                : 'bg-white hover:bg-gray-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'zones' && (
        <div className="flex flex-wrap gap-2">
          {isLoading && (
            <span className="text-sm text-muted-foreground">…</span>
          )}
          {!isLoading && !zones?.length && (
            <span className="text-sm text-muted-foreground">{t('zoneNone')}</span>
          )}
          {zones?.map((zone) => {
            const isSelected = zoneIds.includes(zone.id);
            return (
              <button
                key={zone.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleZone(zone.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-stroke bg-white hover:bg-gray-50',
                )}
              >
                {isSelected && <Check className="size-3.5" aria-hidden="true" />}
                {zone.title}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">{t('zoneHelp')}</p>
      )}
    </div>
  );
}
