'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, CircleUser, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { getUser, removeUser } from '@/lib/user';
import type { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { adminBrowserPush } from '@/lib/admin-operational-notifications';
import { getSocket } from '@/lib/socket';

export function UserDropdownMenu() {
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('userDropMenu');

  // Only load user data after component mounts (client-side only)
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    setUser(getUser());

    // Sync with localStorage changes across tabs
    const handleStorageChange = () => {
      setUser(getUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Don't render user-specific content until mounted
  if (!mounted) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                G
              </div>
              <ChevronDown size={16} />
            </div>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm">
              {user?.name
                ? user.name[0].toUpperCase()
                : user?.email[0].toUpperCase()
                  ? user.email[0].toUpperCase()
                  : 'G'}
            </div>
            <ChevronDown size={16} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[200px] p-0 rounded-xl overflow-hidden shadow-lg"
        >
          <DropdownMenuItem className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none">
            <CircleUser className="size-[18px]" />
            <span className="text-sm truncate">{user?.name || user?.email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
            onClick={() => setShowLogoutAlert(true)}
          >
            <LogOut className="size-[18px] text-help-red" />
            <span className="text-sm text-help-red">{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppAlertDialog
        className="!w-[850px]"
        title={t('logoutDialog.title')}
        subTitle={t('logoutDialog.subTitle')}
        description={t('logoutDialog.description')}
        open={showLogoutAlert}
        onOpenChange={(val) => setShowLogoutAlert(val)}
        variant="delete"
        confirmLabel={t('logoutDialog.confirmLabel')}
        onConfirm={async () => {
          setShowLogoutAlert(false);
          try { await adminBrowserPush.disable(); } catch { /* Logout must still complete. */ }
          getSocket('deliveries').disconnect();
          removeUser();
          toast.success(t('logoutDialog.logoutSuccess'));
          router.push('/login');
        }}
      />
    </>
  );
}
