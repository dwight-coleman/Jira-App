import { Box, Typography, Grid, Card, Skeleton, Alert, Tooltip, Divider, useTheme } from '@mui/material';
import {
  WarningAmberOutlined as WarningIcon,
  WidgetsOutlined as AppsIcon,
  PersonOutlineOutlined as OwnerIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { applicationApi, Application } from '../../services/api';
import { safeParseArray, criticalityColor, healthScoreColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';

/** Radial health gauge. The number is the message; the arc is the reinforcement. */
function HealthGauge({ score }: { score: number }) {
  const theme = useTheme();
  const tone = healthScoreColor(score);
  const size = 62;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box component="svg" width={size} height={size} sx={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.action.hover} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={theme.palette[tone].main}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </Box>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography className="tabular-nums" sx={{ fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography sx={{ fontSize: '0.5625rem', color: 'text.muted', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          health
        </Typography>
      </Box>
    </Box>
  );
}

function Metric({ label, value, alert }: { label: string; value: number | string; alert?: boolean }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        className="tabular-nums"
        sx={{ fontSize: '1.0625rem', fontWeight: 680, lineHeight: 1.2, color: alert ? 'error.main' : 'text.primary' }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', letterSpacing: '0.02em' }} noWrap>
        {label}
      </Typography>
    </Box>
  );
}

function AppCard({ app }: { app: Application }) {
  const health = app.healthScores?.[0];
  const score = health?.healthScore ?? null;
  const tone = score !== null ? healthScoreColor(score) : 'success';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': { borderColor: 'surface.borderStrong', boxShadow: 1 },
      }}
    >
      {/* Health accent rail */}
      {score !== null && (
        <Box sx={{ height: 3, bgcolor: `${tone}.main`, flexShrink: 0 }} />
      )}

      <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.75, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" noWrap sx={{ maxWidth: '100%' }}>{app.displayName}</Typography>
              <StatusPill label={app.criticality} color={criticalityColor(app.criticality)} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {app.team}
              {health?.riskLevel ? ` · ${health.riskLevel} risk` : ''}
            </Typography>
          </Box>
          {score !== null && (
            <Tooltip title={`Composite health score: ${score}/100`}>
              <Box><HealthGauge score={score} /></Box>
            </Tooltip>
          )}
        </Box>

        {health && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Metric label="Tickets" value={health.ticketVolume} />
              <Metric label="SLA breaches" value={health.slaViolations} alert={health.slaViolations > 0} />
              <Metric label="Critical" value={health.criticalIncidents} alert={health.criticalIncidents > 0} />
              <Metric label="Avg resolve" value={`${health.resolutionTime}h`} />
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {safeParseArray(app.technologies).slice(0, 5).map((tech) => (
            <Box
              key={tech}
              sx={{
                px: 0.75, py: 0.25, borderRadius: 0.75, border: '1px solid', borderColor: 'divider',
                bgcolor: 'surface.sunken', fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 500,
              }}
            >
              {tech}
            </Box>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <OwnerIcon sx={{ fontSize: 15, color: 'text.muted' }} />
          <Typography variant="caption" color="text.secondary" noWrap>{app.owner}</Typography>
        </Box>

        {health?.recommendedActions && (
          <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'surface.sunken', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', fontSize: '0.625rem', mb: 0.25 }}>
              Recommended action
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {health.recommendedActions}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll().then((r) => r.data),
  });

  // Worst health first — the applications needing attention lead the briefing.
  const sorted = [...(applications ?? [])].sort(
    (a, b) => (a.healthScores?.[0]?.healthScore ?? 101) - (b.healthScores?.[0]?.healthScore ?? 101)
  );
  const atRisk = sorted.filter((a) => (a.healthScores?.[0]?.healthScore ?? 100) < 60);

  return (
    <Box>
      <PageHeader
        eyebrow="Operations"
        title="Applications"
        subtitle="Composite health derived from ticket volume, severity, SLA performance, and critical incidents"
        meta={
          !isLoading && (
            <StatusPill
              label={`${applications?.length ?? 0} monitored`}
              color="default"
              variant="ghost"
            />
          )
        }
      />

      {!isLoading && atRisk.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon sx={{ fontSize: 19 }} />} sx={{ mb: 2 }}>
          <Typography variant="body2" component="span">
            <strong>{atRisk.length}</strong> application{atRisk.length === 1 ? '' : 's'} scoring below 60 —{' '}
            {atRisk.map((a) => a.displayName).join(', ')}
          </Typography>
        </Alert>
      )}

      {isLoading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} md={6} xl={4} key={i}>
              <Skeleton variant="rounded" height={286} />
            </Grid>
          ))}
        </Grid>
      ) : sorted.length === 0 ? (
        <Card><EmptyState icon={<AppsIcon />} title="No applications" description="No applications are currently being monitored." /></Card>
      ) : (
        <Grid container spacing={2}>
          {sorted.map((app) => (
            <Grid item xs={12} md={6} xl={4} key={app.id}>
              <AppCard app={app} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
