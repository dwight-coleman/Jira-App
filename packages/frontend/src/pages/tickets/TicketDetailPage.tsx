import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Card, CardContent, Grid, Divider, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Skeleton, Paper, TextField, Button,
  FormControlLabel, Checkbox, Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, SmartToy as AIIcon, Send as SendIcon, Info as InfoIcon,
  Business as BusinessIcon, Category as CategoryIcon, Groups as GroupsIcon, Person as PersonIcon,
  Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Speed as SlaIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ticketApi } from '../../services/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import { priorityColor, severityColor, statusColor, slaColor, safeParseArray } from '../../utils/chipColors';

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

  const addCommentMutation = useMutation({
    mutationFn: () => ticketApi.addComment(id!, { content: commentText.trim(), authorId: user!.id, isInternal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setCommentText('');
      setIsInternal(false);
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width={400} height={48} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    );
  }

  if (error || !ticket) {
    return <Typography color="error">Failed to load ticket.</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate('/tickets')} sx={{ bgcolor: 'action.hover' }}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{ticket.key}</Typography>
        <Chip label={ticket.priority} color={priorityColor(ticket.priority)} size="small" />
        <Chip label={ticket.severity} color={severityColor(ticket.severity)} size="small" variant="outlined" />
        <Chip label={ticket.status} color={statusColor(ticket.status)} size="small" />
      </Box>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>{ticket.summary}</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>
            </CardContent>
          </Card>

          {ticket.aiAnalysis && (
            <Card sx={{ mb: 3, borderTop: 3, borderColor: 'secondary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                        color: 'secondary.contrastText',
                      }}
                    >
                      <AIIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>AI Executive Summary</Typography>
                  </Box>
                  <Chip
                    label={`${Math.round(ticket.aiAnalysis.confidenceScore * 100)}% confidence`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>{ticket.aiAnalysis.executiveSummary}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">Root Cause</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{ticket.aiAnalysis.rootCause}</Typography>
                <Typography variant="caption" color="text.secondary">Remediation</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{ticket.aiAnalysis.remediationSummary}</Typography>
                <Typography variant="caption" color="text.secondary">Business Impact</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{ticket.aiAnalysis.businessImpact}</Typography>
                {safeParseArray(ticket.aiAnalysis.recommendedPreventativeActions as unknown as string).length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">Recommended Preventative Actions</Typography>
                    <List dense disablePadding sx={{ listStyleType: 'disc', pl: 3 }}>
                      {safeParseArray(ticket.aiAnalysis.recommendedPreventativeActions as unknown as string).map((action, i) => (
                        <ListItem key={i} disablePadding sx={{ display: 'list-item', py: 0.25 }}>
                          <Typography variant="body2">{action}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Comments ({ticket.comments?.length ?? 0})
              </Typography>
              {ticket.comments?.length ? (
                <List disablePadding>
                  {ticket.comments.map((c) => (
                    <ListItem key={c.id} disablePadding alignItems="flex-start" sx={{ mb: 2 }}>
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: c.isInternal ? 'warning.main' : 'primary.main' }}>
                          {c.authorName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2, flexGrow: 1, minWidth: 0,
                          bgcolor: c.isInternal ? 'warning.light' : 'background.default',
                          borderColor: c.isInternal ? 'warning.main' : 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.authorName}</Typography>
                            {c.isInternal && <Chip label="Internal" size="small" color="warning" />}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(c.createdAt), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No comments yet.</Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} size="small" />}
                  label={<Typography variant="body2">Internal note</Typography>}
                />
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  disabled={!commentText.trim() || addCommentMutation.isPending || !user}
                  onClick={() => addCommentMutation.mutate()}
                >
                  {addCommentMutation.isPending ? 'Posting…' : 'Comment'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon fontSize="small" color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Details</Typography>
              </Box>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><BusinessIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary="Application" secondary={ticket.application} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><CategoryIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary="Request Type" secondary={ticket.requestType} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><GroupsIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary="Team" secondary={ticket.team ?? '—'} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><PersonIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary="Reporter" secondary={ticket.reporterName} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><PersonIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary="Assignee" secondary={ticket.assigneeName ?? 'Unassigned'} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><ScheduleIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary="Created" secondary={format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')} />
                </ListItem>
                {ticket.resolvedAt && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText primary="Resolved" secondary={format(new Date(ticket.resolvedAt), 'MMM d, yyyy h:mm a')} />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {ticket.sla && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SlaIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>SLA</Typography>
                </Box>
                <Chip label={ticket.sla.status} color={slaColor(ticket.sla.status)} size="small" sx={{ mb: 2 }} />
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary="Response Time"
                      secondary={`${ticket.sla.actualResponseTime ?? '—'} / ${ticket.sla.targetResponseTime} min target`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Resolution Time"
                      secondary={`${ticket.sla.actualResolutionTime ?? '—'} / ${ticket.sla.targetResolutionTime} min target`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
