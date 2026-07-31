import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';

import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import TicketsPage from './pages/tickets/TicketsPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import EngineersPage from './pages/engineers/EngineersPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import { useAuthStore } from './hooks/useAuthStore';
import { userApi } from './services/api';

function AppRoutes() {
  const { isAuthenticated, login } = useAuthStore();

  const { data: demoUser, isError } = useQuery({
    queryKey: ['demo-user'],
    queryFn: () => userApi.getAll().then((r) => r.data[0]),
    enabled: !isAuthenticated,
    retry: 1,
  });

  useEffect(() => {
    if (isAuthenticated) return;
    // For demo purposes, auto-login as the first seeded user so foreign-key-backed
    // actions (comments, assignments, etc.) reference a real user row.
    if (demoUser) {
      login({ id: demoUser.id, email: demoUser.email, name: demoUser.name, role: demoUser.role }, 'demo-token');
    } else if (isError) {
      login(
        { id: 'demo-user', email: 'demo@jira-executive.local', name: 'Demo User', role: 'Admin' },
        'demo-token'
      );
    }
  }, [isAuthenticated, demoUser, isError, login]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/engineers" element={<EngineersPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
