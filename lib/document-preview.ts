export const normalizePreviewSource = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  if (!trimmed || /^(n\/a|null|undefined)$/i.test(trimmed)) return null;
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed) || /^blob:/i.test(trimmed))
    return trimmed;
  return `/${trimmed.replace(/^\/+/, '')}`;
};
