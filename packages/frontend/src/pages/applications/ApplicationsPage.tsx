import {
  Box, Typography, Grid, Card, CardContent, Chip, Divider, Skeleton,
  CircularProgress,
} from '@mui/material';
import { Apps as AppsIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { applicationApi } from '../../services/api';
import { safeParseArray, criticalityColor, healthScoreColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';

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
            <Skeleton variant="rectangular" height={240} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader icon={AppsIcon} title="Applications" subtitle={`${applications?.length ?? 0} applications monitored`} />

      <Grid container spacing={3}>
        {applications?.map((app) => {
          const latestHealth = app.healthScores?.[0];
          const healthScore = latestHealth?.healthScore ?? null;
          return (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{app.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary">{app.team}</Typography>
                    </Box>
                    <Chip label={app.criticality} color={criticalityColor(app.criticality)} size="small" />
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

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Owner</Typography>
                      <Typography variant="body2">{app.owner}</Typography>
                    </Box>
                    {healthScore !== null && (
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={healthScore}
                          size={48}
                          color={healthScoreColor(healthScore)}
                        />
                        <Box sx={{
                          top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{healthScore}</Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
