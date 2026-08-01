import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, LinearProgress, IconButton, Tooltip } from '@mui/material';
import {
  CloseOutlined as CloseIcon,
  PlayArrowRounded as PlayIcon,
  PauseRounded as PauseIcon,
  ChevronLeftRounded as PrevIcon,
  ChevronRightRounded as NextIcon,
  FullscreenOutlined as FullscreenIcon,
  FullscreenExitOutlined as ExitFullscreenIcon,
  MonitorHeartOutlined as LogoIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  dashboardApi, applicationApi, riskApi, actionItemApi,
} from '../../services/api';
import { categoricalPalette, chartChrome } from '../../theme/chartPalette';
import { healthScoreColor } from '../../utils/chipColors';

const SLA_TARGET = 95;
const SLIDE_SECONDS = 20;
const REFRESH_MS = 60_000;

/* ---------- shared presentation primitives (scaled for projection) ---------- */

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'primary.main', mb: 0.5 }}>
          {eyebrow}
        </Typography>
        <Typography sx={{ fontSize: '2.75rem', fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.1 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}

function BigStat({ label, value, tone = 'text.primary', context }: { label: string; value: React.ReactNode; tone?: string; context?: string }) {
  return (
    <Box
      sx={{
        flex: 1, minWidth: 0, p: 3.5, borderRadius: 3,
        border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
    >
      <Typography sx={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
        {label}
      </Typography>
      <Typography className="tabular-nums" sx={{ fontSize: '4.25rem', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.03em', color: tone }}>
        {value}
      </Typography>
      {context && (
        <Typography sx={{ fontSize: '1.0625rem', color: 'text.secondary', mt: 1.5 }}>{context}</Typography>
      )}
    </Box>
  );
}

/* --------------------------------- slides --------------------------------- */

function OverviewSlide() {
  const { data: kpis } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: () => dashboardApi.getKPIs().then((r) => r.data) });
  const sla = Number(kpis?.slaCompliance ?? 0);
  const healthy = sla >= SLA_TARGET;

  return (
    <Panel eyebrow="Service Desk" title="Operational Overview">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
          <BigStat label="Total Tickets" value={kpis?.totalTickets ?? '—'} context="Reporting period" />
          <BigStat label="Open" value={kpis?.openTickets ?? '—'} tone="warning.main" context="Awaiting resolution" />
          <BigStat label="Resolved" value={kpis?.resolvedTickets ?? '—'} tone="success.main" context="Closed this period" />
        </Box>
        <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
          <BigStat label="Critical" value={kpis?.criticalTickets ?? '—'} tone="error.main" context="Highest priority" />
          <BigStat
            label="SLA Compliance"
            value={`${sla}%`}
            tone={healthy ? 'success.main' : 'error.main'}
            context={healthy ? `Meeting the ${SLA_TARGET}% target` : `Below the ${SLA_TARGET}% target`}
          />
          <BigStat label="Avg Resolution" value={`${kpis?.avgResolutionTime ?? '—'}h`} context="Mean time to resolve" />
        </Box>
      </Box>
    </Panel>
  );
}

function TrendSlide() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chrome = chartChrome(isDark);
  const palette = categoricalPalette(isDark);

  const { data: volume } = useQuery({ queryKey: ['dashboard-monthly-trend'], queryFn: () => dashboardApi.getMonthlyTrend().then((r) => r.data) });
  const { data: slaTrend } = useQuery({ queryKey: ['dashboard-sla-trend'], queryFn: () => dashboardApi.getSLACompliance().then((r) => r.data) });

  const volumeData = (volume ?? []).map((p) => ({ ...p, label: format(new Date(p.month as string), 'MMM') }));
  const slaData = (slaTrend ?? []).map((p) => ({ ...p, label: format(new Date(p.month as string), 'MMM') }));
  const axis = { tick: { fontSize: 16, fill: chrome.axisText }, axisLine: { stroke: chrome.axis }, tickLine: false as const };

  return (
    <Panel eyebrow="6-Month History" title="Volume & SLA Trend">
      <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
        {[
          { title: 'Ticket Volume', data: volumeData, color: palette[0], area: true },
          { title: `SLA Compliance (target ${SLA_TARGET}%)`, data: slaData, color: palette[2], area: false },
        ].map((c) => (
          <Box
            key={c.title}
            sx={{ flex: 1, minWidth: 0, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}
          >
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 650, mb: 2.5 }}>{c.title}</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                {c.area ? (
                  <AreaChart data={c.data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 5" stroke={chrome.grid} vertical={false} />
                    <XAxis dataKey="label" {...axis} />
                    <YAxis allowDecimals={false} {...axis} width={52} />
                    <Area type="monotone" dataKey="value" stroke={c.color} strokeWidth={3.5} fill="url(#presentFill)" dot={{ r: 5, fill: c.color, strokeWidth: 0 }} />
                  </AreaChart>
                ) : (
                  <LineChart data={c.data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 5" stroke={chrome.grid} vertical={false} />
                    <XAxis dataKey="label" {...axis} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} {...axis} width={52} />
                    <ReferenceLine y={SLA_TARGET} stroke={chrome.reference} strokeDasharray="6 5" strokeWidth={2} />
                    <Line type="monotone" dataKey="value" stroke={c.color} strokeWidth={3.5} dot={{ r: 5, fill: c.color, strokeWidth: 0 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
}

function HealthSlide() {
  const { data: applications } = useQuery({ queryKey: ['applications'], queryFn: () => applicationApi.getAll().then((r) => r.data) });
  const sorted = [...(applications ?? [])].sort(
    (a, b) => (a.healthScores?.[0]?.healthScore ?? 101) - (b.healthScores?.[0]?.healthScore ?? 101)
  );

  return (
    <Panel eyebrow="Portfolio" title="Application Health">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2.5, height: '100%', alignContent: 'start' }}>
        {sorted.map((app) => {
          const score = app.healthScores?.[0]?.healthScore ?? null;
          const tone = score !== null ? healthScoreColor(score) : 'success';
          return (
            <Box
              key={app.id}
              sx={{
                p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 3,
                borderLeft: '6px solid', borderLeftColor: score !== null ? `${tone}.main` : 'divider',
              }}
            >
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography sx={{ fontSize: '1.375rem', fontWeight: 650, lineHeight: 1.3 }} noWrap>
                  {app.displayName}
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: 'text.secondary' }} noWrap>
                  {app.team} · {app.criticality}
                </Typography>
              </Box>
              <Typography
                className="tabular-nums"
                sx={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: score !== null ? `${tone}.main` : 'text.disabled' }}
              >
                {score ?? '—'}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Panel>
  );
}

function RiskSlide() {
  const { data: risks } = useQuery({ queryKey: ['risks'], queryFn: () => riskApi.getRisks().then((r) => r.data) });
  const top = (risks ?? []).slice(0, 5);

  const tone = (score: number) => (score >= 12 ? 'error' : score >= 8 ? 'warning' : 'info');

  return (
    <Panel eyebrow="Governance" title="Top Operational Risks">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        {top.map((r) => (
          <Box
            key={r.id}
            sx={{
              p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            <Box
              sx={{
                width: 76, height: 76, borderRadius: 2.5, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                bgcolor: `${tone(r.riskScore)}.light`, color: `${tone(r.riskScore)}.main`,
                border: '2px solid', borderColor: `${tone(r.riskScore)}.main`,
              }}
            >
              <Typography className="tabular-nums" sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {r.riskScore}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                risk
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 650, lineHeight: 1.3, mb: 0.5 }}>{r.title}</Typography>
              <Typography sx={{ fontSize: '1.0625rem', color: 'text.secondary' }} noWrap>
                {r.category} · owner {r.owner} · {r.likelihood} likelihood / {r.impact} impact
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
}

function ActionSlide() {
  const { data: items } = useQuery({ queryKey: ['action-items'], queryFn: () => actionItemApi.getAll().then((r) => r.data) });
  const open = (items ?? []).filter((i) => i.status !== 'completed').slice(0, 5);

  return (
    <Panel eyebrow="Governance" title="Open Action Items">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        {open.map((i) => {
          const due = new Date(i.dueDate);
          const overdue = due < new Date();
          return (
            <Box
              key={i.id}
              sx={{
                p: 3, borderRadius: 3, border: '1px solid',
                borderColor: overdue ? 'error.main' : 'divider',
                bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 650, lineHeight: 1.3, mb: 0.5 }}>{i.title}</Typography>
                <Typography sx={{ fontSize: '1.0625rem', color: 'text.secondary' }} noWrap>
                  {i.assignee} · {i.priority} priority · {i.status.replace('_', ' ')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography
                  className="tabular-nums"
                  sx={{ fontSize: '1.25rem', fontWeight: 700, color: overdue ? 'error.main' : 'text.primary' }}
                >
                  {format(due, 'MMM d')}
                </Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: overdue ? 'error.main' : 'text.secondary' }}>
                  {overdue ? 'overdue' : 'due'}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Panel>
  );
}

const SLIDES = [
  { key: 'overview', label: 'Overview', render: () => <OverviewSlide /> },
  { key: 'trend', label: 'Trends', render: () => <TrendSlide /> },
  { key: 'health', label: 'App Health', render: () => <HealthSlide /> },
  { key: 'risks', label: 'Risks', render: () => <RiskSlide /> },
  { key: 'actions', label: 'Actions', render: () => <ActionSlide /> },
];

/* ------------------------------- the mode -------------------------------- */

export default function PresentationMode() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
    setElapsed(0);
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    navigate('/dashboard');
  }, [navigate]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else containerRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  // Advance timer. Rebuilds on slide change so each slide gets a full interval.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= SLIDE_SECONDS) {
          setIndex((i) => (i + 1) % SLIDES.length);
          return 0;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, index]);

  // Wall clock for the header.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // A screen left running unattended must not go stale — refetch everything on
  // an interval. The 5-minute default staleTime would otherwise serve cache.
  useEffect(() => {
    const id = setInterval(() => {
      queryClient.invalidateQueries();
      setNow(new Date());
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [queryClient]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key.toLowerCase() === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exit, go, toggleFullscreen]);

  const progress = useMemo(() => (elapsed / SLIDE_SECONDS) * 100, [elapsed]);
  const slide = SLIDES[index];

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed', inset: 0, zIndex: 1300,
        bgcolor: 'surface.canvas', color: 'text.primary',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 5, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <LogoIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.25 }}>Jira Executive Reporting</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.25 }}>
            Briefing view · data as of {format(now, 'MMM d, yyyy h:mm a')}
          </Typography>
        </Box>

        {/* Slide indicators */}
        <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
          {SLIDES.map((s, i) => (
            <Tooltip key={s.key} title={s.label}>
              <Box
                onClick={() => { setIndex(i); setElapsed(0); }}
                sx={{
                  px: 1.5, py: 0.625, borderRadius: 1.5, cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 600,
                  border: '1px solid', borderColor: i === index ? 'primary.main' : 'divider',
                  bgcolor: i === index ? 'action.selected' : 'transparent',
                  color: i === index ? 'primary.main' : 'text.secondary',
                  transition: 'all 140ms ease',
                }}
              >
                {s.label}
              </Box>
            </Tooltip>
          ))}
        </Box>

        <Tooltip title={playing ? 'Pause rotation (space)' : 'Resume rotation (space)'}>
          <IconButton onClick={() => setPlaying((p) => !p)}>{playing ? <PauseIcon /> : <PlayIcon />}</IconButton>
        </Tooltip>
        <Tooltip title="Previous (←)"><IconButton onClick={() => go(-1)}><PrevIcon /></IconButton></Tooltip>
        <Tooltip title="Next (→)"><IconButton onClick={() => go(1)}><NextIcon /></IconButton></Tooltip>
        <Tooltip title={isFullscreen ? 'Exit full screen (f)' : 'Full screen (f)'}>
          <IconButton onClick={toggleFullscreen}>{isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}</IconButton>
        </Tooltip>
        <Tooltip title="Exit briefing view (esc)">
          <IconButton onClick={exit}><CloseIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* Rotation progress */}
      <LinearProgress
        variant="determinate"
        value={playing ? progress : 0}
        sx={{ height: 3, borderRadius: 0, bgcolor: 'transparent', flexShrink: 0, '& .MuiLinearProgress-bar': { transition: 'transform 1s linear' } }}
      />

      {/* Slide */}
      <Box key={slide.key} sx={{ flexGrow: 1, minHeight: 0, px: 5, py: 4, animation: 'fadeIn 320ms ease', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } } }}>
        {slide.render()}
      </Box>
    </Box>
  );
}
