'use client';

import * as React from 'react';
import {
  FormikContext,
  getIn,
  type FormikContextType,
  type FormikValues,
} from 'formik';
import { Maximize2, UploadCloud, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AppFileInputProps = {
  name: string;
  label?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  dropAreaClassName?: string;
  previewClassName?: string;
  maxSizeMB?: number;
  acceptTypes?: string[];
  requiredAsterisk?: boolean;
  showErrorStrategy?: ErrorStrategy;
  disabled?: boolean;
  onFileSelected?: (file: File | null) => void;
  previewHeight?: number;
  showClearButton?: boolean;
  previewUrl?: string;
  invalidFileTypeMessage?: string;
  currentValueLabel?: string;
  dropzoneText?: string;
  browseText?: string;
  allowedTypesLabel?: string;
  nonImagePreviewBadgeLabel?: string;
  nonImagePreviewDescription?: string;
};

const DEFAULT_ACCEPT = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.jfif',
];

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'jfif',
  'webp',
  'svg',
  'gif',
  'bmp',
  'avif',
]);

const MIME_EXTENSION_MAP: Record<string, string[]> = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg', 'jfif'],
  'image/jpg': ['jpg', 'jpeg', 'jfif'],
  'image/webp': ['webp'],
  'image/svg+xml': ['svg'],
  'image/gif': ['gif'],
  'image/bmp': ['bmp'],
  'image/avif': ['avif'],
};

const normalizeAcceptType = (type: string) => type.trim().toLowerCase();

const getFileNameFromValue = (value?: string | null) => {
  if (!value) return '';
  const cleanValue = value.split('#')[0]?.split('?')[0] ?? value;
  return cleanValue.split('/').pop() ?? cleanValue;
};

const getFileExtension = (value?: string | null) => {
  const fileName = getFileNameFromValue(value);
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  return extension?.toLowerCase() ?? '';
};

const getAllowedExtensions = (acceptTypes: string[]) => {
  const extensions = new Set<string>();

  acceptTypes.map(normalizeAcceptType).forEach((type) => {
    if (!type) return;

    if (type.startsWith('.')) {
      extensions.add(type.slice(1));
      return;
    }

    MIME_EXTENSION_MAP[type]?.forEach((extension) => {
      extensions.add(extension);
    });
  });

  return extensions;
};

const fileMatchesAcceptedType = (file: File, acceptTypes: string[]) => {
  const normalizedAcceptTypes = acceptTypes.map(normalizeAcceptType);
  const fileType = file.type.toLowerCase();
  const fileExtension = getFileExtension(file.name);
  const allowedExtensions = getAllowedExtensions(normalizedAcceptTypes);

  const mimeAllowed = normalizedAcceptTypes.some((acceptType) => {
    if (!acceptType || acceptType.startsWith('.')) return false;
    if (acceptType.endsWith('/*')) {
      const category = acceptType.slice(0, acceptType.indexOf('/'));
      return fileType.startsWith(`${category}/`);
    }
    return acceptType === fileType;
  });

  if (allowedExtensions.size === 0) {
    return mimeAllowed;
  }

  return mimeAllowed && allowedExtensions.has(fileExtension);
};

const getDisplayLabelForAcceptType = (type: string) =>
  type.startsWith('.')
    ? type.slice(1).toUpperCase()
    : (type.split('/')[1] ?? type).toUpperCase();

const getUniqueAllowedTypesLabel = (acceptTypes: string[]) =>
  Array.from(
    new Set(acceptTypes.map((type) => getDisplayLabelForAcceptType(type))),
  ).join(', ');

export const AppFileInput: React.FC<AppFileInputProps> = ({
  name,
  label,
  helperText,
  className,
  labelClassName,
  dropAreaClassName,
  previewClassName,
  maxSizeMB = 5,
  acceptTypes = DEFAULT_ACCEPT,
  requiredAsterisk,
  showErrorStrategy = 'touchedOrSubmit',
  disabled,
  onFileSelected,
  previewHeight = 128,
  showClearButton = true,
  previewUrl,
  invalidFileTypeMessage,
  currentValueLabel,
  dropzoneText,
  browseText,
  allowedTypesLabel,
  nonImagePreviewBadgeLabel,
  nonImagePreviewDescription,
}) => {
  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );

  if (!formik) {
    throw new Error('AppFileInput must be used inside a Formik form');
  }

  const t = useTranslations('appFileInput');
  const resolvedDropzoneText = dropzoneText ?? t('dragAndDrop');
  const resolvedBrowseText = browseText ?? t('browse');
  const resolvedInvalidFileTypeMessage =
    invalidFileTypeMessage ?? t('onlyImageFilesAllowed');
  const resolvedCurrentValueLabel =
    currentValueLabel ?? t('currentImageLabel');
  const resolvedAllowedTypesLabel =
    allowedTypesLabel ?? getUniqueAllowedTypesLabel(acceptTypes);
  const resolvedNonImagePreviewBadgeLabel =
    nonImagePreviewBadgeLabel ?? t('documentBadge');
  const resolvedNonImagePreviewDescription =
    nonImagePreviewDescription ?? t('uploadedFileReady');

  const inputId = React.useId();
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [isReading, setIsReading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const error = resolveFormikError(formik, name, showErrorStrategy);
  const currentValue = getIn(formik.values, name) as
    | File
    | string
    | null
    | undefined;

  React.useEffect(() => {
    const val = currentValue;
    if (val instanceof File) {
      const url = URL.createObjectURL(val);
      setPreviewSrc(url);
      setIsReading(false);
      setProgress(100);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    if (typeof val === 'string' && val.trim()) {
      setPreviewSrc(val);
      setIsReading(false);
      setProgress(100);
      return;
    }

    if (!val && previewUrl) {
      setPreviewSrc(previewUrl);
      setIsReading(false);
      setProgress(100);
      return;
    }

    if (!val) {
      setPreviewSrc(null);
      setProgress(0);
      setIsReading(false);
    }
  }, [currentValue, previewUrl]);

  const acceptAttr = acceptTypes.join(',');
  const currentFileName =
    currentValue instanceof File
      ? currentValue.name
      : typeof currentValue === 'string' && currentValue.trim()
        ? getFileNameFromValue(currentValue) || 'Uploaded file'
        : getFileNameFromValue(previewUrl) || 'Uploaded file';

  const isImagePreview =
    (currentValue instanceof File && currentValue.type.startsWith('image/')) ||
    (typeof currentValue === 'string' &&
      currentValue.trim().length > 0 &&
      IMAGE_EXTENSIONS.has(getFileExtension(currentValue))) ||
    (!!previewUrl && IMAGE_EXTENSIONS.has(getFileExtension(previewUrl)));

  const validateFile = (file: File): boolean => {
    if (!fileMatchesAcceptedType(file, acceptTypes)) {
      toast.error(resolvedInvalidFileTypeMessage);
      return false;
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(t('fileTooLarge', { maxSize: maxSizeMB }));
      return false;
    }
    return true;
  };

  const readForPreview = (file: File) => {
    setIsReading(true);
    setProgress(0);
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      }
    };
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
      setIsReading(false);
      setProgress(100);
    };
    reader.onerror = () => {
      setIsReading(false);
      setProgress(0);
      toast.error(t('failedToLoadPreview'));
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (file: File | null) => {
    if (!file) {
      formik.setFieldValue(name, null);
      onFileSelected?.(null);
      return;
    }
    if (!validateFile(file)) return;

    formik.setFieldValue(name, file);
    readForPreview(file);
    onFileSelected?.(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    formik.setFieldValue(name, null);
    setPreviewSrc(null);
    setProgress(0);
    setIsReading(false);
    setOpen(false);
    onFileSelected?.(null);
  };

  const helperId = error || helperText ? `${inputId}-helper` : undefined;
  const isExistingImage =
    typeof currentValue === 'string' && currentValue.trim().length > 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label
          className={cn('text-[15px] font-medium', labelClassName)}
          htmlFor={inputId}
        >
          {label}
          {requiredAsterisk && <span className="ml-1 text-destructive">*</span>}
          {isExistingImage && !disabled && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({resolvedCurrentValueLabel})
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept={acceptAttr}
        className="hidden"
        disabled={disabled}
        onChange={onInputChange}
        onBlur={() => formik.setFieldTouched(name, true, true)}
      />

      <label
        htmlFor={inputId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        aria-describedby={helperId}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed p-5 text-sm transition',
          disabled && 'cursor-not-allowed opacity-60',
          error
            ? 'border-destructive'
            : isDragging
              ? 'border-primary bg-primary/5'
              : 'border-stroke hover:border-primary',
          dropAreaClassName,
        )}
      >
        <UploadCloud className="mb-2 h-6 w-6" />
        <span className="font-medium">
          {resolvedDropzoneText}{' '}
          <span className="underline">{resolvedBrowseText}</span>
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          {t('allowed')}: {resolvedAllowedTypesLabel} •{t('max')} {maxSizeMB}MB
        </span>

        {previewSrc && (
          <div
            className={cn(
              'relative mt-4 w-full max-w-sm overflow-hidden rounded-lg border bg-white',
              previewClassName,
            )}
            style={{ height: previewHeight }}
          >
            {isImagePreview ? (
              <button
                type="button"
                aria-label={t('openFullSizePreview')}
                className="group absolute inset-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt={t('preview')}
                  className="h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium opacity-0 shadow group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" />
                    {t('view')}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {resolvedNonImagePreviewBadgeLabel}
                </div>
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {currentFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resolvedNonImagePreviewDescription}
                </p>
              </div>
            )}

            {showClearButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
                aria-label={t('removeFile')}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isReading && (
              <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10">
                <div
                  className="h-1 bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </label>

      {(error || helperText) && (
        <p
          id={helperId}
          className={cn(
            'text-sm',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {error ?? helperText}
        </p>
      )}

      <Dialog open={open && isImagePreview} onOpenChange={setOpen}>
        <DialogContent className="z-[1000] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>{t('preview')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('fullPreview')}
            </DialogDescription>
          </DialogHeader>

          {previewSrc ? (
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={t('fullPreview')}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t('noPreviewAvailable')}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
