/**
 * Google Analytics 4 integration.
 * Set VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) in .env to enable.
 * Tracks virtual page views per section so you can see time and area in GA4.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

let initialized = false;

function initGA(): void {
  if (!MEASUREMENT_ID || typeof document === 'undefined') return;
  if (initialized) return;
  // Tag may already be in index.html (injected at build time); reuse it
  if (typeof window.gtag === 'function' && Array.isArray(window.dataLayer)) {
    initialized = true;
    return;
  }
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });
}

/**
 * Send a virtual page view for the current section.
 * Use this when the user changes view (Timeline, Diplomas, Experience, etc.)
 * so GA4 shows which area gets more time.
 */
export function trackPageView(sectionName: string, path: string): void {
  if (!MEASUREMENT_ID) return;
  initGA();
  window.gtag?.('event', 'page_view', {
    page_title: sectionName,
    page_location: typeof window !== 'undefined' ? window.location.origin + path : path,
    page_path: path,
  });
}
