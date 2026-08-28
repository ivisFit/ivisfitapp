'use client';

import { PreviewAwareLink } from '../lib/content-edit/PreviewAwareLink';
import { T } from '../lib/content-edit/T';
import { Img } from '../lib/content-edit/Img';
import { useEdit } from '../lib/content-edit/EditProvider';

/** Página demo mínima con texto e imagen editables. */
export function DemoHomePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <nav className="flex gap-4 text-sm">
        <PreviewAwareLink href="/" className="underline">
          <T path="nav.home" />
        </PreviewAwareLink>
        <PreviewAwareLink href="/about" className="underline">
          <T path="nav.about" />
        </PreviewAwareLink>
      </nav>
      <section className="space-y-4">
        <T path="hero.title" as="h1" className="text-4xl font-bold" />
        <T path="hero.subtitle" as="p" className="text-lg text-neutral-600" />
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <Img path="hero.image" fallback="/images/demo-hero.jpg" alt="Hero" fill className="object-cover" />
        </div>
      </section>
    </main>
  );
}

export function DemoAboutPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <nav className="flex gap-4 text-sm">
        <PreviewAwareLink href="/" className="underline">
          <T path="nav.home" />
        </PreviewAwareLink>
        <PreviewAwareLink href="/about" className="underline">
          <T path="nav.about" />
        </PreviewAwareLink>
      </nav>
      <T path="about.title" as="h1" className="text-3xl font-bold" />
      <T path="about.body" as="p" className="text-neutral-700" multiline />
    </main>
  );
}

/**
 * Reemplazá este componente con tu propio RoutePreview en el proyecto host.
 * Debe renderizar las mismas páginas que el sitio público, usando <T> y <Img>.
 */
export default function RoutePreviewExample() {
  const { previewRoute } = useEdit();

  switch (previewRoute) {
    case '/about':
      return <DemoAboutPage />;
    case '/':
    default:
      return <DemoHomePage />;
  }
}
