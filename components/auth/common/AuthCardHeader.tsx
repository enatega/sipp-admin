'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAdminBranding } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { toAbsoluteUrl } from '@/lib/helpers';

interface Props {
  title: string;
  description: string;
}

const AuthCardHeader = ({ title, description }: Props) => {
  const {
    logo,
    appName,
    appNameClassName,
    isLoading: isBrandingLoading,
  } = useAdminBranding();
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  return (
    <div>
      <div className="w-full flex items-center justify-center mb-4">
        <div className="h-[76px] w-full max-w-[280px] relative mx-auto">
          {isBrandingLoading ? (
            <div className="h-full w-full rounded bg-muted animate-pulse" />
          ) : !logo || failedLogoSrc === logo ? (
            <span
              className={`flex h-full w-full items-center justify-center text-center whitespace-nowrap ${appNameClassName}`}
            >
              {appName}
            </span>
          ) : (
            <Image
              src={toAbsoluteUrl(logo)}
              fill
              alt={appName}
              className="object-contain object-center scale-150"
              priority
              unoptimized={!!logo}
              onError={() => setFailedLogoSrc(logo)}
            />
          )}
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-center">{title}</h1>
      <p className="text-center text-sm text-mute mt-1">{description}</p>
    </div>
  );
};

export default AuthCardHeader;
