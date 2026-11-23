'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from 'next-intl';

const permissionLabel = (permission: string) =>
  permission
    .replace(/^deliver(y|ies)_/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

interface RolePermissionsCellProps {
  permissions: string[];
  maxDisplay?: number;
}

export function RolePermissionsCell({
  permissions,
  maxDisplay = 3,
}: RolePermissionsCellProps) {
  const t = useTranslations('roleAndPermissions.table');
  if (!permissions || permissions.length === 0) {
    return <span className="text-muted-foreground">{t('notAvailable')}</span>;
  }

  return (
    <div className="flex max-w-[420px] flex-wrap items-center gap-1.5">
      {permissions.slice(0, maxDisplay).map((permission) => (
        <span key={permission} title={permissionLabel(permission)} className="rounded-md border bg-muted px-2 py-1 text-xs font-medium text-foreground">
          {permissionLabel(permission)}
        </span>
      ))}
      {permissions.length > maxDisplay && <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={`${t('allPermissions')} (${permissions.length})`}>
            +{permissions.length - maxDisplay}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="start">
          <div>
            <h4 className="font-semibold text-sm border-b px-4 py-3">
              {t('allPermissions')} ({permissions.length})
            </h4>
            <div className="space-y-2 max-h-[280px] overflow-y-auto p-3">
              {permissions.map((permission) => (
                <div key={permission} className="rounded-md p-2 text-sm font-medium hover:bg-accent">
                  {permissionLabel(permission)}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>}
    </div>
  );
}
