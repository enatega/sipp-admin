import { AudienceUser } from '@/types';
import { AudienceGroup, ZoneMode } from './audience';

const DRAFT_KEY = 'sipp-admin:notification-draft:v1';

export interface NotificationDraft {
  title: string;
  description: string;
  groups: AudienceGroup[];
  zoneMode: ZoneMode;
  zoneIds: string[];
  people: AudienceUser[];
  imageUrl: string;
  deepLink: string;
}

const isEmpty = (draft: NotificationDraft) =>
  !draft.title.trim() &&
  !draft.description.trim() &&
  !draft.groups.length &&
  !draft.people.length &&
  !draft.imageUrl.trim() &&
  !draft.deepLink.trim();

// Browser storage can be blocked or full; a draft is a convenience, never required.
export const loadDraft = (): NotificationDraft | null => {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<NotificationDraft>;
    if (typeof draft.title !== 'string' || typeof draft.description !== 'string') return null;
    return {
      title: draft.title,
      description: draft.description,
      groups: Array.isArray(draft.groups) ? draft.groups : [],
      zoneMode: draft.zoneMode === 'zones' ? 'zones' : 'all',
      zoneIds: Array.isArray(draft.zoneIds) ? draft.zoneIds : [],
      people: Array.isArray(draft.people) ? draft.people : [],
      imageUrl: draft.imageUrl ?? '',
      deepLink: draft.deepLink ?? '',
    };
  } catch {
    return null;
  }
};

export const saveDraft = (draft: NotificationDraft) => {
  try {
    if (isEmpty(draft)) window.localStorage.removeItem(DRAFT_KEY);
    else window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
};

export const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
};
