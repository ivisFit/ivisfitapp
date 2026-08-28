'use client';

import { useCallback } from 'react';
import { getByPath } from './paths';
import { useContentDictionary } from '../../example/ContentProvider';
import { useEditOptional } from './EditProvider';

export function useContent() {
  const { t } = useContentDictionary();
  const edit = useEditOptional();

  const text = useCallback(
    (path: string): string => {
      const value = getByPath(t, path);
      return typeof value === 'string' ? value : '';
    },
    [t],
  );

  const setText = useCallback(
    (path: string, value: string) => {
      edit?.setText(path, value);
    },
    [edit],
  );

  const pushArrayItem = useCallback(
    (path: string, template: unknown) => {
      edit?.pushArrayItem(path, template);
    },
    [edit],
  );

  const removeArrayItem = useCallback(
    (path: string, index: number) => {
      edit?.removeArrayItem(path, index);
    },
    [edit],
  );

  return {
    text,
    setText,
    pushArrayItem,
    removeArrayItem,
    isEditing: edit?.isEditing ?? false,
    suppressNavigation: edit?.suppressNavigation ?? false,
  };
}
