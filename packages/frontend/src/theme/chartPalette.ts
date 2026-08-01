import { slate, ink, surfaces } from './tokens';

// Validated categorical palette (blue, orange, aqua, yellow, magenta, green, violet, red).
// Slot order is the CVD-safety mechanism — do not reorder or cycle. Verified with
// scripts/validate_palette.js against this app's card surfaces (#FFFFFF light /
// #141A23 dark): every hard gate passes in both modes. Three light-mode slots sit
// below 3:1 contrast, so charts using them must carry visible labels or a legend.
export const CHART_CATEGORICAL_LIGHT = [
  '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948',
];

export const CHART_CATEGORICAL_DARK = [
  '#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767',
];

export function categoricalPalette(isDark: boolean): string[] {
  return isDark ? CHART_CATEGORICAL_DARK : CHART_CATEGORICAL_LIGHT;
}

export interface ChartChrome {
  grid: string;
  axis: string;
  axisText: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipMuted: string;
  reference: string;
}

/** Recessive chart furniture — gridlines and axes must never compete with data. */
export function chartChrome(isDark: boolean): ChartChrome {
  return isDark
    ? {
        grid: '#222A36',
        axis: surfaces.dark.border,
        axisText: ink.dark.muted,
        tooltipBg: slate[800],
        tooltipBorder: surfaces.dark.borderStrong,
        tooltipText: ink.dark.primary,
        tooltipMuted: ink.dark.muted,
        reference: '#3A4455',
      }
    : {
        grid: slate[200],
        axis: slate[300],
        axisText: ink.light.muted,
        tooltipBg: '#FFFFFF',
        tooltipBorder: surfaces.light.borderStrong,
        tooltipText: ink.light.primary,
        tooltipMuted: ink.light.muted,
        reference: slate[400],
      };
}
