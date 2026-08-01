import { ReactNode } from 'react';
import { Box, Card, Typography, Tooltip } from '@mui/material';
import {
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  RemoveRounded as FlatIcon,
} from '@mui/icons-material';

export type TileTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Small qualifier under the value, e.g. "of 29 total". */
  context?: string;
  icon?: ReactNode;
  tone?: TileTone;
  delta?: { value: number; label?: string; goodDirection?: 'up' | 'down' };
  hint?: string;
}

/**
 * Primary KPI unit. The number leads; everything else is deliberately quiet so a
 * row of these reads as a single scannable band.
 */
export default function StatTile({
  label, value, context, icon, tone = 'neutral', delta, hint,
}: StatTileProps) {
  const accent = tone === 'neutral' ? 'text.secondary' : `${tone}.main`;

  let deltaTone: 'success' | 'error' | 'muted' = 'muted';
  if (delta && delta.value !== 0) {
    const rising = delta.value > 0;
    const good = (delta.goodDirection ?? 'up') === 'up' ? rising : !rising;
    deltaTone = good ? 'success' : 'error';
  }
  const DeltaIcon = !delta || delta.value === 0 ? FlatIcon : delta.value > 0 ? UpIcon : DownIcon;

  const body = (
    <Card
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { borderColor: 'surface.borderStrong' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 1,
              flexShrink: 0,
              color: accent,
              bgcolor: tone === 'neutral' ? 'action.hover' : `${tone}.light`,
              '& svg': { fontSize: 15 },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="overline"
          color="text.secondary"
          noWrap
          sx={{ fontSize: '0.6875rem', letterSpacing: '0.06em' }}
        >
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography
          className="tabular-nums"
          sx={{ fontSize: '1.75rem', fontWeight: 680, lineHeight: 1.05, letterSpacing: '-0.024em' }}
        >
          {value}
        </Typography>
        {delta && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              color: deltaTone === 'muted' ? 'text.muted' : `${deltaTone}.main`,
            }}
          >
            <DeltaIcon sx={{ fontSize: 13 }} />
            <Typography className="tabular-nums" sx={{ fontSize: '0.75rem', fontWeight: 650, lineHeight: 1 }}>
              {Math.abs(delta.value)}%
            </Typography>
          </Box>
        )}
      </Box>

      {(context || delta?.label) && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: -0.5 }}>
          {context ?? delta?.label}
        </Typography>
      )}
    </Card>
  );

  return hint ? <Tooltip title={hint} placement="top">{body}</Tooltip> : body;
}
