import { Box, Grid, Card, CardContent, Typography, Skeleton, useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  CheckCircle as ResolvedIcon,
  Warning as CriticalIcon,
  Speed as SlaIcon,
  Apps as AppsIcon,
  PriorityHigh as PriorityIcon,
  Timeline as TimelineIcon,
  Inbox as InboxIcon,
  HourglassBottom as HourglassIcon,
  ShowChart as ShowChartIcon,
  TrackChanges as TargetIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { dashboardApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { priorityColor, statusColor, ChipColor } from '../../utils/chipColors';
import { categoricalPalette, chartChrome } from '../../theme/chartPalette';

type SemanticColor = 'primary' | 'success' | 'error' | 'info' | 'warning' | 'secondary';

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: SemanticColor }) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: `${color}.main` }} />
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 3 }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
            color: `${color}.contrastText`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function ChartCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

function chipColorToHex(theme: Theme, color: ChipColor): string {
  if (color === 'default') return theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[600];
  return theme.palette[color].main;
}

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chrome = chartChrome(isDark);
  const categorical = categoricalPalette(isDark);

  const tooltipStyle = {
    contentStyle: { background: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 8, fontSize: 13 },
    labelStyle: { color: chrome.tooltipText, fontWeight: 600 },
    itemStyle: { color: chrome.tooltipText },
  };

  const { data: kpis, isLoading: kpisLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardApi.getKPIs().then((r) => r.data),
  });

  const { data: monthlyTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['dashboard-monthly-trend'],
    queryFn: () => dashboardApi.getMonthlyTrend().then((r) => r.data),
  });

  const { data: slaTrend, isLoading: slaTrendLoading } = useQuery({
    queryKey: ['dashboard-sla-trend'],
    queryFn: () => dashboardApi.getSLACompliance().then((r) => r.data),
  });

  const trendData = (monthlyTrend ?? []).map((p) => ({ ...p, label: format(new Date(p.month as string), 'MMM') }));
  const slaData = (slaTrend ?? []).map((p) => ({ ...p, label: format(new Date(p.month as string), 'MMM') }));

  const { data: byApplication, isLoading: byAppLoading } = useQuery({
    queryKey: ['dashboard-tickets-by-application'],
    queryFn: () => dashboardApi.getTicketsByApplication().then((r) => r.data),
  });

  const { data: byPriority, isLoading: byPriorityLoading } = useQuery({
    queryKey: ['dashboard-tickets-by-priority'],
    queryFn: () => dashboardApi.getTicketsByPriority().then((r) => r.data),
  });

  const { data: byStatus, isLoading: byStatusLoading } = useQuery({
    queryKey: ['dashboard-tickets-by-status'],
    queryFn: () => dashboardApi.getTicketsByStatus().then((r) => r.data),
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        icon={DashboardIcon}
        title="Executive Dashboard"
        subtitle={`Operational overview across all applications · Data as of ${dataUpdatedAt ? format(new Date(dataUpdatedAt), "MMM d, yyyy h:mm a") : '—'}`}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          {kpisLoading ? <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} /> : (
            <KpiCard icon={<TicketIcon />} label="Total Tickets" value={kpis?.totalTickets ?? 0} color="primary" />
          )}
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          {kpisLoading ? <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} /> : (
            <KpiCard icon={<InboxIcon />} label="Open" value={kpis?.openTickets ?? 0} color="warning" />
          )}
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          {kpisLoading ? <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} /> : (
            <KpiCard icon={<ResolvedIcon />} label="Resolved" value={kpis?.resolvedTickets ?? 0} color="success" />
          )}
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          {kpisLoading ? <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} /> : (
            <KpiCard icon={<CriticalIcon />} label="Critical" value={kpis?.criticalTickets ?? 0} color="error" />
          )}
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          {kpisLoading ? <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} /> : (
            <KpiCard icon={<SlaIcon />} label="SLA Compliance" value={`${kpis?.slaCompliance ?? 0}%`} color="info" />
          )}
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          {kpisLoading ? <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} /> : (
            <KpiCard icon={<HourglassIcon />} label="Avg Resolution" value={`${kpis?.avgResolutionTime ?? 0}h`} color="secondary" />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard icon={<ShowChartIcon fontSize="small" />} title="Monthly Ticket Volume">
            {trendLoading ? <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} /> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <ChartTooltip {...tooltipStyle} formatter={(value: number) => [value, 'Tickets']} />
                  <Line type="monotone" dataKey="value" stroke={categorical[0]} strokeWidth={2} dot={{ r: 3, fill: categorical[0] }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard icon={<TargetIcon fontSize="small" />} title="SLA Compliance Trend (target 95%)">
            {slaTrendLoading ? <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} /> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <ChartTooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, 'SLA Compliance']} />
                  <ReferenceLine y={95} stroke={theme.palette.text.secondary} strokeDasharray="6 4" />
                  <Line type="monotone" dataKey="value" stroke={categorical[2]} strokeWidth={2} dot={{ r: 3, fill: categorical[2] }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <ChartCard icon={<AppsIcon fontSize="small" />} title="Tickets by Application">
            {byAppLoading ? <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byApplication ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="application" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <ChartTooltip {...tooltipStyle} cursor={{ fill: theme.palette.action.hover }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(byApplication ?? []).map((entry, i) => (
                      <Cell key={entry.application ?? i} fill={categorical[i % categorical.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <ChartCard icon={<PriorityIcon fontSize="small" />} title="Tickets by Priority">
            {byPriorityLoading ? <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byPriority ?? []} dataKey="count" nameKey="priority" outerRadius={100} label>
                    {(byPriority ?? []).map((entry) => (
                      <Cell key={entry.priority} fill={chipColorToHex(theme, priorityColor(entry.priority as string))} />
                    ))}
                  </Pie>
                  <ChartTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <ChartCard icon={<TimelineIcon fontSize="small" />} title="Tickets by Status">
            {byStatusLoading ? <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byStatus ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <YAxis dataKey="status" type="category" width={160} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: chrome.axis }} tickLine={false} />
                  <ChartTooltip {...tooltipStyle} cursor={{ fill: theme.palette.action.hover }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {(byStatus ?? []).map((entry, i) => (
                      <Cell key={entry.status ?? i} fill={chipColorToHex(theme, statusColor(entry.status as string))} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
