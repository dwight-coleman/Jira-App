/**
 * Design tokens.
 *
 * Every colour, radius, and elevation in the app resolves back to this file.
 * Components should reference semantic theme values (`divider`, `text.secondary`,
 * `surface.sunken`) rather than importing raw hex from here — the exceptions are
 * charts and canvas-like surfaces that sit outside MUI's palette.
 */

/** Cool slate ramp. Carries all structure: surfaces, borders, and ink. */
export const slate = {
  25: '#FCFCFD',
  50: '#F8FAFC',
  100: '#F1F4F8',
  200: '#E4E8EF',
  300: '#CFD5E0',
  400: '#98A2B3',
  500: '#667085',
  600: '#4A5567',
  700: '#343E4E',
  800: '#212936',
  850: '#1A212C',
  900: '#141A23',
  950: '#0D1219',
} as const;

/** Primary — an institutional blue: confident, legible, not decorative. */
export const blue = {
  50: '#EFF5FF',
  100: '#DBE7FE',
  200: '#BFD4FE',
  300: '#93B4FD',
  400: '#608DFA',
  500: '#3B6FF5',
  600: '#2554E9',
  700: '#1D42D6',
  800: '#1E39AD',
  900: '#1E3488',
} as const;

/** Secondary accent — used sparingly for AI/derived content, never for status. */
export const violet = {
  100: '#EDE9FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
} as const;

/**
 * Status ramp. Reserved for state (SLA, health, priority) and never reused as a
 * series colour. Each has a light-surface and dark-surface step chosen to clear
 * 3:1 against its own background.
 */
export const status = {
  successLight: '#15803D',
  successDark: '#3DD68C',
  successBgLight: '#E8F7EE',
  successBgDark: '#0E2A1B',

  warningLight: '#B45309',
  warningDark: '#F5A524',
  warningBgLight: '#FEF4E6',
  warningBgDark: '#2E1F06',

  errorLight: '#BE1B1B',
  errorDark: '#F76E6E',
  errorBgLight: '#FDECEC',
  errorBgDark: '#2E1212',

  infoLight: '#0369A1',
  infoDark: '#4DB8F0',
  infoBgLight: '#E7F4FB',
  infoBgDark: '#0A2433',
} as const;

/** Surfaces. Dark mode is a selected set of steps, not an inversion. */
export const surfaces = {
  light: {
    canvas: slate[100],   // page background
    raised: '#FFFFFF',    // cards, menus
    sunken: slate[50],    // wells, nested panels, table headers
    border: slate[200],
    borderStrong: slate[300],
    overlay: 'rgba(16, 24, 40, 0.45)',
  },
  dark: {
    canvas: slate[950],
    raised: slate[900],
    sunken: slate[850],
    border: '#252D3A',
    borderStrong: '#323B4B',
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
} as const;

export const ink = {
  light: {
    primary: '#111827',
    secondary: slate[600],
    muted: slate[500],
    disabled: slate[400],
  },
  dark: {
    primary: '#F1F4F8',
    secondary: '#A2ADBF',
    muted: '#7C8797',
    disabled: '#5C6675',
  },
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

/**
 * Elevation. Enterprise UI leans on hairline borders for structure, so shadows
 * stay near-invisible and are reserved for genuinely floating layers.
 */
export const elevation = {
  light: {
    none: 'none',
    sm: '0 1px 2px rgba(16, 24, 40, 0.05)',
    md: '0 2px 4px -1px rgba(16, 24, 40, 0.06), 0 4px 8px -2px rgba(16, 24, 40, 0.06)',
    lg: '0 4px 6px -2px rgba(16, 24, 40, 0.04), 0 12px 16px -4px rgba(16, 24, 40, 0.08)',
    xl: '0 8px 8px -4px rgba(16, 24, 40, 0.04), 0 20px 24px -4px rgba(16, 24, 40, 0.10)',
  },
  dark: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.40)',
    md: '0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 4px 8px -2px rgba(0, 0, 0, 0.40)',
    lg: '0 4px 6px -2px rgba(0, 0, 0, 0.40), 0 12px 16px -4px rgba(0, 0, 0, 0.50)',
    xl: '0 8px 8px -4px rgba(0, 0, 0, 0.40), 0 20px 24px -4px rgba(0, 0, 0, 0.55)',
  },
} as const;

/** Sans stack only — no web fonts, so nothing is fetched from an external CDN. */
export const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", Arial, sans-serif';

export const monoStack =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export const layout = {
  sidebarWidth: 244,
  sidebarCollapsedWidth: 68,
  topBarHeight: 56,
} as const;
