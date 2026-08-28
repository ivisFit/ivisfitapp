import { describe, it, expect } from 'vitest';
import { validateSiteContentData } from '../src/types/site-content';

describe('validateSiteContentData', () => {
  it('acepta overrides con secciones permitidas', () => {
    const result = validateSiteContentData({
      hero: { title: 'Hola' },
      about: { body: 'Texto' },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.hero).toEqual({ title: 'Hola' });
    }
  });

  it('rechaza secciones no permitidas en el top level', () => {
    const result = validateSiteContentData({ secretSection: { x: 'y' } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Sección no permitida');
    }
  });

  it('recorta strings y valida longitud máxima', () => {
    const result = validateSiteContentData({ hero: { title: '  hola  ' } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.data.hero as Record<string, string>).title).toBe('hola');
    }
  });

  it('permite null en arrays como hueco heredable', () => {
    const result = validateSiteContentData({ hero: { items: [null, 'a'] } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.data.hero as Record<string, unknown[]>).items).toEqual([null, 'a']);
    }
  });

  it('respeta allowedTopLevelKeys custom', () => {
    const result = validateSiteContentData(
      { custom: { title: 'ok' } },
      0,
      { allowedTopLevelKeys: ['custom'] },
    );
    expect(result.ok).toBe(true);
  });
});
