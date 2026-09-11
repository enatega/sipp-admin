'use client';

import { useState } from 'react';
import { StaticPage } from '@/types';
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Heading } from '@/components/shared/Heading';
import { StaticPageForm } from './StaticPageForm';
import StaticPagePreviewPortal from './StaticPagePreviewPortal';

interface AddStaticPageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStaticPageDrawer({
  isOpen,
  onClose,
}: AddStaticPageDrawerProps) {
  const t = useTranslations('settings.staticPages.drawers');
  const [previewData, setPreviewData] = useState({
    page_name: '',
    slug: '',
    content: '',
    is_published: false,
    banner_image: null,
  } as StaticPage);

  return (
    <>
      {/* Mask */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[999]"
          onClick={() => onClose()}
        />
      )}

      {/* Preview */}
      <StaticPagePreviewPortal
        data={previewData}
        open={isOpen}
        onClose={onClose}
      />
      {/* Form */}
      <Sheet open={isOpen} modal={false} onOpenChange={onClose}>
        <SheetContent
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            // prevent close if click is inside preview portal
            if (target.closest('.preview-panel')) {
              e.preventDefault();
            }
          }}
          className="w-full sm:max-w-xl h-full  p-4 z-[1000]"
        >
          <SheetHeader className="mb-5 p-0">
            <SheetTitle>
              <Heading title={t('addTitle')} />
            </SheetTitle>
          </SheetHeader>

          <div className="h-full overflow-auto">
            <StaticPageForm setPreviewData={setPreviewData} onClose={onClose} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
