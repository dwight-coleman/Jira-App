import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { buildTheme } from './theme';
import { useResolvedMode } from './hooks/useThemeMode';
import App from './App';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  const mode = useResolvedMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            '.print-briefing': { display: 'none' },
            '@media print': {
              'body *': { visibility: 'hidden' },
              '.print-briefing, .print-briefing *': { visibility: 'visible' },
              '.print-briefing': {
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                background: '#ffffff',
                color: '#000000',
                padding: '24px',
              },
            },
          }}
        />
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
