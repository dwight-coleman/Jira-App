import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Grid, Divider, IconButton, Skeleton, TextField, Button,
  FormControlLabel, Checkbox, Avatar, Tooltip, LinearProgress,
} from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  AutoAwesomeOutlined as AIIcon,
  SendOutlined as SendIcon,
  WidgetsOutlined as AppIcon,
  CategoryOutlined as TypeIcon,
  GroupsOutlined as TeamIcon,
  PersonOutlineOutlined as PersonIcon,
  ScheduleOutlined as ClockIcon,
  CheckCircleOutlineOutlined as ResolvedIcon,
  SpeedOutlined as SlaIcon,
  ForumOutlined as CommentsIcon,
  DescriptionOutlined as DescIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ticketApi } from '../../services/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import { priorityColor, severityColor, statusColor, slaColor, safeParseArray } from '../../utils/chipColors';
import SectionCard from '../../components/ui/SectionCard';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, py: 0.875 }}>
      <Box sx={{ color: 'text.muted', display: 'flex', mt: 0.125, '& svg': { fontSize: 16 } }}>{icon}</Box>
      <Box sx={{ minWidth: 0, flexGrow: 1, display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'baseline' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', minWidth: 0 }} noWrap>{value}</Typography>
      </Box>
    </Box>
  );
}

/** Progress toward an SLA target — over-target fills red and clamps at 100%. */
function SlaBar({ actual, target, label }: { actual?: number; target: number; label: string }) {
  const pct = actual ? Math.min((actual / target) * 100, 100) : 0;
  const breached = !!actual && actual > target;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 650, color: breached ? 'error.main' : 'text.primary' }}>
          {actual ?? '—'}<Typography component="span" variant="caption" color="text.secondary"> / {target}m</Typography>
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={breached ? 'error' : 'success'} sx={{ height: 5 }} />
    </Box>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const addComment = useMutation({
    mutationFn: () => ticketApi.addComment(id!, { content: commentText.trim(), authorId: user!.id, isInternal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setCommentText('');
      setIsInternal(false);
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={280} height={40} />
        <Skeleton variant="text" width={460} height={26} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}><Skeleton variant="rounded" height={420} /></Grid>
          <Grid item xs={12} lg={4}><Skeleton variant="rounded" height={420} /></Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Card>
        <EmptyState
          icon={<DescIcon />}
          title="Ticket not found"
          description="This ticket could not be loaded. It may have been removed."
          action={<Button variant="outlined" size="small" onClick={() => navigate('/tickets')}>Back to tickets</Button>}
        />
      </Card>
    );
  }

  const ai = ticket.aiAnalysis;
  const preventative = ai ? safeParseArray(ai.recommendedPreventativeActions as unknown as string) : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <IconButton size="small" onClick={() => navigate('/tickets')} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <BackIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <Typography className="tabular-nums" variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {ticket.key}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <StatusPill label={ticket.status} color={statusColor(ticket.status)} />
            <StatusPill label={ticket.priority} color={priorityColor(ticket.priority)} />
            <StatusPill label={ticket.severity} color={severityColor(ticket.severity)} variant="ghost" />
            {ticket.sla && (
              <StatusPill
                label={`SLA ${ticket.sla.status}`}
                color={slaColor(ticket.sla.status)}
                variant={ticket.sla.status === 'Breached' ? 'solid' : 'soft'}
              />
            )}
          </Box>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 600, lineHeight: 1.35 }}>{ticket.summary}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          Opened {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })} by {ticket.reporterName}
          {ticket.resolvedAt && ` · resolved ${formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}`}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="Description" icon={<DescIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.7 }}>
              {ticket.description}
            </Typography>
          </SectionCard>

          {ai && (
            <Card sx={{ mb: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.75,
                  borderBottom: '1px solid', borderColor: 'divider',
                  bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(139,92,246,0.07)' : 'rgba(124,58,237,0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 26, height: 26, borderRadius: 1, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'secondary.main', color: 'secondary.contrastText', '& svg': { fontSize: 15 },
                  }}
                >
                  <AIIcon />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', fontSize: '0.625rem', lineHeight: 1.3 }}>
                    Generated analysis
                  </Typography>
                  <Typography variant="h6">Executive Summary</Typography>
                </Box>
                <Tooltip title="Model confidence in this analysis">
                  <Box>
                    <StatusPill label={`${Math.round(ai.confidenceScore * 100)}% confidence`} color="secondary" variant="ghost" />
                  </Box>
                </Tooltip>
              </Box>

              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.75, mb: 2.5 }}>{ai.executiveSummary}</Typography>

                <Grid container spacing={2.5}>
                  {[
                    { label: 'Root cause', value: ai.rootCause },
                    { label: 'Remediation', value: ai.remediationSummary },
                    { label: 'Business impact', value: ai.businessImpact },
                  ].map((f) => (
                    <Grid item xs={12} key={f.label}>
                      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {f.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{f.value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {preventative.length > 0 && (
                  <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: 'surface.sunken', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Recommended preventative actions
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {preventative.map((action, i) => (
                        <Typography component="li" variant="body2" color="text.secondary" key={i} sx={{ lineHeight: 1.6 }}>
                          {action}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          )}

          <SectionCard
            title="Activity"
            icon={<CommentsIcon />}
            actions={
              <Typography variant="caption" color="text.secondary" className="tabular-nums">
                {ticket.comments?.length ?? 0} comment{(ticket.comments?.length ?? 0) === 1 ? '' : 's'}
              </Typography>
            }
          >
            {ticket.comments?.length ? (
              <Box sx={{ position: 'relative' }}>
                {/* Timeline rail */}
                <Box sx={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: '1px', bgcolor: 'divider' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {ticket.comments.map((c) => (
                    <Box key={c.id} sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
                      <Avatar
                        sx={{
                          width: 31, height: 31, fontSize: '0.6875rem', flexShrink: 0, zIndex: 1,
                          border: '2px solid', borderColor: 'background.paper',
                          bgcolor: c.isInternal ? 'warning.main' : 'primary.main',
                          color: c.isInternal ? 'warning.contrastText' : 'primary.contrastText',
                        }}
                      >
                        {c.authorName.charAt(0)}
                      </Avatar>
                      <Box
                        sx={{
                          flexGrow: 1, minWidth: 0, p: 1.5, borderRadius: 2, border: '1px solid',
                          borderColor: c.isInternal ? 'warning.main' : 'divider',
                          bgcolor: c.isInternal ? 'warning.light' : 'surface.sunken',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>{c.authorName}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.authorRole}</Typography>
                          {c.isInternal && <StatusPill label="Internal" color="warning" />}
                          <Box sx={{ flexGrow: 1 }} />
                          <Tooltip title={format(new Date(c.createdAt), 'MMM d, yyyy h:mm a')}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{c.content}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <EmptyState dense icon={<CommentsIcon />} title="No activity yet" description="Comments and updates will appear here." />
            )}

            <Divider sx={{ my: 2.5 }} />

            <TextField
              fullWidth multiline minRows={3}
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1.25 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Checkbox checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} size="small" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography variant="body2">Internal note</Typography>
                    <Typography variant="caption" color="text.secondary">— not customer visible</Typography>
                  </Box>
                }
              />
              <Button
                variant="contained" size="small"
                startIcon={<SendIcon sx={{ fontSize: 15 }} />}
                disabled={!commentText.trim() || addComment.isPending || !user}
                onClick={() => addComment.mutate()}
              >
                {addComment.isPending ? 'Posting…' : 'Comment'}
              </Button>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard title="Details" sx={{ mb: 2 }}>
            <Box sx={{ '& > div:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' } }}>
              <DetailRow icon={<AppIcon />} label="Application" value={ticket.application} />
              <DetailRow icon={<TypeIcon />} label="Request type" value={ticket.requestType} />
              <DetailRow icon={<TeamIcon />} label="Team" value={ticket.team ?? '—'} />
              <DetailRow icon={<PersonIcon />} label="Reporter" value={ticket.reporterName} />
              <DetailRow icon={<PersonIcon />} label="Assignee" value={ticket.assigneeName ?? 'Unassigned'} />
              <DetailRow icon={<ClockIcon />} label="Created" value={format(new Date(ticket.createdAt), 'MMM d, yyyy')} />
              {ticket.resolvedAt && (
                <DetailRow icon={<ResolvedIcon />} label="Resolved" value={format(new Date(ticket.resolvedAt), 'MMM d, yyyy')} />
              )}
              {ticket.customerSatisfaction && (
                <DetailRow icon={<ResolvedIcon />} label="Satisfaction" value={`${ticket.customerSatisfaction} / 5`} />
              )}
            </Box>
          </SectionCard>

          {ticket.sla && (
            <SectionCard
              title="Service Level"
              icon={<SlaIcon />}
              actions={
                <StatusPill
                  label={ticket.sla.status}
                  color={slaColor(ticket.sla.status)}
                  variant={ticket.sla.status === 'Breached' ? 'solid' : 'soft'}
                />
              }
            >
              <SlaBar label="Response time" actual={ticket.sla.actualResponseTime} target={ticket.sla.targetResponseTime} />
              <SlaBar label="Resolution time" actual={ticket.sla.actualResolutionTime} target={ticket.sla.targetResolutionTime} />
              {ticket.sla.breachedAt && (
                <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1.5 }}>
                  Breached {format(new Date(ticket.sla.breachedAt), 'MMM d, yyyy h:mm a')}
                </Typography>
              )}
            </SectionCard>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
