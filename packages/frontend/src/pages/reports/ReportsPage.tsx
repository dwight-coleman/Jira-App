import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
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
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { reportApi, MonthlyReport } from '../../services/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import { format } from 'date-fns';
import { safeParseJSON } from '../../utils/chipColors';
import PageHeader from '../../components/common/PageHeader';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  draft: 'default',
  pending_review: 'warning',
  approved: 'info',
  published: 'success',
  archived: 'secondary',
};

type PeriodOption = 'last-month' | 'this-month' | 'last-quarter';

function getPeriodRange(period: PeriodOption): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case 'this-month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last-quarter':
      return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(subMonths(now, 1)) };
    case 'last-month':
    default:
      return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
  }
}

interface Kpi {
  name: string;
  value: string | number;
  target?: string | number;
}

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: reports, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['monthly-reports'],
    queryFn: () => reportApi.getMonthlyReports().then((r) => r.data),
  });

  const [selectedReport, setSelectedReport] = React.useState<MonthlyReport | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newReportTitle, setNewReportTitle] = React.useState('');
  const [period, setPeriod] = React.useState<PeriodOption>('last-month');
  const [template, setTemplate] = React.useState('standard');

  const generateMutation = useMutation({
    mutationFn: () => {
      const { start, end } = getPeriodRange(period);
      return reportApi.generate({
        name: newReportTitle.trim() || `Executive Report - ${format(start, 'MMMM yyyy')}`,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        generatedBy: user?.name,
      }).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-reports'] });
      toast.success('Report generated');
      setDialogOpen(false);
      setNewReportTitle('');
    },
    onError: () => {
      toast.error('Failed to generate report');
    },
  });

  const openGenerateDialog = () => {
    setSelectedReport(null);
    setNewReportTitle('');
    setPeriod('last-month');
    setTemplate('standard');
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader
        icon={DescriptionIcon}
        title="Executive Reports"
        subtitle="Monthly operational intelligence reports with KPIs, trends, and AI narratives"
        actions={
          <>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isRefetching}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openGenerateDialog}>
              Generate Report
            </Button>
          </>
        }
      />

      <Grid container spacing={3}>
        {reports?.map((report) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={report.id}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}>
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
                <Button variant="contained" startIcon={<AddIcon />} onClick={openGenerateDialog}>
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Report Detail / Generate Dialog */}
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
                {safeParseJSON<Kpi[]>(selectedReport.kpis as unknown as string, []).map((kpi, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">{kpi.name}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{kpi.value}</Typography>
                        {kpi.target !== undefined && (
                          <Typography variant="caption" color="text.secondary">Target: {kpi.target}</Typography>
                        )}
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
                <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value as PeriodOption)}>
                  <MenuItem value="last-month">Last Month</MenuItem>
                  <MenuItem value="this-month">This Month</MenuItem>
                  <MenuItem value="last-quarter">Last Quarter</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Template</InputLabel>
                <Select label="Template" value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <MenuItem value="standard">Standard Executive Report</MenuItem>
                  <MenuItem value="detailed">Detailed Operational Report</MenuItem>
                  <MenuItem value="executive-summary">Executive Summary Only</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                The report will be generated from tickets created during the selected period, with KPIs and an executive summary computed from live data.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setSelectedReport(null); }}>Cancel</Button>
          {selectedReport ? (
            <>
              <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => toast('PDF export not implemented yet')}>Export PDF</Button>
              <Button variant="outlined" startIcon={<TableChartIcon />} onClick={() => toast('Excel export not implemented yet')}>Export Excel</Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? 'Generating…' : 'Generate Report'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
