/**
 * Utilities para precargar recursos críticos durante transiciones
 */

// Cache para evitar precargar múltiples veces
const preloadedResources = new Set<string>();

/**
 * Precarga una imagen
 */
export function preloadImage(src: string): Promise<void> {
  if (preloadedResources.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      preloadedResources.add(src);
      resolve();
    };
    
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Precarga una hoja de estilos CSS
 */
export function preloadStylesheet(href: string): void {
  if (preloadedResources.has(href) || document.querySelector(`link[href="${href}"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    preloadedResources.add(href);
    // Convertir a stylesheet real
    link.rel = 'stylesheet';
  };
  
  document.head.appendChild(link);
}

/**
 * Precarga un script JavaScript
 */
export function preloadScript(src: string): Promise<void> {
  if (preloadedResources.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      preloadedResources.add(src);
      resolve();
    };
    script.onerror = reject;
    
    document.head.appendChild(script);
  });
}

/**
 * Precarga recursos críticos específicos para cada rol
 */
export function preloadCriticalResources(userRole: 'profe' | 'alumna'): void {
  // Recursos comunes
  const commonImages = [
    '/images/backgrounds/auth-video-poster.jpg',
    '/images/icons/brand-logo.svg',
  ];

  // Recursos específicos por rol
  const roleSpecificResources = {
    profe: [
      '/images/icons/dashboard-metrics.svg',
      '/images/icons/chart-bar.svg',
      '/images/icons/chart-pie.svg',
    ],
    alumna: [
      '/images/icons/exercise.svg',
      '/images/icons/progress.svg',
      '/images/icons/nutrition.svg',
    ],
  };

  // Precargar imágenes comunes
  commonImages.forEach(src => {
    preloadImage(src).catch(console.warn);
  });

  // Precargar recursos específicos del rol
  roleSpecificResources[userRole].forEach(src => {
    preloadImage(src).catch(console.warn);
  });
}

/**
 * Precarga mediante fetch para recursos JSON/API
 */
export function preloadJSON(url: string): Promise<any> {
  if (preloadedResources.has(url)) {
    return Promise.resolve(null);
  }

  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      preloadedResources.add(url);
      return response.json();
    })
    .catch(console.warn);
}

/**
 * Limpia el cache de recursos precargados (útil para testing)
 */
export function clearPreloadCache(): void {
  preloadedResources.clear();
}

/**
 * Verifica si un recurso ya fue precargado
 */
export function isResourcePreloaded(resource: string): boolean {
  return preloadedResources.has(resource);
}