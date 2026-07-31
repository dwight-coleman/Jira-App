import { useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip, Divider,
  LinearProgress, Skeleton, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { Engineering as EngineeringIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { engineerApi, Engineer } from '../../services/api';
import { safeParseArray, healthScoreColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';

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
      const resolved = perf.reduce((s, p) => s + (p!.ticketsResolved ?? 0), 0);
      const slaMet = perf.reduce((s, p) => s + (p!.slaMet ?? 0), 0);
      const resolutionTimes = perf.map((p) => p!.avgResolutionTime ?? 0).filter((v) => v > 0);
      return {
        team,
        engineers: members.length,
        assigned,
        resolved,
        openWork: members.reduce((s, m) => s + (m.workload?.currentTickets ?? 0), 0),
        overdue: members.reduce((s, m) => s + (m.workload?.overdueTickets ?? 0), 0),
        slaRate: assigned ? Math.round((slaMet / assigned) * 1000) / 10 : 100,
        avgResolutionHours: resolutionTimes.length
          ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length / 60)
          : 0,
      };
    })
    .sort((a, b) => a.slaRate - b.slaRate);
}

export default function EngineersPage() {
  const { data: engineers, isLoading } = useQuery({
    queryKey: ['engineers'],
    queryFn: () => engineerApi.getAll().then((r) => r.data),
  });

  const rollups = useMemo(() => buildTeamRollups(engineers ?? []), [engineers]);

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        icon={EngineeringIcon}
        title="Engineers"
        subtitle={`${engineers?.length ?? 0} engineers across ${rollups.length} team${rollups.length === 1 ? '' : 's'}`}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GroupsIcon fontSize="small" color="action" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Team Summary</Typography>
            <Typography variant="caption" color="text.secondary">· lowest SLA compliance first</Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Engineers</TableCell>
                  <TableCell align="right">Assigned</TableCell>
                  <TableCell align="right">Resolved</TableCell>
                  <TableCell align="right">Open</TableCell>
                  <TableCell align="right">Overdue</TableCell>
                  <TableCell align="right">Avg Resolution</TableCell>
                  <TableCell align="right">SLA Compliance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rollups.map((r) => (
                  <TableRow key={r.team} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.team}</TableCell>
                    <TableCell align="right">{r.engineers}</TableCell>
                    <TableCell align="right">{r.assigned}</TableCell>
                    <TableCell align="right">{r.resolved}</TableCell>
                    <TableCell align="right">{r.openWork}</TableCell>
                    <TableCell align="right" sx={{ color: r.overdue > 0 ? 'error.main' : undefined, fontWeight: r.overdue > 0 ? 600 : undefined }}>
                      {r.overdue}
                    </TableCell>
                    <TableCell align="right">{r.avgResolutionHours}h</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${r.slaRate.toFixed(0)}%`}
                        size="small"
                        color={healthScoreColor(r.slaRate)}
                        variant={r.slaRate >= 80 ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {engineers?.map((eng) => {
          const performance = eng.performance?.[0];
          const capacityPct = eng.workload?.capacity ? Math.round(eng.workload.capacity * 100) : 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={eng.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 44, height: 44, fontWeight: 600,
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      }}
                    >
                      {eng.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{eng.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{eng.role} · {eng.team}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {safeParseArray(eng.applications).map((app) => (
                      <Chip key={app} label={app} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {eng.workload && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Capacity</Typography>
                        <Typography variant="caption" color="text.secondary">{capacityPct}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(capacityPct, 100)}
                        color={capacityPct > 90 ? 'error' : capacityPct > 70 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>{eng.workload.openTickets}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">Open</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>{eng.workload.inProgressTickets}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">In Progress</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, textAlign: 'center' }}
                            color={eng.workload.overdueTickets > 0 ? 'error.main' : 'text.primary'}
                          >
                            {eng.workload.overdueTickets}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">Overdue</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {performance && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">SLA Compliance</Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            color={`${healthScoreColor(performance.slaComplianceRate)}.main`}
                          >
                            {performance.slaComplianceRate.toFixed(0)}%
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">Avg Resolution</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {Math.round(performance.avgResolutionTime / 60)}h
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
