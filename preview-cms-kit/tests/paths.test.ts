import { describe, it, expect } from 'vitest';
import { getByPath, setByPath } from '../src/lib/content-edit/paths';

describe('getByPath', () => {
  it('devuelve el objeto completo cuando path está vacío', () => {
    const obj = { a: 1 };
    expect(getByPath(obj, '')).toBe(obj);
  });

  it('lee un valor anidado con dot notation', () => {
    expect(getByPath({ hero: { title: 'Hola' } }, 'hero.title')).toBe('Hola');
  });

  it('lee un elemento de array por índice', () => {
    const obj = { items: [{ q: 'Pregunta 1' }] };
    expect(getByPath(obj, 'items.0.q')).toBe('Pregunta 1');
  });
});

describe('setByPath', () => {
  it('no muta el objeto original', () => {
    const obj = { hero: { title: 'original' } } as Record<string, unknown>;
    setByPath(obj, 'hero.title', 'mutado');
    expect((obj.hero as Record<string, unknown>).title).toBe('original');
  });

  it('escribe un valor anidado', () => {
    const obj = { hero: { title: 'old' } } as Record<string, unknown>;
    const result = setByPath(obj, 'hero.title', 'new');
    expect((result.hero as Record<string, unknown>).title).toBe('new');
  });
});
