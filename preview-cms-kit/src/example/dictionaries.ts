import { cmsConfig } from '../config/cms.config';
import type { SiteContentLocaleDto } from '../types/site-content';

export type ContentDictionary = Record<string, unknown>;

export const ES: ContentDictionary = {
  hero: {
    title: 'Bienvenido al Preview CMS',
    subtitle: 'Hacé clic en cualquier texto para editarlo en vivo.',
    image: '/images/demo-hero.jpg',
  },
  about: {
    title: 'Sobre nosotros',
    body: 'Este es un demo mínimo del kit portable.',
  },
  nav: {
    home: 'Inicio',
    about: 'About',
  },
};

export const EN: ContentDictionary = {
  hero: {
    title: 'Welcome to Preview CMS',
    subtitle: 'Click any text to edit it live.',
    image: '/images/demo-hero.jpg',
  },
  about: {
    title: 'About us',
    body: 'This is a minimal demo of the portable kit.',
  },
  nav: {
    home: 'Home',
    about: 'About',
  },
};

export const BASE_DICTIONARIES = Object.fromEntries(
  cmsConfig.locales.map((locale) => [locale, locale === 'en' ? EN : ES]),
) as Record<SiteContentLocaleDto, ContentDictionary>;
