'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from 'next-intl';

// Permission badge colors - professional and accessible palette
const PERMISSION_COLORS = [
  'bg-indigo-900',
  'bg-indigo-800',
  'bg-emerald-900',
  'bg-gray-800',
  'bg-sky-800',
  'bg-teal-800',
  'bg-fuchsia-800',
];

interface RolePermissionsCellProps {
  permissions: string[];
  maxDisplay?: number;
}

export function RolePermissionsCell({
  permissions,
  maxDisplay = 6,
}: RolePermissionsCellProps) {
  const t = useTranslations('roleAndPermissions.table');
  if (!permissions || permissions.length === 0) {
    return <span className="text-muted-foreground">{t('notAvailable')}</span>;
  }

  const getInitials = (permission: string) => {
    return permission
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderPermissionBadge = (permission: string, index: number) => {
    const initials = getInitials(permission);
    const bgColor = PERMISSION_COLORS[index % PERMISSION_COLORS.length];

    return (
      <div key={index} className="group relative" title={permission}>
        <Avatar
          className={`size-8 cursor-pointer ring-2 ring-background hover:z-10 hover:scale-110 transition-transform ${bgColor}`}
        >
          <AvatarFallback
            className={`text-xs font-semibold text-white ${bgColor}`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
          {permission
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
        </div>
      </div>
    );
  };

  if (permissions.length <= maxDisplay) {
    return (
      <div className="flex -space-x-2">
        {permissions.map((permission, index) =>
          renderPermissionBadge(permission, index),
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {permissions
          .slice(0, maxDisplay)
          .map((permission, index) => renderPermissionBadge(permission, index))}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Avatar className="size-8 cursor-pointer transition-transform hover:scale-110 bg-mute -ml-2">
            <AvatarFallback className="text-xs bg-mute text-white font-semibold">
              +{permissions.length - maxDisplay}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <div>
            <h4 className="font-semibold text-sm border-b px-4 py-3">
              {t('allPermissions')} ({permissions.length})
            </h4>
            <div className="space-y-2 max-h-[280px] overflow-y-auto p-3">
              {permissions.map((permission, index) => {
                const initials = getInitials(permission);
                const bgColor =
                  PERMISSION_COLORS[index % PERMISSION_COLORS.length];

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar className={`size-9 ${bgColor}`}>
                      <AvatarFallback
                        className={`text-sm font-semibold text-white ${bgColor}`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">
                      {permission
                        .split('_')
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(' ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
