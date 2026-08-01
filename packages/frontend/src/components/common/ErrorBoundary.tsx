import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Card, Typography, Collapse } from '@mui/material';
import {
  ReportProblemOutlined as ErrorIcon,
  RefreshOutlined as RetryIcon,
  ExpandMoreOutlined as ExpandIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  /** Changing this value resets the boundary — pass the route key so navigating away clears a crash. */
  resetKey?: string;
}

interface State {
  error: Error | null;
  showDetail: boolean;
}

/**
 * Catches render-time exceptions so a fault in one view degrades to a
 * recoverable panel instead of unmounting the whole app to a blank page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, showDetail: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null, showDetail: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    const { error, showDetail } = this.state;
    if (!error) return this.props.children;

    return (
      <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2, mb: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'error.light', color: 'error.main',
            border: '1px solid', borderColor: 'error.main',
            '& svg': { fontSize: 22 },
          }}
        >
          <ErrorIcon />
        </Box>

        <Typography variant="h5" sx={{ mb: 0.75 }}>This view failed to load</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 2.5 }}>
          Something went wrong rendering this page. The rest of the application is unaffected — you can retry, or
          navigate elsewhere using the sidebar.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<RetryIcon sx={{ fontSize: 16 }} />}
            onClick={() => this.setState({ error: null, showDetail: false })}
          >
            Retry
          </Button>
          <Button
            size="small"
            endIcon={<ExpandIcon sx={{ fontSize: 16, transform: showDetail ? 'rotate(180deg)' : 'none', transition: 'transform 140ms ease' }} />}
            onClick={() => this.setState({ showDetail: !showDetail })}
          >
            {showDetail ? 'Hide' : 'Show'} details
          </Button>
        </Box>

        <Collapse in={showDetail} sx={{ width: '100%' }}>
          <Box
            sx={{
              textAlign: 'left', p: 1.75, borderRadius: 1.5, bgcolor: 'surface.sunken',
              border: '1px solid', borderColor: 'divider', maxWidth: 720, mx: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.75rem', color: 'text.secondary',
              overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}
          >
            {error.message}
          </Box>
        </Collapse>
      </Card>
    );
  }
}
