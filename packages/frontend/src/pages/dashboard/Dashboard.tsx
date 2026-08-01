import { Box, Grid, Skeleton, Typography, useTheme, Divider, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  ConfirmationNumberOutlined as TicketIcon,
  InboxOutlined as OpenIcon,
  CheckCircleOutlineOutlined as ResolvedIcon,
  ErrorOutlineOutlined as CriticalIcon,
  SpeedOutlined as SlaIcon,
  HourglassBottomOutlined as TimeIcon,
  ShowChartOutlined as TrendIcon,
  TrackChangesOutlined as TargetIcon,
  WidgetsOutlined as AppsIcon,
  FlagOutlined as PriorityIcon,
  DonutLargeOutlined as StatusIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { dashboardApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import SectionCard from '../../components/ui/SectionCard';
import StatTile from '../../components/ui/StatTile';
import ChartTooltip from '../../components/ui/ChartTooltip';
import StatusPill from '../../components/ui/StatusPill';
import { priorityColor, statusColor, ChipColor } from '../../utils/chipColors';
import { categoricalPalette, chartChrome } from '../../theme/chartPalette';

const SLA_TARGET = 95;

function toneHex(theme: Theme, c: ChipColor): string {
  if (c === 'default') return theme.palette.text.disabled;
  return theme.palette[c].main;
}

/** Percent change between the last two points of a trend series. */
function trendDelta(points: { value: number }[] | undefined) {
  if (!points || points.length < 2) return undefined;
  const prev = points[points.length - 2].value;
  const curr = points[points.length - 1].value;
  if (!prev) return undefined;
  return Math.round(((curr - prev) / prev) * 100);
}

/** How many trailing months of trend history each range shows. */
const RANGES = [
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: 'all', label: 'All', months: 99 },
] as const;

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [range, setRange] = useUrlFilter('range', '6m');
  const months = RANGES.find((r) => r.key === range)?.months ?? 6;
  const isDark = theme.palette.mode === 'dark';
  const chrome = chartChrome(isDark);
  const palette = categoricalPalette(isDark);

  const axis = {
    tick: { fontSize: 11, fill: chrome.axisText },
    axisLine: { stroke: chrome.axis },
    tickLine: false as const,
  };

  const { data: kpis, isLoading: kpisLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardApi.getKPIs().then((r) => r.data),
  });
  const { data: byApplication, isLoading: appLoading } = useQuery({
    queryKey: ['dashboard-tickets-by-application'],
    queryFn: () => dashboardApi.getTicketsByApplication().then((r) => r.data),
  });
  const { data: byPriority, isLoading: prioLoading } = useQuery({
    queryKey: ['dashboard-tickets-by-priority'],
    queryFn: () => dashboardApi.getTicketsByPriority().then((r) => r.data),
  });
  const { data: byStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['dashboard-tickets-by-status'],
    queryFn: () => dashboardApi.getTicketsByStatus().then((r) => r.data),
  });
  const { data: volumeTrend, isLoading: volLoading } = useQuery({
    queryKey: ['dashboard-monthly-trend'],
    queryFn: () => dashboardApi.getMonthlyTrend().then((r) => r.data),
  });
  const { data: slaTrend, isLoading: slaLoading } = useQuery({
    queryKey: ['dashboard-sla-trend'],
    queryFn: () => dashboardApi.getSLACompliance().then((r) => r.data),
  });

  const volumeData = (volumeTrend ?? [])
    .map((p) => ({ ...p, label: format(new Date(p.month as string), 'MMM') }))
    .slice(-months);
  const slaData = (slaTrend ?? [])
    .map((p) => ({ ...p, label: format(new Date(p.month as string), 'MMM') }))
    .slice(-months);

  const slaValue = Number(kpis?.slaCompliance ?? 0);
  const slaHealthy = slaValue >= SLA_TARGET;
  const resolutionRate = kpis?.totalTickets
    ? Math.round((kpis.resolvedTickets / kpis.totalTickets) * 100)
    : 0;

  const tiles = [
    { label: 'Total Tickets', value: kpis?.totalTickets ?? 0, icon: <TicketIcon />, tone: 'primary' as const,
      context: 'Reporting period', delta: trendDelta(volumeTrend as { value: number }[] | undefined), goodDirection: 'down' as const },
    { label: 'Open', value: kpis?.openTickets ?? 0, icon: <OpenIcon />, tone: 'warning' as const, context: 'Awaiting resolution' },
    { label: 'Resolved', value: kpis?.resolvedTickets ?? 0, icon: <ResolvedIcon />, tone: 'success' as const, context: `${resolutionRate}% of total` },
    { label: 'Critical', value: kpis?.criticalTickets ?? 0, icon: <CriticalIcon />, tone: 'error' as const, context: 'Highest priority' },
    { label: 'SLA Compliance', value: `${slaValue}%`, icon: <SlaIcon />, tone: slaHealthy ? 'success' as const : 'error' as const,
      context: `Target ${SLA_TARGET}%`, hint: `${slaHealthy ? 'Meeting' : 'Below'} the ${SLA_TARGET}% target` },
    { label: 'Avg Resolution', value: `${kpis?.avgResolutionTime ?? 0}h`, icon: <TimeIcon />, tone: 'info' as const, context: 'Mean time to resolve' },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="Overview"
        title="Executive Dashboard"
        subtitle={`Operational posture across all supported applications${dataUpdatedAt ? ` · updated ${format(new Date(dataUpdatedAt), 'MMM d, h:mm a')}` : ''}`}
        meta={
          !kpisLoading && (
            <StatusPill
              label={slaHealthy ? 'SLA on target' : 'SLA below target'}
              color={slaHealthy ? 'success' : 'error'}
            />
          )
        }
        actions={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={range}
            onChange={(_, v) => v && setRange(v)}
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600, textTransform: 'none',
                borderColor: 'divider', color: 'text.secondary',
                '&.Mui-selected': { bgcolor: 'action.selected', color: 'primary.main' },
              },
            }}
          >
            {RANGES.map((r) => (
              <ToggleButton key={r.key} value={r.key} aria-label={`Show ${r.label} of history`}>
                {r.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      {/* KPI band */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {tiles.map((t) => (
          <Grid item xs={6} sm={4} lg={2} key={t.label}>
            {kpisLoading ? (
              <Skeleton variant="rounded" height={104} />
            ) : (
              <StatTile
                label={t.label}
                value={t.value}
                icon={t.icon}
                tone={t.tone}
                context={t.context}
                hint={t.hint}
                delta={t.delta !== undefined ? { value: t.delta, goodDirection: t.goodDirection } : undefined}
              />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Trends */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Ticket Volume"
            eyebrow="6-month trend"
            icon={<TrendIcon />}
            actions={
              volumeData.length > 0 && (
                <Typography variant="caption" color="text.secondary" className="tabular-nums">
                  {volumeData[volumeData.length - 1].value} this period
                </Typography>
              )
            }
          >
            {volLoading ? (
              <Skeleton variant="rounded" height={228} />
            ) : (
              <ResponsiveContainer width="100%" height={228}>
                <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette[0]} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={palette[0]} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis allowDecimals={false} {...axis} width={38} />
                  <RTooltip content={<ChartTooltip seriesLabel="Tickets" />} cursor={{ stroke: chrome.axis, strokeWidth: 1 }} />
                  <Area
                    type="monotone" dataKey="value" stroke={palette[0]} strokeWidth={2}
                    fill="url(#volFill)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: theme.palette.background.paper }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="SLA Compliance"
            eyebrow={`Target ${SLA_TARGET}%`}
            icon={<TargetIcon />}
            actions={<StatusPill label={slaHealthy ? 'On target' : 'Below target'} color={slaHealthy ? 'success' : 'error'} />}
          >
            {slaLoading ? (
              <Skeleton variant="rounded" height={228} />
            ) : (
              <ResponsiveContainer width="100%" height={228}>
                <LineChart data={slaData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} {...axis} width={38} />
                  <RTooltip content={<ChartTooltip seriesLabel="Compliance" format={(v) => `${v}%`} />} cursor={{ stroke: chrome.axis, strokeWidth: 1 }} />
                  <ReferenceLine
                    y={SLA_TARGET}
                    stroke={chrome.reference}
                    strokeDasharray="5 4"
                    label={{ value: `${SLA_TARGET}%`, position: 'right', fill: chrome.axisText, fontSize: 10 }}
                  />
                  <Line
                    type="monotone" dataKey="value" stroke={palette[2]} strokeWidth={2}
                    dot={{ r: 2.5, fill: palette[2], strokeWidth: 0 }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: theme.palette.background.paper }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Distributions */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Volume by Application"
            eyebrow="Distribution"
            icon={<AppsIcon />}
            actions={<Typography variant="caption" color="text.secondary">Click to drill down</Typography>}
          >
            {appLoading ? (
              <Skeleton variant="rounded" height={252} />
            ) : (
              <ResponsiveContainer width="100%" height={252}>
                <BarChart data={byApplication ?? []} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={chrome.grid} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} {...axis} />
                  <YAxis dataKey="application" type="category" width={62} {...axis} />
                  <RTooltip content={<ChartTooltip seriesLabel="Tickets" />} cursor={{ fill: theme.palette.action.hover }} />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                    cursor="pointer"
                    onClick={(d: { application?: string }) =>
                      d?.application && navigate(`/tickets?application=${encodeURIComponent(d.application)}`)
                    }
                  >
                    {(byApplication ?? []).map((e, i) => (
                      <Cell key={e.application ?? i} fill={palette[i % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <SectionCard title="By Priority" eyebrow="Distribution" icon={<PriorityIcon />}>
            {prioLoading ? (
              <Skeleton variant="rounded" height={252} />
            ) : (
              <Box>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={byPriority ?? []}
                      dataKey="count"
                      nameKey="priority"
                      innerRadius={42}
                      outerRadius={64}
                      paddingAngle={2}
                      stroke={theme.palette.background.paper}
                      strokeWidth={2}
                    >
                      {(byPriority ?? []).map((e) => (
                        <Cell key={e.priority} fill={toneHex(theme, priorityColor(e.priority as string))} />
                      ))}
                    </Pie>
                    <RTooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {(byPriority ?? []).map((e) => (
                    <Tooltip key={e.priority} title={`View ${e.priority} tickets`} placement="left">
                      <Box
                        onClick={() => navigate(`/tickets?priority=${encodeURIComponent(e.priority as string)}`)}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
                          cursor: 'pointer', borderRadius: 1, px: 0.75, py: 0.375, mx: -0.75,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, minWidth: 0 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: 0.5, flexShrink: 0, bgcolor: toneHex(theme, priorityColor(e.priority as string)) }} />
                          <Typography variant="caption" color="text.secondary" noWrap>{e.priority}</Typography>
                        </Box>
                        <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 650 }}>{e.count}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <SectionCard title="By Status" eyebrow="Workflow state" icon={<StatusIcon />}>
            {statusLoading ? (
              <Skeleton variant="rounded" height={252} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.375 }}>
                {(() => {
                  const rows = byStatus ?? [];
                  const max = Math.max(...rows.map((r) => Number(r.count) || 0), 1);
                  return rows.map((r) => {
                    const hex = toneHex(theme, statusColor(r.status as string));
                    return (
                      <Tooltip key={r.status as string} title={`View ${r.status} tickets`} placement="left">
                        <Box
                          onClick={() => navigate(`/tickets?status=${encodeURIComponent(r.status as string)}`)}
                          sx={{ cursor: 'pointer', borderRadius: 1, px: 0.75, py: 0.375, mx: -0.75, '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" noWrap>{r.status}</Typography>
                            <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 650 }}>{r.count}</Typography>
                          </Box>
                          <Box sx={{ height: 6, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
                            <Box sx={{ width: `${(Number(r.count) / max) * 100}%`, height: '100%', borderRadius: 999, bgcolor: hex, transition: 'width 400ms ease' }} />
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  });
                })()}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
