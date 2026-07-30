import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  Skeleton,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMoreIcon,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  Article as ArticleIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { MonthlyReport } from '../../services/api';
import { format } from 'date-fns';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  draft: 'default',
  pending_review: 'warning',
  approved: 'info',
  published: 'success',
  archived: 'secondary',
};

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['monthly-reports'],
    queryFn: () => api.reportApi.getMonthlyReports(),
  });

  const [selectedReport, setSelectedReport] = React.useState<MonthlyReport | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newReportTitle, setNewReportTitle] = React.useState('');

  if (isLoading) {
    return (
      <Grid container spacing={3} sx={{ p: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={180} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon color="primary" /> Executive Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monthly operational intelligence reports with KPIs, trends, and AI narratives
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => {}}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogOpen(true); setNewReportTitle(''); }}>
            Generate Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {reports?.map((report) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={report.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{report.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(report.periodStart), 'MMM d')} – {format(new Date(report.periodEnd), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Chip
                    label={report.status}
                    color={statusColors[report.status] || 'default'}
                    size="small"
                    variant="filled"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {report.executiveSummary}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="View Report">
                    <IconButton size="small" onClick={() => setSelectedReport(report)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton size="small"><PictureAsPdfIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Download Excel">
                    <IconButton size="small"><TableChartIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {(!reports || reports.length === 0) && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>No Reports Yet</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Generate your first executive report to see operational insights.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Report Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setSelectedReport(null); }} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedReport ? 'Report Details' : 'Generate New Report'}</DialogTitle>
        <DialogContent dividers>
          {selectedReport ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{selectedReport.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Period: {format(new Date(selectedReport.periodStart), 'MMM d, yyyy')} – {format(new Date(selectedReport.periodEnd), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3, whiteSpace: 'pre-wrap' }}>
                {selectedReport.executiveSummary}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Key Metrics</Typography>
              <Grid container spacing={2}>
                {selectedReport.kpis?.map((kpi: any, i: number) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">{kpi.name}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{kpi.value}</Typography>
                        <Typography variant="caption" color="text.secondary">Target: {kpi.target}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                label="Report Title"
                value={newReportTitle}
                onChange={(e) => setNewReportTitle(e.target.value)}
                placeholder="e.g., Executive Service Desk Report - January 2026"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Period</InputLabel>
                <Select label="Period" defaultValue="last-month">
                  <MenuItem value="last-month">Last Month</MenuItem>
                  <MenuItem value="this-month">This Month</MenuItem>
                  <MenuItem value="last-quarter">Last Quarter</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Template</InputLabel>
                <Select label="Template" defaultValue="standard">
                  <MenuItem value="standard">Standard Executive Report</MenuItem>
                  <MenuItem value="detailed">Detailed Operational Report</MenuItem>
                  <MenuItem value="executive-summary">Executive Summary Only</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                The report will include KPIs, charts, operational risks, recurring issues, engineer highlights, application health, recommendations, and action items.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setSelectedReport(null); }}>Cancel</Button>
          {selectedReport ? (
            <>
              <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => {}}>Export PDF</Button>
              <Button variant="outlined" startIcon={<TableChartIcon />} onClick={() => {}}>Export Excel</Button>
            </>
          ) : (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogOpen(false); }}>
              Generate Report
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}