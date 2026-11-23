'use client';

import { useEffect, useState } from 'react';
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

interface EditStaticPageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageData: StaticPage;
}

export default function EditStaticPageDrawer({
  isOpen,
  onClose,
  pageData,
}: EditStaticPageDrawerProps) {
  const t = useTranslations('settings.staticPages.drawers');
  const [previewData, setPreviewData] = useState<StaticPage | undefined>();

  useEffect(() => {
    if (!pageData) return;

    const t = setTimeout(() => {
      setPreviewData((prev) => ({
        ...(prev ?? {}),
        ...pageData,
      }));
    }, 0);

    return () => clearTimeout(t);
  }, [pageData]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999]" onClick={onClose} />
      )}

      <StaticPagePreviewPortal
        data={previewData}
        open={isOpen}
        onClose={onClose}
      />

      <Sheet
        open={isOpen}
        modal={false}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          onInteractOutside={(e) => {
            const previewExists = !!document.querySelector('.preview-panel');
            if (previewExists) {
              e.preventDefault();
            }
          }}
          className="w-full sm:max-w-xl h-full px-4 py-6 z-[1000]"
        >
          <SheetHeader className="mb-5 p-0">
            <SheetTitle>
              <Heading title={t('editTitle')} />
            </SheetTitle>
          </SheetHeader>

          <div className="h-full overflow-auto">
            <StaticPageForm
              onClose={onClose}
              setPreviewData={setPreviewData}
              initialData={pageData}
              isEdit
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
