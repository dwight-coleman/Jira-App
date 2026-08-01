import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  /** Tracked-out eyebrow above the title — orients the reader in the app. */
  eyebrow?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Rendered flush against the title, e.g. a live count or status pill. */
  meta?: ReactNode;
}

/**
 * Page-level heading. Deliberately typographic rather than decorative — the old
 * gradient icon tile competed with the content beneath it for attention.
 */
export default function PageHeader({ title, eyebrow, subtitle, actions, meta }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
        pb: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {eyebrow}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="h2" sx={{ lineHeight: 1.15 }}>{title}</Typography>
          {meta}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Box>
  );
}
