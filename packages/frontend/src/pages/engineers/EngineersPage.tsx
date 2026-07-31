import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip, Divider,
  LinearProgress, Skeleton,
} from '@mui/material';
import { Engineering as EngineeringIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { engineerApi } from '../../services/api';
import { safeParseArray, healthScoreColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';

export default function EngineersPage() {
  const { data: engineers, isLoading } = useQuery({
    queryKey: ['engineers'],
    queryFn: () => engineerApi.getAll().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rectangular" height={280} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader icon={EngineeringIcon} title="Engineers" subtitle={`${engineers?.length ?? 0} engineers across all teams`} />

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
