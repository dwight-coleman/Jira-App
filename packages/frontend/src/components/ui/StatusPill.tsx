import { Box, Typography, SxProps, Theme } from '@mui/material';
import { ChipColor } from '../../utils/chipColors';

interface StatusPillProps {
  label: string;
  color: ChipColor;
  /** Solid fill reads as higher-urgency; use for breaches and critical states. */
  variant?: 'soft' | 'solid' | 'ghost';
  sx?: SxProps<Theme>;
}

/**
 * Status indicator carrying a colour *and* a dot + text label, so state is never
 * communicated by hue alone.
 */
export default function StatusPill({ label, color, variant = 'soft', sx }: StatusPillProps) {
  const isNeutral = color === 'default';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 0.875,
        height: 22,
        borderRadius: 1,
        border: '1px solid',
        whiteSpace: 'nowrap',
        ...(variant === 'solid'
          ? {
              bgcolor: isNeutral ? 'action.disabledBackground' : `${color}.main`,
              borderColor: isNeutral ? 'divider' : `${color}.main`,
              color: isNeutral ? 'text.secondary' : `${color}.contrastText`,
            }
          : variant === 'ghost'
          ? { bgcolor: 'transparent', borderColor: 'divider', color: 'text.secondary' }
          : {
              bgcolor: isNeutral ? 'action.hover' : `${color}.light`,
              borderColor: isNeutral ? 'divider' : `${color}.main`,
              color: isNeutral ? 'text.secondary' : `${color}.main`,
            }),
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: variant === 'solid'
            ? 'currentColor'
            : isNeutral ? 'text.disabled' : `${color}.main`,
        }}
      />
      <Typography component="span" sx={{ fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1, letterSpacing: '0.01em' }}>
        {label}
      </Typography>
    </Box>
  );
}
