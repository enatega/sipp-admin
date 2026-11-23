'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ApiErrorResponse,
  AudienceUser,
  SendNotificationPayload,
  SendNotificationResponse,
} from '@/types';
import { Form, Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { handleApiError } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import {
  useAudiencePreview,
  useSendNotification,
} from '@/hooks/api/super-admin/general/notifications';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import AudienceReach from './AudienceReach';
import GroupCards from './GroupCards';
import PhonePreview from './PhonePreview';
import SendBar from './SendBar';
import SendResult from './SendResult';
import SpecificPeople from './SpecificPeople';
import ZoneFilter from './ZoneFilter';
import {
  AUDIENCE_GROUPS,
  AudienceGroup,
  ZoneMode,
  toServerGroups,
} from './audience';
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from './use-notification-draft';

interface SendNotificationFormProps {
  onClose: () => void;
}

interface SendNotificationFormValues {
  title: string;
  description: string;
  groups: AudienceGroup[];
  zoneMode: ZoneMode;
  zoneIds: string[];
  people: AudienceUser[];
  imageUrl: string;
  deepLink: string;
}

type Phase = 'edit' | 'confirm' | 'sending' | 'result';

const emptyValues: SendNotificationFormValues = {
  title: '',
  description: '',
  groups: [],
  zoneMode: 'all',
  zoneIds: [],
  people: [],
  imageUrl: '',
  deepLink: '',
};

// Past this many devices a send is confirmed even when it is zone-filtered.
const CONFIRM_DEVICE_THRESHOLD = 50;

// The customer website and app open exactly two kinds of address: a store or an order. Anything else would be ignored
// by both, so it is refused here instead of being sent as a push that does nothing.
const deepLinkRegex = /^\/(restaurants\/[A-Za-z0-9_-]{1,100}|orders\/[0-9a-f-]{36})(\?[^\s#]*)?$/;

const buildPayload = (
  values: SendNotificationFormValues,
): SendNotificationPayload => {
  const imageUrl = values.imageUrl.trim();
  const deepLink = values.deepLink.trim();
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    userTypes: values.groups.length ? toServerGroups(values.groups) : undefined,
    image_url: imageUrl || undefined,
    deep_link: deepLink || undefined,
    zoneIds:
      values.zoneMode === 'zones' && values.zoneIds.length
        ? values.zoneIds
        : undefined,
    userIds: values.people.length
      ? values.people.map((person) => person.id)
      : undefined,
  };
};

function SendNotificationFormBody({
  onClose,
  draftRestored,
}: {
  onClose: () => void;
  draftRestored: boolean;
}) {
  const t = useTranslations('notifications');
  const tForm = useTranslations('notifications.form');
  const tComposer = useTranslations('notifications.composer');
  const { values, errors, touched, setFieldValue, setTouched, validateForm, resetForm } =
    useFormikContext<SendNotificationFormValues>();
  const { mutateAsync: sendNotification, isPending } = useSendNotification();
  const { data: zones } = useGetZonesSimple();

  const [phase, setPhase] = useState<Phase>('edit');
  const [response, setResponse] = useState<SendNotificationResponse>();
  const [showDraftNotice, setShowDraftNotice] = useState(draftRestored);

  const hasSelection = values.groups.length > 0 || values.people.length > 0;
  const zonePending = values.zoneMode === 'zones' && values.zoneIds.length === 0;

  const previewPayload = useMemo(
    () => ({
      userTypes: values.groups.length ? toServerGroups(values.groups) : undefined,
      zoneIds: values.zoneMode === 'zones' ? values.zoneIds : undefined,
      userIds: values.people.length
        ? values.people.map((person) => person.id)
        : undefined,
    }),
    [values.groups, values.zoneMode, values.zoneIds, values.people],
  );
  const debouncedPayload = useDebouncedValue(previewPayload, 400);
  const {
    data: preview,
    isFetching,
    isError,
  } = useAudiencePreview(debouncedPayload, !zonePending);

  // The numbers on screen belong to the audience on screen only once the
  // debounced request has caught up with the selection and has finished.
  const settled =
    !isFetching &&
    JSON.stringify(debouncedPayload) === JSON.stringify(previewPayload);
  const reachKnown = hasSelection && !zonePending && !isError && !!preview && settled;
  const devices = reachKnown ? preview.pushEnabled : 0;
  const calculating = hasSelection && !zonePending && !isError && !settled;
  const nobodyReachable = reachKnown && preview.pushEnabled === 0;

  const everyoneEverywhere =
    values.groups.length === AUDIENCE_GROUPS.length && values.zoneMode === 'all';
  const needsConfirm = everyoneEverywhere || devices > CONFIRM_DEVICE_THRESHOLD;

  // Keep a draft so closing the drawer by accident doesn't lose the message.
  const draftSnapshot = useMemo(
    () => ({
      title: values.title,
      description: values.description,
      groups: values.groups,
      zoneMode: values.zoneMode,
      zoneIds: values.zoneIds,
      people: values.people,
      imageUrl: values.imageUrl,
      deepLink: values.deepLink,
    }),
    [values],
  );
  const debouncedDraft = useDebouncedValue(draftSnapshot, 600);
  useEffect(() => {
    if (phase === 'edit') saveDraft(debouncedDraft);
  }, [debouncedDraft, phase]);

  const summary = useMemo(() => {
    if (!hasSelection) return tComposer('summaryNone');
    const names = values.groups.map((group) => tComposer(`groups.${group}`)).join(' + ');
    const where =
      values.zoneMode === 'all'
        ? tComposer('everywhere')
        : values.zoneIds
            .map((id) => zones?.find((zone) => zone.id === id)?.title)
            .filter(Boolean)
            .join(' + ') || tComposer('noZonePicked');
    const people = values.people.length
      ? tComposer('summaryPeople', { count: values.people.length })
      : '';
    return [names && `${names} · ${where}`, people].filter(Boolean).join(' + ');
  }, [hasSelection, values.groups, values.zoneMode, values.zoneIds, values.people, zones, tComposer]);

  /** Blocks on unfinished fields, marking them so the errors show. */
  const isValid = async () => {
    const found = await validateForm();
    if (Object.keys(found).length === 0) return true;
    await setTouched({
      title: true,
      description: true,
      groups: true,
      zoneIds: true,
      imageUrl: true,
      deepLink: true,
    });
    return false;
  };

  const send = async () => {
    setResponse(undefined);
    setPhase('sending');
    try {
      const result = await sendNotification(buildPayload(values));
      setResponse(result);
      setPhase('result');
      if (result.sentCount > 0) clearDraft();
    } catch (error) {
      setPhase('edit');
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleSend = async () => {
    if (!(await isValid())) return;
    if (needsConfirm) setPhase('confirm');
    else await send();
  };

  const startNew = () => {
    clearDraft();
    resetForm({ values: emptyValues });
    setResponse(undefined);
    setShowDraftNotice(false);
    setPhase('edit');
  };

  const groupsError =
    touched.groups && typeof errors.groups === 'string' ? errors.groups : undefined;
  const zonesError =
    touched.zoneIds && typeof errors.zoneIds === 'string' ? errors.zoneIds : undefined;

  const sendLabel = calculating
    ? tComposer('calculating')
    : reachKnown
      ? tComposer('sendTo', { count: devices })
      : t('send');

  return (
    <Form className="space-y-4">
      {showDraftNotice && phase === 'edit' && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          <span>{tComposer('draftRestored')}</span>
          <button
            type="button"
            className="font-medium underline"
            onClick={startNew}
          >
            {tComposer('draftDiscard')}
          </button>
        </div>
      )}

      <fieldset disabled={phase !== 'edit'} className="contents">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-4">
            <section className="space-y-3 rounded-xl border border-stroke bg-white p-4">
              <h3 className="text-[15px] font-medium">{tComposer('messageStep')}</h3>
              <AppInputField
                label={tForm('title')}
                name="title"
                placeholder={tForm('titlePlaceholder')}
                requiredAsterisk
              />
              <AppTextarea
                label={tForm('description')}
                name="description"
                placeholder={tForm('descriptionPlaceholder')}
                requiredAsterisk
                rows={3}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <AppInputField
                  label={tForm('imageUrl')}
                  name="imageUrl"
                  placeholder={tForm('imageUrlPlaceholder')}
                />
                <AppInputField
                  label={tForm('deepLink')}
                  name="deepLink"
                  placeholder={tForm('deepLinkPlaceholder')}
                />
              </div>
            </section>

            <section className="space-y-5 rounded-xl border border-stroke bg-white p-4">
              <GroupCards
                selected={values.groups}
                onChange={(groups) => setFieldValue('groups', groups)}
                catalog={preview?.catalog}
                error={groupsError}
              />
              <div
                className={cn(
                  'transition-opacity',
                  values.groups.length === 0 && 'opacity-50',
                )}
              >
                <ZoneFilter
                  mode={values.zoneMode}
                  zoneIds={values.zoneIds}
                  onModeChange={(mode) => setFieldValue('zoneMode', mode)}
                  onZonesChange={(zoneIds) => setFieldValue('zoneIds', zoneIds)}
                  error={zonesError}
                />
              </div>
              <SpecificPeople
                people={values.people}
                onChange={(people) => setFieldValue('people', people)}
              />
            </section>
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
            <AudienceReach
              preview={preview}
              settled={settled}
              isError={isError}
              hasSelection={hasSelection}
              zonePending={zonePending}
              zonesSelected={values.zoneMode === 'zones' && values.zoneIds.length > 0}
              customersSelected={values.groups.includes('customer')}
              onRemoveZoneFilter={() => setFieldValue('zoneMode', 'all')}
            />
            <PhonePreview
              title={values.title}
              description={values.description}
              groups={values.groups}
            />
          </aside>
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-stroke bg-white p-4">
        {phase === 'sending' || phase === 'result' ? (
          <SendResult
            devices={devices}
            response={response}
            onBackToEdit={() => setPhase('edit')}
            onNew={startNew}
            onClose={onClose}
          />
        ) : (
          <SendBar
            summary={summary}
            devices={devices}
            sendLabel={sendLabel}
            confirming={phase === 'confirm'}
            isPending={isPending}
            sendDisabled={nobodyReachable || calculating}
            onSend={handleSend}
            onConfirm={send}
            onBack={() => setPhase('edit')}
          />
        )}
      </div>
    </Form>
  );
}

export default function SendNotificationForm({
  onClose,
}: SendNotificationFormProps) {
  const tForm = useTranslations('notifications.form');
  const [draft] = useState(loadDraft);

  const initialValues: SendNotificationFormValues = draft ?? emptyValues;

  const sendNotificationSchema = Yup.object().shape({
    title: Yup.string().trim().required(tForm('validation.titleRequired')),
    description: Yup.string().trim().required(tForm('validation.descriptionRequired')),
    // Groups are optional once individual people are added.
    groups: Yup.array().when('people', ([people], schema) =>
      (people as unknown[] | undefined)?.length
        ? schema
        : schema.min(1, tForm('validation.audienceRequired')),
    ),
    zoneMode: Yup.string().optional(),
    zoneIds: Yup.array().when('zoneMode', ([zoneMode], schema) =>
      zoneMode === 'zones' ? schema.min(1, tForm('validation.zoneRequired')) : schema,
    ),
    people: Yup.array().optional(),
    imageUrl: Yup.string().url(tForm('validation.imageUrlValid')).optional(),
    deepLink: Yup.string()
      .trim()
      .test(
        'deep-link-format',
        tForm('validation.deepLinkValid'),
        (value) => !value || deepLinkRegex.test(value),
      )
      .optional(),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={sendNotificationSchema}
      onSubmit={() => undefined}
    >
      <SendNotificationFormBody onClose={onClose} draftRestored={!!draft} />
    </Formik>
  );
}
