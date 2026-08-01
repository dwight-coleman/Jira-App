import { useState } from 'react';
import {
  Box, Card, Grid, Typography, Skeleton, Divider, Tabs, Tab, Tooltip,
} from '@mui/material';
import {
  ShieldOutlined as RiskIcon,
  ReplayOutlined as RecurringIcon,
  PersonOutlineOutlined as OwnerIcon,
  EventOutlined as DateIcon,
  PaidOutlined as CostIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { riskApi, OperationalRisk, RecurringIssue } from '../../services/api';
import { safeParseArray, ChipColor } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';
import StatusPill from '../../components/ui/StatusPill';
import StatTile from '../../components/ui/StatTile';
import EmptyState from '../../components/ui/EmptyState';

/** Risk score is likelihood × impact on a 1–4 scale each, so 1–16. */
function scoreTone(score: number): ChipColor {
  if (score >= 12) return 'error';
  if (score >= 8) return 'warning';
  if (score >= 4) return 'info';
  return 'success';
}

function scoreLabel(score: number): string {
  if (score >= 12) return 'Critical';
  if (score >= 8) return 'High';
  if (score >= 4) return 'Moderate';
  return 'Low';
}

function statusTone(status: string): ChipColor {
  switch (status) {
    case 'open': return 'error';
    case 'mitigating': return 'warning';
    case 'monitoring': return 'info';
    case 'closed': return 'success';
    default: return 'default';
  }
}

function fixStatusTone(status: string): ChipColor {
  switch (status) {
    case 'not_started': return 'error';
    case 'in_progress': return 'warning';
    case 'complete': return 'success';
    default: return 'default';
  }
}

const humanise = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function RiskCard({ risk }: { risk: OperationalRisk }) {
  const tone = scoreTone(risk.riskScore);
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', '&:hover': { borderColor: 'surface.borderStrong', boxShadow: 1 } }}>
      <Box sx={{ height: 3, bgcolor: `${tone}.main`, flexShrink: 0 }} />
      <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.75, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75, flexWrap: 'wrap' }}>
              <StatusPill label={humanise(risk.status)} color={statusTone(risk.status)} />
              <StatusPill label={risk.category} color="default" variant="ghost" />
            </Box>
            <Typography variant="h6" sx={{ lineHeight: 1.4 }}>{risk.title}</Typography>
          </Box>
          <Tooltip title={`Likelihood ${risk.likelihood} × Impact ${risk.impact}`}>
            <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
              <Typography className="tabular-nums" sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: `${tone}.main` }}>
                {risk.riskScore}
              </Typography>
              <Typography sx={{ fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.muted' }}>
                {scoreLabel(risk.riskScore)}
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
          {risk.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Likelihood</Typography>
            <Typography variant="subtitle2">{risk.likelihood}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Impact</Typography>
            <Typography variant="subtitle2">{risk.impact}</Typography>
          </Box>
          <Box sx={{ flex: 1.4, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Affected</Typography>
            <Typography variant="subtitle2" noWrap>
              {safeParseArray(risk.affectedApplications).join(', ') || '—'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'surface.sunken', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', fontSize: '0.625rem', mb: 0.375 }}>
            Mitigation
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.55 }}>{risk.mitigation}</Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625, minWidth: 0 }}>
            <OwnerIcon sx={{ fontSize: 14, color: 'text.muted' }} />
            <Typography variant="caption" color="text.secondary" noWrap>{risk.owner}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
            <DateIcon sx={{ fontSize: 14, color: 'text.muted' }} />
            <Typography variant="caption" color="text.secondary" className="tabular-nums">
              Review {format(new Date(risk.nextReviewAt), 'MMM d')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function RecurringCard({ issue }: { issue: RecurringIssue }) {
  const tone = fixStatusTone(issue.fixStatus);
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.25, gap: 1.75, '&:hover': { borderColor: 'surface.borderStrong', boxShadow: 1 } }}>
      <Box>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75, flexWrap: 'wrap' }}>
          <StatusPill label={`${issue.frequency}× recurrence`} color="warning" />
          <StatusPill label={humanise(issue.fixStatus)} color={tone} />
          <StatusPill label={`${issue.businessImpact} impact`} color="default" variant="ghost" />
        </Box>
        <Typography variant="h6" sx={{ lineHeight: 1.4 }}>{issue.title}</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>{issue.description}</Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>SLA impact</Typography>
          <Typography className="tabular-nums" variant="subtitle2" sx={{ color: 'error.main' }}>
            −{issue.slaImpact}%
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Est. annual cost</Typography>
          <Typography className="tabular-nums" variant="subtitle2">
            ${(issue.costEstimate / 1000).toFixed(0)}k
          </Typography>
        </Box>
        <Box sx={{ flex: 1.2, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Affected</Typography>
          <Typography variant="subtitle2" noWrap>{safeParseArray(issue.affectedApplications).join(', ') || '—'}</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'surface.sunken', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', fontSize: '0.625rem', mb: 0.375 }}>
          Permanent fix
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.55 }}>{issue.permanentFix}</Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625, minWidth: 0 }}>
          <OwnerIcon sx={{ fontSize: 14, color: 'text.muted' }} />
          <Typography variant="caption" color="text.secondary" noWrap>{issue.fixOwner}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
          <DateIcon sx={{ fontSize: 14, color: 'text.muted' }} />
          <Typography variant="caption" color="text.secondary" className="tabular-nums">
            Target {format(new Date(issue.fixTargetDate), 'MMM d, yyyy')}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default function RisksPage() {
  const [tab, setTab] = useState(0);

  const { data: risks, isLoading: risksLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: () => riskApi.getRisks().then((r) => r.data),
  });
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['recurring-issues'],
    queryFn: () => riskApi.getRecurringIssues().then((r) => r.data),
  });

  const isLoading = risksLoading || issuesLoading;
  const criticalRisks = (risks ?? []).filter((r) => r.riskScore >= 12).length;
  const openRisks = (risks ?? []).filter((r) => r.status === 'open').length;
  const totalSlaImpact = (issues ?? []).reduce((s, i) => s + i.slaImpact, 0);
  const totalCost = (issues ?? []).reduce((s, i) => s + i.costEstimate, 0);

  return (
    <Box>
      <PageHeader
        eyebrow="Governance"
        title="Risk Register"
        subtitle="Operational risks and recurring incident patterns, with owners and mitigation status"
        meta={!isLoading && criticalRisks > 0 && <StatusPill label={`${criticalRisks} critical`} color="error" />}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Grid item xs={6} lg={3} key={i}><Skeleton variant="rounded" height={104} /></Grid>
          ))
        ) : (
          <>
            <Grid item xs={6} lg={3}>
              <StatTile label="Open risks" value={openRisks} icon={<RiskIcon />} tone="error" context={`of ${risks?.length ?? 0} tracked`} />
            </Grid>
            <Grid item xs={6} lg={3}>
              <StatTile label="Critical severity" value={criticalRisks} icon={<RiskIcon />} tone="warning" context="Score 12 or above" />
            </Grid>
            <Grid item xs={6} lg={3}>
              <StatTile label="Recurring issues" value={issues?.length ?? 0} icon={<RecurringIcon />} tone="info" context="Identified patterns" />
            </Grid>
            <Grid item xs={6} lg={3}>
              <StatTile
                label="Est. annual cost"
                value={`$${(totalCost / 1000).toFixed(0)}k`}
                icon={<CostIcon />}
                tone="neutral"
                context={`${totalSlaImpact.toFixed(1)}% total SLA impact`}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }}>
        <Tab label={`Operational Risks (${risks?.length ?? 0})`} />
        <Tab label={`Recurring Issues (${issues?.length ?? 0})`} />
      </Tabs>

      {isLoading ? (
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} xl={6} key={i}><Skeleton variant="rounded" height={300} /></Grid>
          ))}
        </Grid>
      ) : tab === 0 ? (
        (risks ?? []).length === 0 ? (
          <Card><EmptyState icon={<RiskIcon />} title="No risks recorded" description="Operational risks will appear here once identified." /></Card>
        ) : (
          <Grid container spacing={2}>
            {risks!.map((r) => (
              <Grid item xs={12} xl={6} key={r.id}><RiskCard risk={r} /></Grid>
            ))}
          </Grid>
        )
      ) : (issues ?? []).length === 0 ? (
        <Card><EmptyState icon={<RecurringIcon />} title="No recurring issues" description="Recurring incident patterns will appear here once detected." /></Card>
      ) : (
        <Grid container spacing={2}>
          {issues!.map((i) => (
            <Grid item xs={12} xl={6} key={i.id}><RecurringCard issue={i} /></Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
