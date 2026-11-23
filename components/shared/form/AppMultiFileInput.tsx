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
import { useObjectUrls } from '@/hooks/use-object-urls';
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

type AppMultiFileInputProps = {
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
  previewHeight?: number;
  invalidFileTypeMessage?: string;
  dropzoneText?: string;
  browseText?: string;
  allowedTypesLabel?: string;
  syncPrimaryFieldName?: string;
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

const getPreviewKey = (value: File | string, index: number) =>
  value instanceof File
    ? `file-${index}-${value.name}-${value.size}-${value.lastModified}`
    : `url-${index}-${value}`;

type PreviewItem = {
  key: string;
  src: string;
  alt: string;
};

export const AppMultiFileInput: React.FC<AppMultiFileInputProps> = ({
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
  previewHeight = 128,
  invalidFileTypeMessage,
  dropzoneText,
  browseText,
  allowedTypesLabel,
  syncPrimaryFieldName,
}) => {
  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );

  if (!formik) {
    throw new Error('AppMultiFileInput must be used inside a Formik form');
  }

  const t = useTranslations('appFileInput');
  const resolvedDropzoneText = dropzoneText ?? t('dragAndDrop');
  const resolvedBrowseText = browseText ?? t('browse');
  const resolvedInvalidFileTypeMessage =
    invalidFileTypeMessage ?? t('onlyImageFilesAllowed');
  const resolvedAllowedTypesLabel =
    allowedTypesLabel ?? getUniqueAllowedTypesLabel(acceptTypes);

  const inputId = React.useId();
  const error = resolveFormikError(formik, name, showErrorStrategy);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedPreview, setSelectedPreview] = React.useState<PreviewItem | null>(
    null,
  );

  const currentValue = getIn(formik.values, name) as
    | Array<File | string | null | undefined>
    | null
    | undefined;

  const values = React.useMemo(
    () =>
      Array.isArray(currentValue)
        ? currentValue.filter(
            (item): item is File | string =>
              item instanceof File ||
              (typeof item === 'string' && item.trim().length > 0),
          )
        : [],
    [currentValue],
  );

  const fileMap = React.useMemo(
    () =>
      values.reduce<Record<string, File>>((accumulator, value, index) => {
        if (value instanceof File) {
          accumulator[getPreviewKey(value, index)] = value;
        }
        return accumulator;
      }, {}),
    [values],
  );

  const objectUrls = useObjectUrls(fileMap);

  const previews = React.useMemo<PreviewItem[]>(
    () =>
      values
        .map((value, index) => {
          const key = getPreviewKey(value, index);
          const src = value instanceof File ? objectUrls[key] : value;

          if (!src) return null;

          return {
            key,
            src,
            alt:
              value instanceof File
                ? value.name
                : getFileNameFromValue(value) || `Image ${index + 1}`,
          };
        })
        .filter((item): item is PreviewItem => Boolean(item)),
    [objectUrls, values],
  );

  const setImages = React.useCallback(
    (nextImages: Array<File | string>) => {
      formik.setFieldValue(name, nextImages.length > 0 ? nextImages : null);
      if (syncPrimaryFieldName) {
        formik.setFieldValue(syncPrimaryFieldName, nextImages[0] ?? null);
      }
    },
    [formik, name, syncPrimaryFieldName],
  );

  const validateFile = React.useCallback(
    (file: File): boolean => {
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
    },
    [acceptTypes, maxSizeMB, resolvedInvalidFileTypeMessage, t],
  );

  const appendFiles = React.useCallback(
    (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter(validateFile);
      if (validFiles.length === 0) {
        return;
      }

      setImages([...values, ...validFiles]);
      formik.setFieldTouched(name, true, true);
    },
    [formik, name, setImages, validateFile, values],
  );

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      appendFiles(event.target.files);
    }
    event.target.value = '';
  };

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    if (event.dataTransfer.files?.length) {
      appendFiles(event.dataTransfer.files);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeAtIndex = (indexToRemove: number) => {
    const nextImages = values.filter((_, index) => index !== indexToRemove);
    setImages(nextImages);
    formik.setFieldTouched(name, true, true);
    if (selectedPreview && previews[indexToRemove]?.key === selectedPreview.key) {
      setSelectedPreview(null);
    }
  };

  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <label
          className={cn('text-[15px] font-medium', labelClassName)}
          htmlFor={inputId}
        >
          {label}
          {requiredAsterisk ? (
            <span className="ml-1 text-destructive">*</span>
          ) : null}
        </label>
      ) : null}

      <input
        id={inputId}
        type="file"
        multiple
        accept={acceptTypes.join(',')}
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
      </label>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {previews.map((preview, index) => (
            <div
              key={preview.key}
              className={cn(
                'relative overflow-hidden rounded-lg border bg-white',
                previewClassName,
              )}
              style={{ height: previewHeight }}
            >
              <button
                type="button"
                className="group absolute inset-0"
                onClick={() => setSelectedPreview(preview)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.src}
                  alt={preview.alt}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium opacity-0 shadow group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" />
                    {t('view')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  removeAtIndex(index);
                }}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
                aria-label={t('removeFile')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error || helperText ? (
        <p
          id={helperId}
          className={cn(
            'text-sm',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {error ?? helperText}
        </p>
      ) : null}

      <Dialog open={!!selectedPreview} onOpenChange={(open) => !open && setSelectedPreview(null)}>
        <DialogContent className="z-[1000] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>{t('preview')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('fullPreview')}
            </DialogDescription>
          </DialogHeader>

          {selectedPreview ? (
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreview.src}
                alt={selectedPreview.alt}
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
