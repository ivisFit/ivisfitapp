import { describe, it, expect } from 'vitest';
import {
  PREVIEW_SOURCE,
  PREVIEW_ROUTES,
  normalizePreviewRoute,
  isPreviewInbound,
  isPreviewOutbound,
} from '../src/lib/content-edit/preview-bridge';

describe('PREVIEW_ROUTES', () => {
  it('expone las rutas del config demo', () => {
    expect(PREVIEW_ROUTES).toContain('/');
    expect(PREVIEW_ROUTES).toContain('/about');
  });
});

describe('normalizePreviewRoute', () => {
  it('devuelve la ruta canónica para rutas del config', () => {
    expect(normalizePreviewRoute('/')).toBe('/');
    expect(normalizePreviewRoute('/about')).toBe('/about');
  });

  it('stripea query strings y hash', () => {
    expect(normalizePreviewRoute('/about?x=1#top')).toBe('/about');
  });

  it('devuelve null para rutas desconocidas', () => {
    expect(normalizePreviewRoute('/admin')).toBeNull();
    expect(normalizePreviewRoute('/login')).toBeNull();
  });
});

describe('isPreviewInbound', () => {
  const validInbound = {
    source: PREVIEW_SOURCE,
    type: 'state',
    draft: { es: {}, en: {} },
    locale: 'es',
    route: '/',
  };

  it('devuelve true para un mensaje inbound válido', () => {
    expect(isPreviewInbound(validInbound)).toBe(true);
  });

  it('devuelve false cuando source es incorrecto', () => {
    expect(isPreviewInbound({ source: 'otro', type: 'state' })).toBe(false);
  });
});

describe('isPreviewOutbound', () => {
  it('devuelve true para mensaje ready', () => {
    expect(isPreviewOutbound({ source: PREVIEW_SOURCE, type: 'ready' })).toBe(true);
  });

  it('devuelve false para tipo state (inbound)', () => {
    expect(
      isPreviewOutbound({ source: PREVIEW_SOURCE, type: 'state', draft: {}, locale: 'es', route: '/' }),
    ).toBe(false);
  });
});

describe('PREVIEW_SOURCE', () => {
  it('usa el valor del config demo', () => {
    expect(PREVIEW_SOURCE).toBe('preview-cms-kit-demo');
  });
});
