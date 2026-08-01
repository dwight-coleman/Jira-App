import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Dialog, TextField, InputAdornment, Typography, Divider, List,
  ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  ConfirmationNumberOutlined as TicketIcon,
  WidgetsOutlined as AppIcon,
  GroupsOutlined as EngineerIcon,
  SpaceDashboardOutlined as DashboardIcon,
  SummarizeOutlined as ReportIcon,
  ShieldOutlined as RiskIcon,
  TaskAltOutlined as ActionIcon,
  TuneOutlined as SettingsIcon,
} from '@mui/icons-material';
import { ticketApi, applicationApi, engineerApi } from '../../services/api';
import StatusPill from '../ui/StatusPill';
import { priorityColor } from '../../utils/chipColors';

interface Command {
  id: string;
  label: string;
  sublabel?: string;
  group: string;
  icon: React.ReactNode;
  badge?: { label: string; color: Parameters<typeof StatusPill>[0]['color'] };
  path: string;
}

const NAV_COMMANDS: Command[] = [
  { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigate', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'nav-tickets', label: 'Tickets', group: 'Navigate', icon: <TicketIcon />, path: '/tickets' },
  { id: 'nav-apps', label: 'Applications', group: 'Navigate', icon: <AppIcon />, path: '/applications' },
  { id: 'nav-engineers', label: 'Engineers', group: 'Navigate', icon: <EngineerIcon />, path: '/engineers' },
  { id: 'nav-risks', label: 'Risk Register', group: 'Navigate', icon: <RiskIcon />, path: '/risks' },
  { id: 'nav-actions', label: 'Action Items', group: 'Navigate', icon: <ActionIcon />, path: '/action-items' },
  { id: 'nav-reports', label: 'Reports', group: 'Navigate', icon: <ReportIcon />, path: '/reports' },
  { id: 'nav-settings', label: 'Settings', group: 'Navigate', icon: <SettingsIcon />, path: '/settings' },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Only fetch the searchable corpus once the palette is actually opened.
  const { data: tickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketApi.getAll().then((r) => r.data),
    enabled: open,
  });
  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll().then((r) => r.data),
    enabled: open,
  });
  const { data: engineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: () => engineerApi.getAll().then((r) => r.data),
    enabled: open,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const ticketCommands: Command[] = (tickets ?? []).map((t) => ({
      id: `ticket-${t.id}`,
      label: `${t.key} — ${t.summary}`,
      sublabel: `${t.application} · ${t.status}`,
      group: 'Tickets',
      icon: <TicketIcon />,
      badge: { label: t.priority, color: priorityColor(t.priority) },
      path: `/tickets/${t.id}`,
    }));

    const appCommands: Command[] = (applications ?? []).map((a) => ({
      id: `app-${a.id}`,
      label: a.displayName,
      sublabel: `${a.team} · ${a.criticality}`,
      group: 'Applications',
      icon: <AppIcon />,
      path: '/applications',
    }));

    const engCommands: Command[] = (engineers ?? []).map((e) => ({
      id: `eng-${e.id}`,
      label: e.name,
      sublabel: `${e.role} · ${e.team}`,
      group: 'Engineers',
      icon: <EngineerIcon />,
      path: '/engineers',
    }));

    const all = [...NAV_COMMANDS, ...ticketCommands, ...appCommands, ...engCommands];
    if (!q) return NAV_COMMANDS;

    return all
      .filter((c) => c.label.toLowerCase().includes(q) || (c.sublabel ?? '').toLowerCase().includes(q))
      .slice(0, 24);
  }, [query, tickets, applications, engineers]);

  useEffect(() => setCursor(0), [query]);

  const close = () => { setOpen(false); setQuery(''); setCursor(0); };
  const run = (cmd: Command) => { navigate(cmd.path); close(); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter' && results[cursor]) { e.preventDefault(); run(results[cursor]); }
  };

  // Keep the highlighted row inside the scroll viewport during keyboard nav.
  useEffect(() => {
    listRef.current?.querySelectorAll('li')[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  let lastGroup = '';

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { position: 'fixed', top: 88, m: 0, maxHeight: 'calc(100vh - 160px)' } }}
    >
      <TextField
        autoFocus
        fullWidth
        placeholder="Search tickets, applications, engineers…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          sx: { px: 2, py: 1.75, fontSize: '0.9375rem' },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 19, color: 'text.muted' }} />
            </InputAdornment>
          ),
        }}
      />
      <Divider />

      {results.length === 0 ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">No matches for “{query}”</Typography>
        </Box>
      ) : (
        <List ref={listRef} sx={{ overflowY: 'auto', py: 0.5, px: 0.5 }}>
          {results.map((cmd, i) => {
            const showHeader = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            return (
              <Box key={cmd.id}>
                {showHeader && (
                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, pt: 1, pb: 0.5, fontSize: '0.625rem' }}>
                    {cmd.group}
                  </Typography>
                )}
                <ListItemButton
                  selected={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => run(cmd)}
                  sx={{ borderRadius: 1, minHeight: 42, '&.Mui-selected': { bgcolor: 'action.selected' } }}
                >
                  <ListItemIcon sx={{ minWidth: 30, '& svg': { fontSize: 17 } }}>{cmd.icon}</ListItemIcon>
                  <ListItemText
                    primary={cmd.label}
                    secondary={cmd.sublabel}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500, noWrap: true }}
                    secondaryTypographyProps={{ fontSize: '0.6875rem', noWrap: true }}
                  />
                  {cmd.badge && <StatusPill label={cmd.badge.label} color={cmd.badge.color} />}
                </ListItemButton>
              </Box>
            );
          })}
        </List>
      )}

      <Divider />
      <Box sx={{ px: 2, py: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
        {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([k, l]) => (
          <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
            <Box
              sx={{
                px: 0.625, py: 0.125, borderRadius: 0.75, border: '1px solid', borderColor: 'divider',
                bgcolor: 'surface.sunken', fontSize: '0.625rem', fontWeight: 600, color: 'text.secondary',
                minWidth: 18, textAlign: 'center',
              }}
            >
              {k}
            </Box>
            <Typography sx={{ fontSize: '0.6875rem' }} color="text.secondary">{l}</Typography>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
