import {
  Box, Typography, Grid, Card, CardContent, Chip, Divider, Skeleton,
  CircularProgress, Alert, Tooltip,
} from '@mui/material';
import { Apps as AppsIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { applicationApi } from '../../services/api';
import { safeParseArray, criticalityColor, healthScoreColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';

function MetricCell({ label, value, emphasize }: { label: string; value: React.ReactNode; emphasize?: boolean }) {
  return (
    <Grid item xs={4}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}
        color={emphasize ? 'error.main' : 'text.primary'}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" textAlign="center">{label}</Typography>
    </Grid>
  );
}

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Worst health first — the applications needing attention lead the briefing.
  const sorted = [...(applications ?? [])].sort(
    (a, b) => (a.healthScores?.[0]?.healthScore ?? 101) - (b.healthScores?.[0]?.healthScore ?? 101)
  );
  const atRisk = sorted.filter((a) => (a.healthScores?.[0]?.healthScore ?? 100) < 60).length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        icon={AppsIcon}
        title="Applications"
        subtitle={`${applications?.length ?? 0} applications monitored · sorted by health score`}
      />

      {atRisk > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <strong>{atRisk}</strong> application{atRisk === 1 ? '' : 's'} scoring below 60 and requiring attention.
        </Alert>
      )}

      <Grid container spacing={3}>
        {sorted.map((app) => {
          const health = app.healthScores?.[0];
          const healthScore = health?.healthScore ?? null;
          return (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{app.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary">{app.team}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                      <Chip label={app.criticality} color={criticalityColor(app.criticality)} size="small" />
                      {health?.riskLevel && (
                        <Typography variant="caption" color="text.secondary">{health.riskLevel} risk</Typography>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {app.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {safeParseArray(app.technologies).map((tech) => (
                      <Chip key={tech} label={tech} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {health && (
                    <>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <MetricCell label="Tickets" value={health.ticketVolume} />
                        <MetricCell label="SLA Breaches" value={health.slaViolations} emphasize={health.slaViolations > 0} />
                        <MetricCell label="Critical" value={health.criticalIncidents} emphasize={health.criticalIncidents > 0} />
                      </Grid>
                      <Divider sx={{ mb: 2 }} />
                    </>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">Owner</Typography>
                      <Typography variant="body2" noWrap>{app.owner}</Typography>
                      {health && (
                        <Typography variant="caption" color="text.secondary">
                          Avg resolution {health.resolutionTime}h
                        </Typography>
                      )}
                    </Box>
                    {healthScore !== null && (
                      <Tooltip title={`Health score ${healthScore}/100`}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={56}
                            thickness={4}
                            sx={{ color: 'action.hover', position: 'absolute' }}
                          />
                          <CircularProgress
                            variant="determinate"
                            value={healthScore}
                            size={56}
                            thickness={4}
                            color={healthScoreColor(healthScore)}
                          />
                          <Box sx={{
                            top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{healthScore}</Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>

                  {health?.recommendedActions && (
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Recommended Action
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{health.recommendedActions}</Typography>
                    </Box>
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
