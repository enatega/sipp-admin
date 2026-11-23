'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getFirstAccessibleRoute } from '@/config/sidebar';
import { hasRoutePermission } from '@/lib/user';
import { AppButton } from '@/components/shared/AppButton';

// Renders inside the admin layout so a blocked page keeps the sidebar and
// header, letting the user move on to a page their role can open.
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (hasRoutePermission(pathname)) return <>{children}</>;

  return <PageAccessDenied />;
}

function PageAccessDenied() {
  const router = useRouter();
  const t = useTranslations('noPermission.page');
  const firstAccessibleRoute = getFirstAccessibleRoute();

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
      <div
        role="alert"
        className="mx-auto w-full max-w-md rounded-xl border border-destructive/30 bg-background p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('description')}
        </p>
        {firstAccessibleRoute !== '/' ? (
          <AppButton
            className="mt-6"
            onClick={() => router.replace(firstAccessibleRoute)}
          >
            {t('goToAccessiblePage')}
          </AppButton>
        ) : null}
      </div>
    </div>
  );
}
