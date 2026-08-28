'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { useContent } from './useContent';
import { useEditOptional } from './EditProvider';

type LinkProps = ComponentPropsWithoutRef<typeof Link>;
type PreviewAwareLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: LinkProps['href'];
};

function hrefToString(href: LinkProps['href']): string {
  if (typeof href === 'string') return href;
  const path = href.pathname ?? '/';
  const query = href.query;
  if (!query || typeof query !== 'object') return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Link interno que cambia la ruta de preview en el editor en vez de navegar. */
export function PreviewAwareLink({
  href,
  onClick,
  children,
  ...rest
}: PreviewAwareLinkProps) {
  const { suppressNavigation } = useContent();
  const edit = useEditOptional();

  if (suppressNavigation && edit) {
    const route = hrefToString(href);
    const { className, ...buttonRest } = rest;
    return (
      <button
        type="button"
        data-preview-nav
        className={className}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e as unknown as MouseEvent<HTMLAnchorElement>);
          edit.setPreviewRoute(route);
        }}
        {...(buttonRest as ComponentPropsWithoutRef<'button'>)}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      {...(onClick ? { onClick } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}
