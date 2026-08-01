import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  dense?: boolean;
}

/** Consistent treatment for "nothing here" — never a bare blank panel. */
export default function EmptyState({ icon, title, description, action, dense }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: dense ? 4 : 7,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: dense ? 36 : 44,
          height: dense ? 36 : 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.muted',
          mb: 1.75,
          '& svg': { fontSize: dense ? 18 : 22 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 650, mb: 0.5 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mb: action ? 2.5 : 0 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
