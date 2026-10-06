import type { ReactNode } from 'react';

/**
 * Line glyphs on a 24×24 grid, drawn with the parent's stroke settings
 * (fill="none", stroke="currentColor"). Shared by the services dial and the
 * emergency picker.
 */
export const glyphs = {
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M17 12v3M20 12v2" />
    </>
  ),
  brokenKey: (
    <>
      <circle cx="6.5" cy="12" r="3.5" />
      <path d="M10 12h3.5M15.5 11.2 17 12.8M16 12h5M19 12v2.5" />
      <path d="m13.5 9.5 1 1.6-1 1.4 1 1.5" />
    </>
  ),
  house: (
    <>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10.5 19v-5h3v5" />
    </>
  ),
  office: (
    <>
      <path d="M5 20V5h10v15M15 9h4v11M3 20h18" />
      <path d="M8 8h1M11 8h1M8 11h1M11 11h1M8 14h1M11 14h1M9 20v-3h2v3" />
    </>
  ),
  car: (
    <>
      <path d="M4 15.5V13l2-4.5h12l2 4.5v2.5" />
      <path d="M3.5 15.5h17v2.5h-17z" />
      <circle cx="7.5" cy="18.5" r="1.25" />
      <circle cx="16.5" cy="18.5" r="1.25" />
    </>
  ),
  safe: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 8.5v1.2M15.5 12h-1.2M12 15.5v-1.2M8.5 12h1.2M6 19v1.5M18 19v1.5" />
    </>
  ),
  gate: (
    <>
      <path d="M3 19.5h18M4 19.5V8M20 19.5V8M4 8h16" />
      <path d="M8 8v11.5M12 8v11.5M16 8v11.5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof glyphs;
