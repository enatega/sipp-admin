'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  name: string;
  designation: string;
  email: string;
  image: string;
  fallback: string;
}

interface AssignedUsersCellProps {
  users: User[];
  maxDisplay?: number;
}

export function AssignedUsersCell({
  users,
  maxDisplay = 6,
}: AssignedUsersCellProps) {
  const t = useTranslations('roleAndPermissions.table');
  if (!users || users.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">{t('noUsersAssigned')}</span>
    );
  }

  return (
    <div className="flex items-center -space-x-1.5">
      {users.length <= maxDisplay ? (
        <>
          {users.map((user) => (
            <div key={user.id} className="group relative">
              <Avatar className="size-9 cursor-pointer ring-2 ring-background hover:z-10 hover:scale-110 transition-all bg-accent">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-xs bg-accent">
                  {user.fallback}
                </AvatarFallback>
              </Avatar>
              {/* Custom Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                {user.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {users.slice(0, maxDisplay - 1).map((user) => (
            <div key={user.id} className="group relative">
              <Avatar className="size-9 cursor-pointer ring-2 ring-background hover:z-10 hover:scale-110 transition-all bg-accent">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-xs bg-accent">
                  {user.fallback}
                </AvatarFallback>
              </Avatar>
              {/* Custom Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                {user.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
              </div>
            </div>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="size-9 cursor-pointer transition-transform hover:scale-110 bg-primary ring-2 ring-background">
                <AvatarFallback className="text-xs bg-primary text-white font-semibold">
                  +{users.length - (maxDisplay - 1)}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div>
                <h4 className="font-semibold text-sm border-b px-4 py-3">
                  {t('allAssignedUsers')} ({users.length})
                </h4>
                <div className="space-y-2 max-h-[280px] overflow-y-auto p-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar className="size-9 bg-accent">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-sm bg-accent">
                          {user.fallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}
