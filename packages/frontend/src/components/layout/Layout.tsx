import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  useMediaQuery,
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
} from '@mui/icons-material';
import { useAuthStore } from '../../hooks/useAuthStore';

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
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { user, logout } = useAuthStore();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleProfileMenuClose(); };

  const drawer = (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      {!collapsed && <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Jira Executive</Typography>}
      <Typography variant="caption" sx={{ display: collapsed ? 'none' : 'block', opacity: 0.7 }}>Reporting Platform</Typography>
      <Divider sx={{ my: 2 }} />
      <List component="nav">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={({ isActive }) => ({
                borderRadius: 2, mx: 1, my: 0.5,
                color: isActive ? 'primary.main' : 'text.secondary',
                backgroundColor: isActive ? 'primary.light' : 'transparent',
                '& .MuiListItemIcon-root': { minWidth: 40, justifyContent: 'center', color: isActive ? 'primary.main' : 'text.secondary' },
                '&:hover': { backgroundColor: isActive ? 'primary.light' : 'action.hover' },
              })}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
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
            <Tooltip title="Notifications"><IconButton><Badge badgeContent={3} color="error"><NotificationsIcon /></Badge></IconButton></Tooltip>
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
    </Box>
  );
}