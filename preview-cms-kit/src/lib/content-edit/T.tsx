'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '../cn';
import { useContent } from './useContent';

type TProps = {
  path: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

function EditableField({
  value,
  onChange,
  as: Tag,
  className,
  multiline,
}: {
  value: string;
  onChange: (value: string) => void;
  as: ElementType;
  className?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const commit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = (el.textContent ?? '').replace(/\s+/g, (m, offset, str) => {
      if (multiline) return m;
      return offset === 0 || offset + m.length === str.length ? '' : ' ';
    });
    if (next !== value) onChange(next);
  }, [multiline, onChange, value]);

  const onBlur = useCallback(
    (e: FocusEvent<HTMLElement>) => {
      commit();
      void e;
    },
    [commit],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!multiline && e.key === 'Enter') {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    [multiline],
  );

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Campo editable"
      className={cn(
        'outline-none ring-0 transition-[box-shadow,background-color]',
        'rounded-sm border border-dashed border-blue-400/50',
        'hover:border-blue-500/70 focus:border-blue-500 focus:bg-blue-500/5',
        'cursor-text min-w-[1ch]',
        className,
      )}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}

/** Texto: plano en el sitio, editable inline en el editor. */
export function T({ path, as: Tag = 'span', className, multiline }: TProps) {
  const { text, setText, isEditing } = useContent();
  const value = text(path);

  if (!isEditing) {
    if (!value) return null;
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <EditableField
      value={value}
      onChange={(v) => setText(path, v)}
      as={Tag}
      className={className}
      multiline={multiline}
    />
  );
}
