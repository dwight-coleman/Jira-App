import { Box, Typography, Chip, Avatar, Card } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ticketApi } from '../../services/api';
import { priorityColor, severityColor, statusColor } from '../../utils/chipColors';
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

export default function TicketsPage() {
  const navigate = useNavigate();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketApi.getAll().then((r) => r.data),
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader icon={AssignmentIcon} title="Tickets" subtitle={`${tickets?.length ?? 0} tickets across all applications`} />

      <Card sx={{ height: 640, p: 1 }}>
        <DataGrid
          rows={tickets ?? []}
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
