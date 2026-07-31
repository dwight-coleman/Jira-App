import { useMemo, useState } from 'react';
import {
  Box, Typography, Chip, Avatar, Card, TextField, InputAdornment, MenuItem,
  Button, Stack,
} from '@mui/material';
import {
  Assignment as AssignmentIcon, Search as SearchIcon, FilterAltOff as ClearIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ticketApi, Ticket } from '../../services/api';
import { priorityColor, severityColor, statusColor, slaColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';

const columns: GridColDef[] = [
  { field: 'key', headerName: 'Key', width: 110 },
  { field: 'summary', headerName: 'Summary', flex: 1, minWidth: 260 },
  { field: 'application', headerName: 'Application', width: 130 },
  {
    field: 'priority', headerName: 'Priority', width: 110,
    renderCell: (params) => <Chip label={params.value} color={priorityColor(params.value)} size="small" />,
  },
  {
    field: 'severity', headerName: 'Severity', width: 120,
    renderCell: (params) => <Chip label={params.value} color={severityColor(params.value)} size="small" variant="outlined" />,
  },
  {
    field: 'status', headerName: 'Status', width: 160,
    renderCell: (params) => <Chip label={params.value} color={statusColor(params.value)} size="small" />,
  },
  {
    field: 'sla', headerName: 'SLA', width: 110,
    valueGetter: (params) => params.value?.status ?? '—',
    renderCell: (params) => (
      params.value === '—'
        ? <Typography variant="body2" color="text.secondary">—</Typography>
        : <Chip label={params.value} color={slaColor(params.value)} size="small" variant="outlined" />
    ),
  },
  {
    field: 'assigneeName', headerName: 'Assignee', width: 190,
    valueGetter: (params) => params.value ?? 'Unassigned',
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
        <Avatar sx={{ width: 26, height: 26, fontSize: 13, bgcolor: params.value === 'Unassigned' ? 'grey.400' : 'primary.main' }}>
          {params.value === 'Unassigned' ? '?' : params.value.charAt(0)}
        </Avatar>
        <Typography variant="body2" noWrap>{params.value}</Typography>
      </Box>
    ),
  },
  {
    field: 'createdAt', headerName: 'Created', width: 130,
    valueFormatter: (params) => format(new Date(params.value as string), 'MMM d, yyyy'),
  },
];

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

  const applications = useMemo(
    () => [ALL, ...Array.from(new Set((tickets ?? []).map((t) => t.application))).sort()],
    [tickets]
  );
  const priorities = useMemo(
    () => [ALL, ...Array.from(new Set((tickets ?? []).map((t) => t.priority)))],
    [tickets]
  );
  const statuses = useMemo(
    () => [ALL, ...Array.from(new Set((tickets ?? []).map((t) => t.status))).sort()],
    [tickets]
  );

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        icon={AssignmentIcon}
        title="Tickets"
        subtitle={
          filtersActive
            ? `Showing ${filtered.length} of ${tickets?.length ?? 0} tickets`
            : `${tickets?.length ?? 0} tickets across all applications`
        }
        actions={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportTicketsCsv(filtered)}
            disabled={!filtered.length}
          >
            Export CSV
          </Button>
        }
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            placeholder="Search key, summary, assignee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
          <TextField select label="Application" value={application} onChange={(e) => setApplication(e.target.value)} sx={{ minWidth: 150 }}>
            {applications.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
          <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ minWidth: 130 }}>
            {priorities.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 170 }}>
            {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button
            onClick={clearFilters}
            disabled={!filtersActive}
            startIcon={<ClearIcon />}
            sx={{ flexShrink: 0 }}
          >
            Clear
          </Button>
        </Stack>
      </Card>

      <Card sx={{ height: 640, p: 1 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/tickets/${params.id}`)}
          getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'row-even' : 'row-odd')}
          sx={{
            border: 'none',
            cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': { borderBottom: '2px solid', borderColor: 'divider', fontWeight: 600 },
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
            '& .row-odd': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.selected' },
          }}
          initialState={{
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Card>
    </Box>
  );
}
