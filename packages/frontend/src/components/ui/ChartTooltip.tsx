import { Box, Typography, useTheme } from '@mui/material';
import { chartChrome } from '../../theme/chartPalette';

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  /** Formats the numeric value, e.g. v => `${v}%`. */
  format?: (value: number | string) => string;
  /** Overrides the series name shown beside the swatch. */
  seriesLabel?: string;
}

/**
 * Themed replacement for recharts' default tooltip, which ignores the app theme
 * and reads as unstyled in dark mode.
 */
export default function ChartTooltip({
  active, payload, label, format, seriesLabel,
}: ChartTooltipProps) {
  const theme = useTheme();
  const chrome = chartChrome(theme.palette.mode === 'dark');

  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        bgcolor: chrome.tooltipBg,
        border: `1px solid ${chrome.tooltipBorder}`,
        borderRadius: 1.5,
        boxShadow: theme.shadows[3],
        px: 1.5,
        py: 1.125,
        minWidth: 130,
      }}
    >
      {label && (
        <Typography
          sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: chrome.tooltipMuted, mb: 0.75 }}
        >
          {label}
        </Typography>
      )}
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, minWidth: 0 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: entry.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', color: chrome.tooltipMuted }} noWrap>
              {seriesLabel ?? entry.name}
            </Typography>
          </Box>
          <Typography
            className="tabular-nums"
            sx={{ fontSize: '0.8125rem', fontWeight: 650, color: chrome.tooltipText }}
          >
            {format && entry.value !== undefined ? format(entry.value) : entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
