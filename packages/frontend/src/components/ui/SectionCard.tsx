import { ReactNode } from 'react';
import { Box, Card, Typography, SxProps, Theme } from '@mui/material';

interface SectionCardProps {
  title: string;
  /** Rendered as a tracked-out eyebrow above the title. */
  eyebrow?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Remove content padding for flush children such as tables and grids. */
  flush?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * The standard content container: hairline border, a header rail separated by a
 * divider, and a body. Using this everywhere is what keeps page rhythm identical
 * across the app.
 */
export default function SectionCard({
  title, eyebrow, subtitle, icon, actions, children, flush, sx,
}: SectionCardProps) {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', ...sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 56,
        }}
      >
        {icon && (
          <Box sx={{ display: 'flex', color: 'text.secondary', '& svg': { fontSize: 18 } }}>
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          {eyebrow && (
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h6" noWrap>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>{actions}</Box>}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0, ...(flush ? {} : { p: 2.5 }) }}>{children}</Box>
    </Card>
  );
}
