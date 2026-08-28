"use client";

import { useCallback } from "react";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import { getByPath } from "./paths";
import { useEditOptional } from "./EditProvider";

export function useContent() {
  const { dictionary: t } = useLandingContent();
  const edit = useEditOptional();

  const text = useCallback(
    (path: string): string => {
      const value = getByPath(t, path);
      return typeof value === "string" ? value : "";
    },
    [t],
  );

  const bool = useCallback(
    (path: string): boolean | undefined => {
      const value = getByPath(t, path);
      return typeof value === "boolean" ? value : undefined;
    },
    [t],
  );

  const setText = useCallback(
    (path: string, value: string) => {
      edit?.setText(path, value);
    },
    [edit],
  );

  const setValue = useCallback(
    (path: string, value: unknown) => {
      edit?.setValue(path, value);
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
    bool,
    setText,
    setValue,
    pushArrayItem,
    removeArrayItem,
    isEditing: edit?.isEditing ?? false,
    suppressNavigation: edit?.suppressNavigation ?? false,
  };
}
