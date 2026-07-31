import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Engineering as EngineeringIcon,
  Apps as AppsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useResolvedMode, useThemeStore } from '../../hooks/useThemeMode';
import { ticketApi } from '../../services/api';

const drawerWidth = 260;
const collapsedDrawerWidth = 72;

const menuItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Tickets', path: '/tickets', icon: <AssignmentIcon /> },
  { text: 'Engineers', path: '/engineers', icon: <EngineeringIcon /> },
  { text: 'Applications', path: '/applications', icon: <AppsIcon /> },
  { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const breachedTickets = (tickets ?? []).filter((t) => t.sla?.status === 'Breached');
  const criticalOpenTickets = (tickets ?? []).filter(
    (t) => t.priority === 'Critical' && !['Resolved', 'Closed'].includes(t.status) && t.sla?.status !== 'Breached'
  );
  const allNotifications = [
    ...breachedTickets.map((t) => ({ ticket: t, reason: 'SLA Breached' as const })),
    ...criticalOpenTickets.map((t) => ({ ticket: t, reason: 'Critical Priority' as const })),
  ];
  const notifications = allNotifications.slice(0, 8);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleProfileMenuClose(); };

  const drawer = (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 0 : 1, mb: 1 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'primary.contrastText',
          }}
        >
          <InsightsIcon fontSize="small" />
        </Box>
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>Jira Executive</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>Reporting Platform</Typography>
          </Box>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      <List component="nav" sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2, mx: 1, my: 0.5, pl: 1.75,
                  borderLeft: 3, borderColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive ? 'action.selected' : 'transparent',
                  '& .MuiListItemIcon-root': { minWidth: 40, justifyContent: 'center', color: isActive ? 'primary.main' : 'text.secondary' },
                  '& .MuiListItemText-primary': { fontWeight: isActive ? 600 : 500 },
                  '&:hover': { backgroundColor: isActive ? 'action.selected' : 'action.hover' },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">Version 1.0.0</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{
        width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
        ml: { md: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
        bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider',
      }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setCollapsed(!collapsed)} sx={{ mr: 2, display: { xs: 'none', md: 'inline-flex' } }}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
          <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Jira Executive Reporting</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton onClick={() => setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark')}>
                {resolvedMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge badgeContent={allNotifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{user?.name?.charAt(0) || 'U'}</Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: collapsed ? collapsedDrawerWidth : drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: collapsed ? collapsedDrawerWidth : drawerWidth, overflowX: 'hidden', borderRight: 1, borderColor: 'divider' } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{
        flexGrow: 1, p: 3, mt: '64px', ml: { md: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
        minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default',
      }}>
        <Outlet />
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>Profile</MenuItem>
        <MenuItem onClick={handleLogout}><ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon><Typography color="error">Logout</Typography></MenuItem>
      </Menu>

      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 440 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {allNotifications.length} ticket{allNotifications.length === 1 ? '' : 's'} need attention
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No new notifications</Typography>
          </Box>
        ) : (
          notifications.map(({ ticket, reason }) => (
            <MenuItem
              key={ticket.id}
              onClick={() => { setNotifAnchor(null); navigate(`/tickets/${ticket.id}`); }}
              sx={{ whiteSpace: 'normal', py: 1.5 }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{ticket.key}</Typography>
                  <Chip label={reason} size="small" color={reason === 'SLA Breached' ? 'error' : 'warning'} />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {ticket.summary}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}
