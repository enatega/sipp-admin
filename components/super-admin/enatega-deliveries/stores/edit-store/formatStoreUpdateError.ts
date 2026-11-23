import { ApiErrorResponse } from '@/types';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

type FriendlyDetail = {
  message: string;
  fieldLabel?: string;
};

type StoreUpdateErrorFeedback = {
  details: string[];
  toastMessage: string;
};

const FIELD_MESSAGE_SPLIT_REGEX = /,(?=\s*[a-z_]+\s+(?:must|should)\b)/gi;

const toTitleCase = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getRawMessages = (error: ApiErrorResponse): string[] => {
  const collectMessages = (candidate: unknown) => {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      return trimmed ? [trimmed] : [];
    }

    return [];
  };

  const responseMessages = [
    ...collectMessages(error?.response?.data?.message),
    ...collectMessages(error?.response?.data?.data?.message),
  ];

  if (responseMessages.length > 0) {
    return responseMessages;
  }

  return collectMessages(error?.message);
};

const splitMessages = (messages: string[]): string[] =>
  messages
    .flatMap((message) =>
      message
        .split(/\r?\n/)
        .flatMap((line) => line.split(FIELD_MESSAGE_SPLIT_REGEX)),
    )
    .map((message) => message.trim().replace(/[,.]\s*$/, ''))
    .filter(Boolean);

const getFieldLabel = (field: string, t: TranslateFn) => {
  const fieldLabels: Record<string, string> = {
    base_fee: t('fieldLabels.base_fee'),
    per_km_fee: t('fieldLabels.per_km_fee'),
    free_delivery_threashold: t('fieldLabels.free_delivery_threashold'),
    free_delivery_threshold: t('fieldLabels.free_delivery_threshold'),
    packing_charges: t('fieldLabels.packing_charges'),
  };

  return fieldLabels[field] || toTitleCase(field);
};

const mapMessageToFriendlyDetail = (
  rawMessage: string,
  t: TranslateFn,
): FriendlyDetail => {
  const numericPattern =
    /^([a-z_]+)\s+must be a number conforming to the specified constraints$/i;
  const requiredPattern = /^([a-z_]+)\s+should not be empty$/i;
  const stringPattern = /^([a-z_]+)\s+must be a string$/i;
  const booleanPattern = /^([a-z_]+)\s+must be a boolean value$/i;

  const numericMatch = rawMessage.match(numericPattern);
  if (numericMatch?.[1]) {
    const fieldLabel = getFieldLabel(numericMatch[1], t);
    return {
      message: t('messages.number', { field: fieldLabel }),
      fieldLabel,
    };
  }

  const requiredMatch = rawMessage.match(requiredPattern);
  if (requiredMatch?.[1]) {
    const fieldLabel = getFieldLabel(requiredMatch[1], t);
    return {
      message: t('messages.required', { field: fieldLabel }),
      fieldLabel,
    };
  }

  const stringMatch = rawMessage.match(stringPattern);
  if (stringMatch?.[1]) {
    const fieldLabel = getFieldLabel(stringMatch[1], t);
    return {
      message: t('messages.string', { field: fieldLabel }),
      fieldLabel,
    };
  }

  const booleanMatch = rawMessage.match(booleanPattern);
  if (booleanMatch?.[1]) {
    const fieldLabel = getFieldLabel(booleanMatch[1], t);
    return {
      message: t('messages.boolean', { field: fieldLabel }),
      fieldLabel,
    };
  }

  const fieldPrefixMatch = rawMessage.match(/^([a-z_]+)\b/i);
  if (fieldPrefixMatch?.[1]) {
    const fieldLabel = getFieldLabel(fieldPrefixMatch[1], t);
    return {
      message: t('messages.invalid', { field: fieldLabel }),
      fieldLabel,
    };
  }

  return { message: rawMessage };
};

export const formatStoreUpdateError = (
  error: ApiErrorResponse,
  t: TranslateFn,
): StoreUpdateErrorFeedback => {
  const rawMessages = splitMessages(getRawMessages(error));

  if (rawMessages.length === 0) {
    return {
      details: [t('genericDetail')],
      toastMessage: t('toastSummary'),
    };
  }

  const mappedDetails = rawMessages.map((message) =>
    mapMessageToFriendlyDetail(message, t),
  );

  const uniqueDetails = Array.from(
    new Set(mappedDetails.map((detail) => detail.message)),
  );
  const uniqueFields = Array.from(
    new Set(
      mappedDetails
        .map((detail) => detail.fieldLabel)
        .filter((fieldLabel): fieldLabel is string => Boolean(fieldLabel)),
    ),
  );

  const toastMessage =
    uniqueFields.length > 0
      ? t('toastFieldList', { fields: uniqueFields.join(', ') })
      : uniqueDetails[0] || t('toastSummary');

  return {
    details: uniqueDetails.length > 0 ? uniqueDetails : [t('genericDetail')],
    toastMessage,
  };
};
