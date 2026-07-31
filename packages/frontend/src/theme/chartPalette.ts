// Validated categorical palette (blue, orange, aqua, yellow, magenta, green, violet, red).
// Order is the CVD-safety mechanism — do not reorder or cycle. Validated via
// scripts/validate_palette.js against this app's actual card surfaces
// (#ffffff light / #1a1d27 dark): all hard gates pass in both modes.
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
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

export function chartChrome(isDark: boolean): ChartChrome {
  return isDark
    ? { grid: '#2c2c2a', axis: '#383835', tooltipBg: '#1a1d27', tooltipBorder: 'rgba(255,255,255,0.12)', tooltipText: '#e8eaf0' }
    : { grid: '#e1e0d9', axis: '#c3c2b7', tooltipBg: '#ffffff', tooltipBorder: 'rgba(11,11,11,0.10)', tooltipText: '#1a1a2e' };
}
