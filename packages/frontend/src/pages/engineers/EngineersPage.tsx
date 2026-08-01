import { useMemo } from 'react';
import {
  Box, Typography, Grid, Card, Avatar, Skeleton, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Tooltip,
} from '@mui/material';
import { GroupsOutlined as TeamIcon, PersonOutlineOutlined as PersonIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { engineerApi, Engineer } from '../../services/api';
import { safeParseArray, healthScoreColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';

interface TeamRollup {
  team: string;
  engineers: number;
  assigned: number;
  resolved: number;
  openWork: number;
  overdue: number;
  slaRate: number;
  avgResolutionHours: number;
}

function buildTeamRollups(engineers: Engineer[]): TeamRollup[] {
  const byTeam = new Map<string, Engineer[]>();
  for (const eng of engineers) {
    if (!byTeam.has(eng.team)) byTeam.set(eng.team, []);
    byTeam.get(eng.team)!.push(eng);
  }

  return Array.from(byTeam.entries())
    .map(([team, members]) => {
      const perf = members.map((m) => m.performance?.[0]).filter(Boolean);
      const assigned = perf.reduce((s, p) => s + (p!.ticketsAssigned ?? 0), 0);
      const slaMet = perf.reduce((s, p) => s + (p!.slaMet ?? 0), 0);
      const times = perf.map((p) => p!.avgResolutionTime ?? 0).filter((v) => v > 0);
      return {
        team,
        engineers: members.length,
        assigned,
        resolved: perf.reduce((s, p) => s + (p!.ticketsResolved ?? 0), 0),
        openWork: members.reduce((s, m) => s + (m.workload?.currentTickets ?? 0), 0),
        overdue: members.reduce((s, m) => s + (m.workload?.overdueTickets ?? 0), 0),
        slaRate: assigned ? Math.round((slaMet / assigned) * 1000) / 10 : 100,
        avgResolutionHours: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60) : 0,
      };
    })
    .sort((a, b) => a.slaRate - b.slaRate);
}

function EngineerCard({ eng }: { eng: Engineer }) {
  const perf = eng.performance?.[0];
  const load = eng.workload;
  const capacityPct = load?.capacity ? Math.round(load.capacity * 100) : 0;
  const capTone = capacityPct > 90 ? 'error' : capacityPct > 70 ? 'warning' : 'success';

  return (
    <Card sx={{ height: '100%', p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.75, '&:hover': { borderColor: 'surface.borderStrong', boxShadow: 1 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: '0.8125rem' }}>
          {eng.name.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 650 }}>{eng.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {eng.role} · {eng.team}
          </Typography>
        </Box>
        {perf && (
          <Tooltip title={`SLA compliance: ${perf.slaComplianceRate.toFixed(1)}%`}>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography
                className="tabular-nums"
                sx={{ fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.15, color: `${healthScoreColor(perf.slaComplianceRate)}.main` }}
              >
                {perf.slaComplianceRate.toFixed(0)}%
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', color: 'text.muted', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SLA
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {safeParseArray(eng.applications).map((app) => (
          <Box
            key={app}
            sx={{
              px: 0.75, py: 0.25, borderRadius: 0.75, border: '1px solid', borderColor: 'divider',
              bgcolor: 'surface.sunken', fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 500,
            }}
          >
            {app}
          </Box>
        ))}
      </Box>

      <Divider />

      {load && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.625rem' }}>Capacity</Typography>
            <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 650, color: `${capTone}.main` }}>
              {capacityPct}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={Math.min(capacityPct, 100)} color={capTone} sx={{ mb: 1.75 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: 'Open', value: load.openTickets },
              { label: 'In progress', value: load.inProgressTickets },
              { label: 'Overdue', value: load.overdueTickets, alert: load.overdueTickets > 0 },
            ].map((m) => (
              <Box key={m.label} sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  className="tabular-nums"
                  sx={{ fontSize: '1rem', fontWeight: 680, lineHeight: 1.2, color: m.alert ? 'error.main' : 'text.primary' }}
                >
                  {m.value}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }} noWrap>{m.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {perf && (
        <>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Resolved</Typography>
              <Typography className="tabular-nums" variant="subtitle2">{perf.ticketsResolved} / {perf.ticketsAssigned}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Avg resolution</Typography>
              <Typography className="tabular-nums" variant="subtitle2">{Math.round(perf.avgResolutionTime / 60)}h</Typography>
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
}

export default function EngineersPage() {
  const { data: engineers, isLoading } = useQuery({
    queryKey: ['engineers'],
    queryFn: () => engineerApi.getAll().then((r) => r.data),
  });

  const rollups = useMemo(() => buildTeamRollups(engineers ?? []), [engineers]);
  const totalOverdue = rollups.reduce((s, r) => s + r.overdue, 0);

  return (
    <Box>
      <PageHeader
        eyebrow="Operations"
        title="Engineers"
        subtitle="Individual workload and delivery performance, rolled up by team"
        meta={
          !isLoading && totalOverdue > 0 && <StatusPill label={`${totalOverdue} overdue`} color="error" />
        }
      />

      {isLoading ? (
        <>
          <Skeleton variant="rounded" height={230} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} md={6} xl={4} key={i}><Skeleton variant="rounded" height={286} /></Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <SectionCard
            title="Team Summary"
            eyebrow="Lowest SLA compliance first"
            icon={<TeamIcon />}
            flush
            sx={{ mb: 2 }}
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Engineers</TableCell>
                    <TableCell align="right">Assigned</TableCell>
                    <TableCell align="right">Resolved</TableCell>
                    <TableCell align="right">Open</TableCell>
                    <TableCell align="right">Overdue</TableCell>
                    <TableCell align="right">Avg resolution</TableCell>
                    <TableCell align="right">SLA compliance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rollups.map((r) => (
                    <TableRow key={r.team} hover>
                      <TableCell sx={{ fontWeight: 650 }}>{r.team}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r.engineers}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r.assigned}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r.resolved}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r.openWork}</TableCell>
                      <TableCell
                        align="right"
                        className="tabular-nums"
                        sx={{ color: r.overdue > 0 ? 'error.main' : undefined, fontWeight: r.overdue > 0 ? 700 : undefined }}
                      >
                        {r.overdue}
                      </TableCell>
                      <TableCell align="right" className="tabular-nums">{r.avgResolutionHours}h</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <StatusPill
                            label={`${r.slaRate.toFixed(0)}%`}
                            color={healthScoreColor(r.slaRate)}
                            variant={r.slaRate < 60 ? 'solid' : 'soft'}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>

          {(engineers ?? []).length === 0 ? (
            <Card><EmptyState icon={<PersonIcon />} title="No engineers" description="No active engineers are configured." /></Card>
          ) : (
            <Grid container spacing={2}>
              {engineers!.map((eng) => (
                <Grid item xs={12} md={6} xl={4} key={eng.id}>
                  <EngineerCard eng={eng} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
