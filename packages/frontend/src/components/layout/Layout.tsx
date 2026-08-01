import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Badge,
  Tooltip, useMediaQuery, Theme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SpaceDashboardOutlined as DashboardIcon,
  ConfirmationNumberOutlined as TicketsIcon,
  GroupsOutlined as EngineersIcon,
  WidgetsOutlined as AppsIcon,
  SummarizeOutlined as ReportsIcon,
  TuneOutlined as SettingsIcon,
  PersonOutlineOutlined as PersonIcon,
  LogoutOutlined as LogoutIcon,
  KeyboardDoubleArrowLeft as CollapseIcon,
  KeyboardDoubleArrowRight as ExpandIcon,
  NotificationsNoneOutlined as BellIcon,
  DarkModeOutlined as DarkIcon,
  LightModeOutlined as LightIcon,
  MonitorHeartOutlined as LogoIcon,
  ShieldOutlined as RiskIcon,
  TaskAltOutlined as ActionIcon,
  SearchOutlined as SearchIcon,
  SlideshowOutlined as PresentIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useResolvedMode, useThemeStore } from '../../hooks/useThemeMode';
import { ticketApi } from '../../services/api';
import { layout } from '../../theme/tokens';
import StatusPill from '../ui/StatusPill';
import EmptyState from '../ui/EmptyState';
import ErrorBoundary from '../common/ErrorBoundary';

const navSections = [
  {
    label: 'Overview',
    items: [{ text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }],
  },
  {
    label: 'Operations',
    items: [
      { text: 'Tickets', path: '/tickets', icon: <TicketsIcon /> },
      { text: 'Applications', path: '/applications', icon: <AppsIcon /> },
      { text: 'Engineers', path: '/engineers', icon: <EngineersIcon /> },
    ],
  },
  {
    label: 'Governance',
    items: [
      { text: 'Risk Register', path: '/risks', icon: <RiskIcon /> },
      { text: 'Action Items', path: '/action-items', icon: <ActionIcon /> },
    ],
  },
  {
    label: 'Briefing',
    items: [
      { text: 'Reports', path: '/reports', icon: <ReportsIcon /> },
      { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    ],
  },
];

/** Fires the same shortcut the CommandPalette listens for. */
function openCommandPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery((t: Theme) => t.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const { user, logout } = useAuthStore();
  const resolvedMode = useResolvedMode();
  const setThemeMode = useThemeStore((s) => s.setMode);

  const { data: tickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketApi.getAll().then((r) => r.data),
  });

  const breached = (tickets ?? []).filter((t) => t.sla?.status === 'Breached');
  const criticalOpen = (tickets ?? []).filter(
    (t) => t.priority === 'Critical' && !['Resolved', 'Closed'].includes(t.status) && t.sla?.status !== 'Breached'
  );
  const allNotifications = [
    ...breached.map((t) => ({ ticket: t, reason: 'SLA Breached' as const })),
    ...criticalOpen.map((t) => ({ ticket: t, reason: 'Critical' as const })),
  ];
  const notifications = allNotifications.slice(0, 8);

  const railWidth = collapsed ? layout.sidebarCollapsedWidth : layout.sidebarWidth;
  const activePath = navSections.flatMap((s) => s.items).find((i) => location.pathname.startsWith(i.path));

  const sidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'surface.raised' }}>
      {/* Brand — also the "home" affordance back to the dashboard. */}
      <Tooltip title={collapsed ? 'Go to dashboard' : ''} placement="right">
        <Box
          component={NavLink}
          to="/dashboard"
          aria-label="Jira Executive Reporting — go to dashboard"
          onClick={() => setMobileOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            height: layout.topBarHeight,
            px: collapsed ? 0 : 2,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 120ms ease',
            '&:hover': { bgcolor: 'action.hover' },
            '&:hover .brand-mark': { transform: 'scale(1.06)' },
          }}
        >
          <Box
            className="brand-mark"
            sx={{
              width: 28, height: 28, borderRadius: 1.5, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'primary.main', color: 'primary.contrastText',
              transition: 'transform 140ms ease',
              '& svg': { fontSize: 17 },
            }}
          >
            <LogoIcon />
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }} noWrap>
                Jira Executive
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', lineHeight: 1.25 }} color="text.secondary" noWrap>
                Reporting Platform
              </Typography>
            </Box>
          )}
        </Box>
      </Tooltip>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5 }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 1.5 }}>
            {!collapsed && (
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', px: 2.5, mb: 0.5, fontSize: '0.625rem', opacity: 0.75 }}
              >
                {section.label}
              </Typography>
            )}
            <List disablePadding sx={{ px: 1 }}>
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const button = (
                  <ListItemButton
                    key={item.text}
                    component={NavLink}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 1.5,
                      minHeight: 34,
                      px: collapsed ? 0 : 1.25,
                      mb: 0.25,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover', color: isActive ? 'primary.main' : 'text.primary' },
                      '& .MuiListItemIcon-root': {
                        minWidth: collapsed ? 0 : 30,
                        justifyContent: 'center',
                        color: 'inherit',
                        '& svg': { fontSize: 18 },
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: isActive ? 650 : 500 }}
                      />
                    )}
                  </ListItemButton>
                );
                return collapsed ? (
                  <Tooltip key={item.text} title={item.text} placement="right">
                    <Box>{button}</Box>
                  </Tooltip>
                ) : button;
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1, flexShrink: 0 }}>
        {!collapsed && (
          <Box sx={{ px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">v1.0.0</Typography>
            <StatusPill label="Demo data" color="default" variant="ghost" />
          </Box>
        )}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <ListItemButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              borderRadius: 1.5, minHeight: 32,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 0 : 1.25,
              display: { xs: 'none', md: 'flex' },
              '& .MuiListItemIcon-root': { minWidth: collapsed ? 0 : 30, justifyContent: 'center', '& svg': { fontSize: 17 } },
            }}
          >
            <ListItemIcon>{collapsed ? <ExpandIcon /> : <CollapseIcon />}</ListItemIcon>
            {!collapsed && (
              <ListItemText primary="Collapse" primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }} />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'surface.canvas' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${railWidth}px)` },
          ml: { md: `${railWidth}px` },
          bgcolor: 'surface.raised',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'width 180ms ease, margin 180ms ease',
        }}
      >
        <Toolbar sx={{ minHeight: `${layout.topBarHeight}px !important`, px: { xs: 2, md: 3 }, gap: 1 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 650, letterSpacing: '-0.008em' }} noWrap>
              {activePath?.text ?? 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Search affordance — discoverability for the ⌘K palette. */}
            <Box
              onClick={openCommandPalette}
              role="button"
              tabIndex={0}
              aria-label="Open search (Command K)"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCommandPalette(); } }}
              sx={{
                display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1,
                px: 1.25, height: 30, mr: 0.5, cursor: 'pointer',
                borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                bgcolor: 'surface.sunken', color: 'text.secondary',
                transition: 'border-color 120ms ease, color 120ms ease',
                '&:hover': { borderColor: 'surface.borderStrong', color: 'text.primary' },
              }}
            >
              <SearchIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: '0.75rem' }}>Search…</Typography>
              <Box
                sx={{
                  px: 0.5, py: 0.125, borderRadius: 0.75, border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper', fontSize: '0.625rem', fontWeight: 700, lineHeight: 1.5,
                }}
              >
                ⌘K
              </Box>
            </Box>

            <Tooltip title="Briefing view — full-screen rotating summary">
              <IconButton size="small" onClick={() => navigate('/present')} aria-label="Open briefing view">
                <PresentIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton size="small" onClick={() => setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark')}>
                {resolvedMode === 'dark' ? <LightIcon sx={{ fontSize: 19 }} /> : <DarkIcon sx={{ fontSize: 19 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Attention required">
              <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge
                  badgeContent={allNotifications.length}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.625rem', height: 16, minWidth: 16, fontWeight: 700 } }}
                >
                  <BellIcon sx={{ fontSize: 19 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 1.5 }} />

            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                borderRadius: 1.5, px: 0.75, py: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main', fontSize: '0.6875rem' }}>
                {user?.name?.charAt(0) ?? 'U'}
              </Avatar>
              {isDesktop && (
                <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }} noWrap>
                    {user?.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', lineHeight: 1.3 }} color="text.secondary" noWrap>
                    {user?.role}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: railWidth }, flexShrink: { md: 0 }, transition: 'width 180ms ease' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: layout.sidebarWidth, borderRight: '1px solid', borderColor: 'divider' },
          }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: railWidth,
              overflowX: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: 'width 180ms ease',
            },
          }}
        >
          {sidebar}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          px: { xs: 2, md: 3 },
          py: 3,
          mt: `${layout.topBarHeight}px`,
          minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
        }}
      >
        {/* Keyed on pathname so navigating away from a crashed view clears it. */}
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </Box>

      {/* Account menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 232 } }}
      >
        <Box sx={{ px: 1.5, py: 1.25 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 650 }} noWrap>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><PersonIcon sx={{ fontSize: 17 }} /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { logout(); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon sx={{ fontSize: 17, color: 'error.main' }} /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>

      {/* Attention feed */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 372, maxHeight: 460 } }}
      >
        <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 650 }}>Attention required</Typography>
          <Typography variant="caption" color="text.secondary" className="tabular-nums">
            {allNotifications.length} item{allNotifications.length === 1 ? '' : 's'}
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <EmptyState dense icon={<BellIcon />} title="All clear" description="No SLA breaches or open critical tickets." />
        ) : (
          <Box sx={{ py: 0.5 }}>
            {notifications.map(({ ticket, reason }) => (
              <MenuItem
                key={ticket.id}
                onClick={() => { setNotifAnchor(null); navigate(`/tickets/${ticket.id}`); }}
                sx={{ display: 'block', py: 1, px: 1.5, whiteSpace: 'normal' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.375 }}>
                  <Typography className="tabular-nums" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {ticket.key}
                  </Typography>
                  <StatusPill label={reason} color={reason === 'SLA Breached' ? 'error' : 'warning'} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.45 }} noWrap>
                  {ticket.summary}
                </Typography>
              </MenuItem>
            ))}
            {allNotifications.length > notifications.length && (
              <Box sx={{ px: 1.5, pt: 0.75, pb: 0.25 }}>
                <Typography variant="caption" color="text.secondary">
                  +{allNotifications.length - notifications.length} more
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Menu>
    </Box>
  );
}
