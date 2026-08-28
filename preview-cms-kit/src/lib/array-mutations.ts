import { getByPath, setByPath } from './content-edit/paths';
import type { SiteContentDraft } from './content-edit/EditProvider';
import type { SiteContentLocaleDto } from '../types/site-content';

export function applyArrayPush(
  draft: SiteContentDraft,
  locale: SiteContentLocaleDto,
  path: string,
  template: unknown,
): SiteContentDraft {
  const localeData = draft[locale] ?? {};
  const current = getByPath(localeData, path);
  if (!Array.isArray(current)) return draft;
  return {
    ...draft,
    [locale]: setByPath(localeData, path, [...current, template]),
  };
}

export function applyArrayRemove(
  draft: SiteContentDraft,
  locale: SiteContentLocaleDto,
  path: string,
  index: number,
): SiteContentDraft {
  const localeData = draft[locale] ?? {};
  const current = getByPath(localeData, path);
  if (!Array.isArray(current) || index < 0 || index >= current.length) return draft;
  return {
    ...draft,
    [locale]: setByPath(
      localeData,
      path,
      current.filter((_, i) => i !== index),
    ),
  };
}
