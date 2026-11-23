import * as yup from 'yup';

type ValidationTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

const IMAGE_ACCEPT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

const LOGO_ACCEPT_TYPES = [...IMAGE_ACCEPT_TYPES, 'image/svg+xml'] as const;

export const DEFAULT_MEDIA_MAX_FILE_SIZE_MB = 5;
export const PROMOTIONAL_BANNER_MAX_FILE_SIZE_MB = 50;
export const PROMOTIONAL_BANNER_ACCEPT_TYPES = [
  ...IMAGE_ACCEPT_TYPES,
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
] as const;

export interface AppSettingsFormValues {
  logo: File | string | null;
  splashImage: File | string | null;
  maintenanceImage: File | string | null;
  promotionalBanner: File | string | null;
  maintenanceEnabled: boolean;
  maintenanceMessage: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const createFileSchema = ({
  acceptTypes,
  maxSizeMB,
  invalidTypeMessage,
  fileTooLargeMessage,
}: {
  acceptTypes: readonly string[];
  maxSizeMB: number;
  invalidTypeMessage: string;
  fileTooLargeMessage: string;
}) =>
  yup
    .mixed<File | string>()
    .nullable()
    .test('fileType', invalidTypeMessage, (value) => {
      if (!value || typeof value === 'string') return true;
      return acceptTypes.includes(value.type);
    })
    .test('fileSize', fileTooLargeMessage, (value) => {
      if (!value || typeof value === 'string') return true;
      return value.size <= maxSizeMB * 1024 * 1024;
    });

export const createAppSettingsSchema = (t: ValidationTranslator) =>
  yup.object({
    logo: createFileSchema({
      acceptTypes: LOGO_ACCEPT_TYPES,
      maxSizeMB: DEFAULT_MEDIA_MAX_FILE_SIZE_MB,
      invalidTypeMessage: t('invalidImageType'),
      fileTooLargeMessage: t('imageFileTooLarge', {
        maxSize: DEFAULT_MEDIA_MAX_FILE_SIZE_MB,
      }),
    }),

    splashImage: createFileSchema({
      acceptTypes: IMAGE_ACCEPT_TYPES,
      maxSizeMB: DEFAULT_MEDIA_MAX_FILE_SIZE_MB,
      invalidTypeMessage: t('invalidImageType'),
      fileTooLargeMessage: t('imageFileTooLarge', {
        maxSize: DEFAULT_MEDIA_MAX_FILE_SIZE_MB,
      }),
    }),

    maintenanceImage: createFileSchema({
      acceptTypes: IMAGE_ACCEPT_TYPES,
      maxSizeMB: DEFAULT_MEDIA_MAX_FILE_SIZE_MB,
      invalidTypeMessage: t('invalidImageType'),
      fileTooLargeMessage: t('imageFileTooLarge', {
        maxSize: DEFAULT_MEDIA_MAX_FILE_SIZE_MB,
      }),
    }),

    promotionalBanner: createFileSchema({
      acceptTypes: PROMOTIONAL_BANNER_ACCEPT_TYPES,
      maxSizeMB: PROMOTIONAL_BANNER_MAX_FILE_SIZE_MB,
      invalidTypeMessage: t('promotionalBannerInvalidFileType'),
      fileTooLargeMessage: t('promotionalBannerFileTooLarge', {
        maxSize: PROMOTIONAL_BANNER_MAX_FILE_SIZE_MB,
      }),
    }),

    maintenanceEnabled: yup.boolean().default(false),

    maintenanceMessage: yup.string().max(500, t('maintenanceMessageMax')).optional(),

    primaryColor: yup
      .string()
      .default('#000000')
      .required(t('primaryColorRequired'))
      .matches(HEX_COLOR_REGEX, t('invalidHexColor')),

    secondaryColor: yup
      .string()
      .default('#000000')
      .required(t('secondaryColorRequired'))
      .matches(HEX_COLOR_REGEX, t('invalidHexColor')),

    tertiaryColor: yup
      .string()
      .default('#000000')
      .required(t('tertiaryColorRequired'))
      .matches(HEX_COLOR_REGEX, t('invalidHexColor')),
  });
