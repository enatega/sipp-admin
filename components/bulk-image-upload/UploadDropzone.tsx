'use client';

import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { cn } from '@/lib/utils';
import { BULK_IMAGE_ACCEPT_ATTR, BULK_IMAGE_MAX_FILES } from '@/lib/bulk-image-upload/api';

interface Props {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

export function UploadDropzone({ disabled, onFiles }: Props) {
  const t = useTranslations('bulkImageUpload.dropzone');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud size={28} />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          {disabled ? t('busy') : t('title')}
        </p>
        <p className="mt-1 text-sm text-mute">
          {t('rules', { max: BULK_IMAGE_MAX_FILES })}
        </p>
      </div>
      <AppButton
        type="button"
        leftIcon={<ImagePlus size={16} />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {t('select')}
      </AppButton>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={BULK_IMAGE_ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}
