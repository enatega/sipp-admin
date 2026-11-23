'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { StaticPage } from '@/types';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';

interface PreviewProps {
  data?: StaticPage;
  open: boolean;
  onClose?: () => void;
  variant?: 'drawer' | 'modal';
}

export default function StaticPagePreviewPortal({
  data,
  open,
  onClose,
  variant = 'drawer',
}: PreviewProps) {
  const t = useTranslations('settings.staticPages.preview');
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  const bannerImage = data?.banner_image;

  const bannerUrl = useMemo(() => {
    if (!bannerImage) return null;
    if (typeof bannerImage === 'string') return bannerImage;
    return URL.createObjectURL(bannerImage);
  }, [bannerImage]);

  useEffect(() => {
    return () => {
      if (bannerUrl && data?.banner_image) {
        URL.revokeObjectURL(bannerUrl);
      }
    };
  }, [bannerUrl, data?.banner_image]);

  // ESC close (modal mode only)
  useEffect(() => {
    if (variant !== 'modal') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [variant, onClose]);

  if (!open) return null;

  const panelWidth = activeTab === 'mobile' ? 360 : 720;
  const panelHeight = activeTab === 'mobile' ? 550 : 650;

  const drawerPosition =
    activeTab === 'mobile' ? 'top-[8%] left-[20%]' : 'top-[8%] left-[8%]';

  const modalPosition = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

  return createPortal(
    <>
      {/* Backdrop for modal */}
      {variant === 'modal' && (
        <div className="fixed inset-0 bg-black/50 z-[999]" onClick={onClose} />
      )}

      <div
        className={clsx(
          'preview-panel  fixed shadow-xl rounded-lg z-[1000]',
          'flex flex-col  overflow-hidden',
          variant === 'modal' ? modalPosition : drawerPosition,
        )}
        style={{
          width: panelWidth,
          height: panelHeight,
          maxHeight: '90vh',
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header / Device Toggle Bar */}
        <div className="shrink-0 bg-primary text-white px-4 py-3 flex items-center justify-between">
          {/* Left — Title */}

          {/* Center — Device Toggle */}
          <div className="bg-[#E2E8F0] rounded-md p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('desktop')}
              className={clsx(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                'flex items-center gap-2',
                activeTab === 'desktop'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 ',
              )}
            >
              {t('desktop')}
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                'flex items-center gap-2',
                activeTab === 'mobile'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 ',
              )}
            >
              {t('mobile')}
            </button>
          </div>

          {/* Right — Close (modal only) */}

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-sm font-medium"
          >
            {t('closeButton')}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Banner */}
          <section
            className={clsx(
              'relative w-full ',
              activeTab === 'mobile' ? 'h-[170px]' : 'h-[200px]',
            )}
          >
            <Image
              src={bannerUrl ?? 'https://images.unsplash.com'}
              alt={t('bannerAlt')}
              fill
              className="object-cover"
              unoptimized
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 flex items-center justify-center h-full">
              <h1
                className={clsx(
                  'text-white font-bold text-center px-2',
                  activeTab === 'mobile' ? 'text-lg' : 'text-2xl',
                )}
              >
                {data?.page_name || t('defaultPageTitle')}
              </h1>
            </div>
          </section>

          {/* Content */}
          <section className="p-6 mt-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  data?.content ||
                  `<p>${t('defaultContentPlaceholder')}</p>`,
              }}
            />
          </section>
        </div>
      </div>
    </>,
    document.body,
  );
}
