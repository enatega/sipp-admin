'use client';

import { useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AudienceUser } from '@/types';
import { useSearchAudienceUsers } from '@/hooks/api/super-admin/general/notifications';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SpecificPeopleProps {
  people: AudienceUser[];
  onChange: (people: AudienceUser[]) => void;
}

const displayName = (user: AudienceUser) =>
  user.name || user.email || user.id;

export default function SpecificPeople({ people, onChange }: SpecificPeopleProps) {
  const t = useTranslations('notifications.composer');
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [includeUnreachable, setIncludeUnreachable] = useState(false);

  const debouncedTerm = useDebouncedValue(term, 400);
  const { data: results, isFetching } = useSearchAudienceUsers(
    debouncedTerm,
    !includeUnreachable,
  );

  const trimmed = term.trim();
  const searchable = trimmed.length >= 2;
  const searching = searchable && (isFetching || trimmed !== debouncedTerm.trim());
  const visibleResults = searchable ? (results ?? []) : [];

  const toggle = (user: AudienceUser) =>
    onChange(
      people.some((person) => person.id === user.id)
        ? people.filter((person) => person.id !== user.id)
        : [...people, user],
    );

  return (
    <div className="space-y-2">
      <p className="text-[15px] font-medium">{t('people')}</p>

      <div className="flex flex-wrap items-center gap-2">
        {people.map((person) => (
          <span
            key={person.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 py-1 pl-3 pr-1.5 text-sm text-primary"
          >
            {displayName(person)}
            <button
              type="button"
              aria-label={t('peopleRemove', { name: displayName(person) })}
              onClick={() => toggle(person)}
              className="rounded-full p-0.5 hover:bg-primary/20"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stroke px-3 py-1 text-sm hover:bg-gray-50"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              {t('peopleAdd')}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[min(24rem,90vw)] p-0"
            // The drawer locks page scrolling; without this the wheel never reaches the list.
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="relative border-b p-3">
              <Search
                className="absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={t('peopleSearchPlaceholder')}
                className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div
              className="max-h-64 overflow-y-auto overscroll-contain"
              style={{ touchAction: 'pan-y' }}
              role="listbox"
              aria-multiselectable
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              {!searchable && (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {t('peopleHint')}
                </p>
              )}
              {searching && (
                <p className="px-4 py-2 text-xs text-muted-foreground">
                  {t('peopleSearching')}
                </p>
              )}
              {searchable && !searching && visibleResults.length === 0 && (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {includeUnreachable ? t('peopleEmpty') : t('peopleEmptyPushOnly')}
                </p>
              )}
              {visibleResults.map((user) => {
                const picked = people.some((person) => person.id === user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={picked}
                    onClick={() => toggle(user)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50',
                      picked && 'bg-primary/5',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded border',
                        picked
                          ? 'border-primary bg-primary text-white'
                          : 'border-stroke',
                      )}
                    >
                      {picked && <Check className="size-3.5" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {displayName(user)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[user.email, user.userTypes.join(', ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    {!user.hasPush && (
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-muted-foreground">
                        {t('peopleNoPush')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <label className="flex cursor-pointer items-center gap-2 border-t px-4 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={includeUnreachable}
                onChange={(event) => setIncludeUnreachable(event.target.checked)}
              />
              {t('peopleShowAll')}
            </label>
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground">{t('peopleHelper')}</p>
    </div>
  );
}
