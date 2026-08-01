import { useMemo } from 'react';
import {
  Box, Card, Grid, Typography, Skeleton, Divider, Avatar, Select, MenuItem,
  Tooltip, TextField, Stack,
} from '@mui/material';
import {
  TaskAltOutlined as ActionIcon,
  EventOutlined as DateIcon,
  WarningAmberOutlined as OverdueIcon,
  PendingActionsOutlined as PendingIcon,
  DonutLargeOutlined as ProgressIcon,
  CheckCircleOutlineOutlined as DoneIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, isPast, differenceInCalendarDays } from 'date-fns';
import { actionItemApi, ActionItem } from '../../services/api';
import { safeParseArray, priorityColor, ChipColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';
import StatTile from '../../components/ui/StatTile';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import { useUrlFilter } from '../../hooks/useUrlFilter';

const ALL = 'All';
const STATUSES = ['pending', 'in_progress', 'completed', 'blocked'];

function statusTone(s: string): ChipColor {
  switch (s) {
    case 'completed': return 'success';
    case 'in_progress': return 'info';
    case 'blocked': return 'error';
    case 'pending': return 'warning';
    default: return 'default';
  }
}

const humanise = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function DueDate({ item }: { item: ActionItem }) {
  const due = new Date(item.dueDate);
  const done = item.status === 'completed';
  const overdue = !done && isPast(due);
  const days = differenceInCalendarDays(due, new Date());

  let text = format(due, 'MMM d, yyyy');
  if (!done) {
    if (overdue) text = `${Math.abs(days)}d overdue`;
    else if (days === 0) text = 'Due today';
    else if (days <= 14) text = `Due in ${days}d`;
  }

  return (
    <Tooltip title={format(due, 'MMMM d, yyyy')}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
        {overdue ? (
          <OverdueIcon sx={{ fontSize: 14, color: 'error.main' }} />
        ) : (
          <DateIcon sx={{ fontSize: 14, color: 'text.muted' }} />
        )}
        <Typography
          variant="caption"
          className="tabular-nums"
          sx={{ color: overdue ? 'error.main' : 'text.secondary', fontWeight: overdue ? 650 : 400 }}
        >
          {text}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function ActionItemsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useUrlFilter('status', ALL);
  const [assignee, setAssignee] = useUrlFilter('assignee', ALL);

  const { data: items, isLoading } = useQuery({
    queryKey: ['action-items'],
    queryFn: () => actionItemApi.getAll().then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => actionItemApi.updateStatus(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const assignees = useMemo(
    () => [ALL, ...Array.from(new Set((items ?? []).map((i) => i.assignee))).sort()],
    [items]
  );

  const filtered = useMemo(
    () => (items ?? []).filter((i) => (status === ALL || i.status === status) && (assignee === ALL || i.assignee === assignee)),
    [items, status, assignee]
  );

  const stats = useMemo(() => {
    const list = items ?? [];
    return {
      open: list.filter((i) => i.status !== 'completed').length,
      inProgress: list.filter((i) => i.status === 'in_progress').length,
      completed: list.filter((i) => i.status === 'completed').length,
      overdue: list.filter((i) => i.status !== 'completed' && isPast(new Date(i.dueDate))).length,
    };
  }, [items]);

  return (
    <Box>
      <PageHeader
        eyebrow="Governance"
        title="Action Items"
        subtitle="Tracked remediation commitments with owners and due dates"
        meta={!isLoading && stats.overdue > 0 && <StatusPill label={`${stats.overdue} overdue`} color="error" />}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {isLoading ? (
          [...Array(4)].map((_, i) => <Grid item xs={6} lg={3} key={i}><Skeleton variant="rounded" height={104} /></Grid>)
        ) : (
          <>
            <Grid item xs={6} lg={3}><StatTile label="Open" value={stats.open} icon={<PendingIcon />} tone="warning" context="Not yet complete" /></Grid>
            <Grid item xs={6} lg={3}><StatTile label="In progress" value={stats.inProgress} icon={<ProgressIcon />} tone="info" context="Actively worked" /></Grid>
            <Grid item xs={6} lg={3}><StatTile label="Overdue" value={stats.overdue} icon={<OverdueIcon />} tone="error" context="Past due date" /></Grid>
            <Grid item xs={6} lg={3}><StatTile label="Completed" value={stats.completed} icon={<DoneIcon />} tone="success" context={`of ${items?.length ?? 0} total`} /></Grid>
          </>
        )}
      </Grid>

      <Card sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
            {[ALL, ...STATUSES].map((s) => <MenuItem key={s} value={s}>{s === ALL ? ALL : humanise(s)}</MenuItem>)}
          </TextField>
          <TextField select label="Owner" value={assignee} onChange={(e) => setAssignee(e.target.value)} sx={{ minWidth: 190 }}>
            {assignees.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
        </Stack>
      </Card>

      {isLoading ? (
        <Stack spacing={1.5}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={104} />)}
        </Stack>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ActionIcon />}
            title="No matching action items"
            description="Try changing the status or owner filter."
          />
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((item) => {
            const done = item.status === 'completed';
            return (
              <Card
                key={item.id}
                sx={{
                  p: 2.25, display: 'flex', gap: 2, alignItems: 'flex-start',
                  opacity: done ? 0.72 : 1,
                  '&:hover': { borderColor: 'surface.borderStrong' },
                }}
              >
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusPill label={item.priority} color={priorityColor(item.priority)} />
                    <StatusPill label={humanise(item.status)} color={statusTone(item.status)} />
                    {safeParseArray(item.tags).map((t) => (
                      <StatusPill key={t} label={t} color="default" variant="ghost" />
                    ))}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 650, mb: 0.5, textDecoration: done ? 'line-through' : 'none' }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.5 }}>
                    {item.description}
                  </Typography>

                  <Divider sx={{ mb: 1.25 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, minWidth: 0 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.625rem', bgcolor: 'primary.main' }}>
                        {item.assignee.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary" noWrap>{item.assignee}</Typography>
                    </Box>
                    <DueDate item={item} />
                  </Box>
                </Box>

                <Select
                  size="small"
                  value={item.status}
                  onChange={(e) => updateStatus.mutate({ id: item.id, next: e.target.value })}
                  disabled={updateStatus.isPending}
                  sx={{ minWidth: 148, flexShrink: 0, fontSize: '0.75rem' }}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: '0.8125rem' }}>{humanise(s)}</MenuItem>
                  ))}
                </Select>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
