import { useMemo, useState } from 'react';
import {
  Box, Typography, Avatar, Card, TextField, InputAdornment, MenuItem,
  Button, Stack, Tooltip, IconButton,
} from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  FilterAltOffOutlined as ClearIcon,
  FileDownloadOutlined as DownloadIcon,
  ConfirmationNumberOutlined as TicketIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ticketApi, Ticket } from '../../services/api';
import { priorityColor, statusColor, slaColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';

const ALL = 'All';

function exportTicketsCsv(tickets: Ticket[]) {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Key', 'Summary', 'Application', 'Priority', 'Severity', 'Status', 'SLA', 'Assignee', 'Reporter', 'Created', 'Resolved'];
  const rows = tickets.map((t) => [
    t.key, t.summary, t.application, t.priority, t.severity, t.status,
    t.sla?.status ?? '', t.assigneeName ?? 'Unassigned', t.reporterName,
    format(new Date(t.createdAt), 'yyyy-MM-dd'),
    t.resolvedAt ? format(new Date(t.resolvedAt), 'yyyy-MM-dd') : '',
  ]);
  const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const columns: GridColDef[] = [
  {
    field: 'key', headerName: 'Key', width: 104,
    renderCell: (p) => (
      <Typography className="tabular-nums" sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'primary.main' }}>
        {p.value}
      </Typography>
    ),
  },
  {
    field: 'summary', headerName: 'Summary', flex: 1, minWidth: 260,
    renderCell: (p) => (
      <Tooltip title={p.value} enterDelay={600}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{p.value}</Typography>
      </Tooltip>
    ),
  },
  {
    field: 'application', headerName: 'Application', width: 118,
    renderCell: (p) => <StatusPill label={p.value} color="default" variant="ghost" />,
  },
  {
    field: 'priority', headerName: 'Priority', width: 104,
    renderCell: (p) => <StatusPill label={p.value} color={priorityColor(p.value)} />,
  },
  {
    field: 'status', headerName: 'Status', width: 156,
    renderCell: (p) => <StatusPill label={p.value} color={statusColor(p.value)} />,
  },
  {
    field: 'sla', headerName: 'SLA', width: 104,
    valueGetter: (p) => p.value?.status ?? '—',
    renderCell: (p) => (
      p.value === '—'
        ? <Typography variant="caption" color="text.disabled">—</Typography>
        : <StatusPill label={p.value} color={slaColor(p.value)} variant={p.value === 'Breached' ? 'solid' : 'soft'} />
    ),
  },
  {
    field: 'assigneeName', headerName: 'Assignee', width: 172,
    valueGetter: (p) => p.value ?? 'Unassigned',
    renderCell: (p) => {
      const unassigned = p.value === 'Unassigned';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', minWidth: 0 }}>
          <Avatar
            sx={{
              width: 22, height: 22, fontSize: '0.625rem',
              bgcolor: unassigned ? 'action.disabledBackground' : 'primary.main',
              color: unassigned ? 'text.disabled' : 'primary.contrastText',
            }}
          >
            {unassigned ? '–' : p.value.charAt(0)}
          </Avatar>
          <Typography variant="body2" noWrap color={unassigned ? 'text.disabled' : 'text.primary'}>
            {p.value}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'createdAt', headerName: 'Created', width: 112,
    renderCell: (p) => (
      <Typography variant="caption" color="text.secondary" className="tabular-nums">
        {format(new Date(p.value as string), 'MMM d, yyyy')}
      </Typography>
    ),
  },
];

export default function TicketsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [application, setApplication] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketApi.getAll().then((r) => r.data),
  });

  const options = useMemo(() => {
    const t = tickets ?? [];
    return {
      applications: [ALL, ...Array.from(new Set(t.map((x) => x.application))).sort()],
      priorities: [ALL, ...Array.from(new Set(t.map((x) => x.priority)))],
      statuses: [ALL, ...Array.from(new Set(t.map((x) => x.status))).sort()],
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (tickets ?? []).filter((t) => {
      if (application !== ALL && t.application !== application) return false;
      if (priority !== ALL && t.priority !== priority) return false;
      if (status !== ALL && t.status !== status) return false;
      if (!q) return true;
      return (
        t.key.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        (t.assigneeName ?? '').toLowerCase().includes(q) ||
        t.application.toLowerCase().includes(q)
      );
    });
  }, [tickets, search, application, priority, status]);

  const filtersActive = search !== '' || application !== ALL || priority !== ALL || status !== ALL;
  const clearFilters = () => { setSearch(''); setApplication(ALL); setPriority(ALL); setStatus(ALL); };
  const breachedCount = filtered.filter((t) => t.sla?.status === 'Breached').length;

  return (
    <Box>
      <PageHeader
        eyebrow="Operations"
        title="Tickets"
        subtitle={
          filtersActive
            ? `${filtered.length} of ${tickets?.length ?? 0} tickets match the current filters`
            : 'All service desk tickets across supported applications'
        }
        meta={
          !isLoading && breachedCount > 0 && (
            <StatusPill label={`${breachedCount} SLA breached`} color="error" />
          )
        }
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={() => exportTicketsCsv(filtered)}
            disabled={!filtered.length}
          >
            Export CSV
          </Button>
        }
      />

      <Card sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }}>
          <TextField
            placeholder="Search key, summary, assignee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: 'text.muted' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ mr: -0.5 }}>
                    <ClearIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
            <TextField select label="Application" value={application} onChange={(e) => setApplication(e.target.value)} sx={{ minWidth: 148 }}>
              {options.applications.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
            <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ minWidth: 124 }}>
              {options.priorities.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 162 }}>
              {options.statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Button onClick={clearFilters} disabled={!filtersActive} size="small" startIcon={<ClearIcon sx={{ fontSize: 15 }} />}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ height: 620, overflow: 'hidden' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          disableColumnMenu
          rowHeight={46}
          columnHeaderHeight={40}
          onRowClick={(p) => navigate(`/tickets/${p.id}`)}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                icon={<TicketIcon />}
                title="No matching tickets"
                description="Try widening your filters or clearing the search term."
              />
            ),
          }}
          sx={{
            border: 'none',
            '--DataGrid-rowBorderColor': (t) => t.palette.divider,
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'surface.sunken', borderBottom: '1px solid', borderColor: 'divider' },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.055em', color: 'text.secondary',
            },
            '& .MuiDataGrid-cell': { borderColor: 'divider', cursor: 'pointer' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider', minHeight: 44 },
            '& .MuiTablePagination-root': { fontSize: '0.75rem' },
            '& .MuiDataGrid-overlay': { bgcolor: 'transparent' },
          }}
          initialState={{
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[15, 25, 50, 100]}
        />
      </Card>
    </Box>
  );
}
