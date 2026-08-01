import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import {
  slate, blue, violet, status, surfaces, ink,
  radius, elevation, fontStack, monoStack,
} from './tokens';

declare module '@mui/material/styles' {
  interface Palette {
    surface: { canvas: string; raised: string; sunken: string; border: string; borderStrong: string };
  }
  interface PaletteOptions {
    surface?: { canvas: string; raised: string; sunken: string; border: string; borderStrong: string };
  }
}

export function buildTheme(mode: PaletteMode): Theme {
  const isDark = mode === 'dark';
  const surface = isDark ? surfaces.dark : surfaces.light;
  const text = isDark ? ink.dark : ink.light;
  const shadow = isDark ? elevation.dark : elevation.light;

  const base = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? blue[400] : blue[600],
        light: isDark ? blue[300] : blue[500],
        dark: isDark ? blue[500] : blue[700],
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? violet[400] : violet[600],
        light: isDark ? violet[300] : violet[500],
        dark: isDark ? violet[500] : violet[700],
        contrastText: '#FFFFFF',
      },
      success: {
        main: isDark ? status.successDark : status.successLight,
        light: isDark ? status.successBgDark : status.successBgLight,
        dark: isDark ? status.successDark : status.successLight,
        contrastText: isDark ? slate[950] : '#FFFFFF',
      },
      warning: {
        main: isDark ? status.warningDark : status.warningLight,
        light: isDark ? status.warningBgDark : status.warningBgLight,
        dark: isDark ? status.warningDark : status.warningLight,
        contrastText: isDark ? slate[950] : '#FFFFFF',
      },
      error: {
        main: isDark ? status.errorDark : status.errorLight,
        light: isDark ? status.errorBgDark : status.errorBgLight,
        dark: isDark ? status.errorDark : status.errorLight,
        contrastText: isDark ? slate[950] : '#FFFFFF',
      },
      info: {
        main: isDark ? status.infoDark : status.infoLight,
        light: isDark ? status.infoBgDark : status.infoBgLight,
        dark: isDark ? status.infoDark : status.infoLight,
        contrastText: isDark ? slate[950] : '#FFFFFF',
      },
      background: {
        default: surface.canvas,
        paper: surface.raised,
      },
      text: {
        primary: text.primary,
        secondary: text.secondary,
        disabled: text.disabled,
      },
      divider: surface.border,
      surface: {
        canvas: surface.canvas,
        raised: surface.raised,
        sunken: surface.sunken,
        border: surface.border,
        borderStrong: surface.borderStrong,
      },
      action: {
        hover: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,40,0.03)',
        selected: isDark ? 'rgba(96,141,250,0.12)' : 'rgba(37,84,233,0.07)',
        disabled: text.disabled,
        disabledBackground: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.05)',
        focus: isDark ? 'rgba(96,141,250,0.24)' : 'rgba(37,84,233,0.16)',
      },
    },

    /**
     * 14px base. Enterprise tools are read at a distance of inches, not feet —
     * the denser scale fits materially more signal per screen without strain.
     */
    typography: {
      fontFamily: fontStack,
      fontSize: 14,
      h1: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.021em' },
      h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.28, letterSpacing: '-0.019em' },
      h3: { fontSize: '1.25rem', fontWeight: 650, lineHeight: 1.32, letterSpacing: '-0.016em' },
      h4: { fontSize: '1.125rem', fontWeight: 650, lineHeight: 1.36, letterSpacing: '-0.013em' },
      h5: { fontSize: '1rem', fontWeight: 650, lineHeight: 1.4, letterSpacing: '-0.009em' },
      h6: { fontSize: '0.9375rem', fontWeight: 650, lineHeight: 1.4, letterSpacing: '-0.006em' },
      subtitle1: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.45 },
      subtitle2: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.45 },
      body1: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.6 },
      button: { fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
      caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
      // Section eyebrows: small, tracked-out, uppercase.
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 700,
        lineHeight: 1.45,
        letterSpacing: '0.075em',
        textTransform: 'uppercase',
      },
    },

    shape: { borderRadius: radius.md },

    shadows: [
      shadow.none, shadow.sm, shadow.md, shadow.lg, shadow.xl,
      ...Array(20).fill(shadow.xl),
    ] as Theme['shadows'],
  });

  return createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*, *::before, *::after': { boxSizing: 'border-box' },
          html: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
          },
          body: { backgroundColor: surface.canvas, color: text.primary },
          // Tabular figures everywhere numbers are compared vertically.
          'table, .tabular-nums': { fontVariantNumeric: 'tabular-nums' },
          '::selection': {
            background: isDark ? 'rgba(96,141,250,0.32)' : 'rgba(59,111,245,0.18)',
          },
          '::-webkit-scrollbar': { width: 10, height: 10 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? '#333C4A' : slate[300],
            borderRadius: radius.pill,
            border: `2px solid ${surface.canvas}`,
          },
          '::-webkit-scrollbar-thumb:hover': { background: isDark ? '#414B5C' : slate[400] },
          // Visible keyboard focus, invisible to mouse users.
          ':focus-visible': {
            outline: `2px solid ${isDark ? blue[400] : blue[600]}`,
            outlineOffset: 2,
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { border: `1px solid ${surface.border}` },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${surface.border}`,
            borderRadius: radius.lg,
            backgroundColor: surface.raised,
            backgroundImage: 'none',
            transition: 'border-color 140ms ease, box-shadow 140ms ease',
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            padding: '7px 14px',
            minHeight: 34,
            transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
          },
          sizeSmall: { padding: '4px 10px', minHeight: 28, fontSize: '0.75rem' },
          sizeLarge: { padding: '9px 18px', minHeight: 40, fontSize: '0.875rem' },
          contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
          outlined: {
            borderColor: surface.borderStrong,
            color: text.primary,
            '&:hover': {
              borderColor: isDark ? slate[500] : slate[400],
              backgroundColor: base.palette.action.hover,
            },
          },
          text: { '&:hover': { backgroundColor: base.palette.action.hover } },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            color: text.secondary,
            transition: 'background-color 120ms ease, color 120ms ease',
            '&:hover': { backgroundColor: base.palette.action.hover, color: text.primary },
          },
          sizeSmall: { padding: 6 },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.xs,
            fontWeight: 600,
            fontSize: '0.6875rem',
            height: 22,
            letterSpacing: '0.01em',
          },
          sizeSmall: { height: 20, fontSize: '0.6875rem' },
          label: { paddingLeft: 7, paddingRight: 7 },
          outlined: { borderColor: surface.borderStrong },
        },
      },

      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 400 },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? slate[700] : slate[800],
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: radius.sm,
            padding: '6px 10px',
            boxShadow: shadow.lg,
          },
          arrow: { color: isDark ? slate[700] : slate[800] },
        },
      },

      MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            backgroundColor: isDark ? surface.sunken : surface.raised,
            '& fieldset': { borderColor: surface.border },
            '&:hover fieldset': { borderColor: surface.borderStrong },
            '&.Mui-focused fieldset': { borderWidth: 1.5 },
          },
          input: { fontSize: '0.8125rem', '&::placeholder': { color: text.muted, opacity: 1 } },
        },
      },

      MuiInputLabel: { styleOverrides: { root: { fontSize: '0.8125rem' } } },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: radius.md,
            border: `1px solid ${surface.border}`,
            boxShadow: shadow.lg,
            marginTop: 4,
          },
          list: { padding: 4 },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: radius.xs,
            fontSize: '0.8125rem',
            minHeight: 34,
            '&:hover': { backgroundColor: base.palette.action.hover },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
            border: `1px solid ${surface.border}`,
            boxShadow: shadow.xl,
            backgroundImage: 'none',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: '1rem', fontWeight: 650, padding: '18px 22px' },
        },
      },
      MuiDialogContent: { styleOverrides: { root: { padding: '20px 22px' } } },
      MuiDialogActions: {
        styleOverrides: { root: { padding: '14px 22px', gap: 8 } },
      },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: surface.border, fontSize: '0.8125rem', padding: '10px 14px' },
          head: {
            fontWeight: 600,
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.055em',
            color: text.muted,
            backgroundColor: surface.sunken,
            borderBottom: `1px solid ${surface.border}`,
            whiteSpace: 'nowrap',
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: { '&:last-child td': { borderBottom: 'none' } },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: radius.pill, backgroundColor: isDark ? '#252D3A' : slate[200] },
          bar: { borderRadius: radius.pill },
        },
      },

      MuiDivider: { styleOverrides: { root: { borderColor: surface.border } } },

      MuiSkeleton: {
        defaultProps: { animation: 'wave' },
        styleOverrides: {
          root: { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.05)' },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: radius.md, fontSize: '0.8125rem', border: '1px solid', padding: '8px 14px' },
          standardWarning: {
            backgroundColor: isDark ? status.warningBgDark : status.warningBgLight,
            borderColor: isDark ? 'rgba(245,165,36,0.3)' : 'rgba(180,83,9,0.2)',
            color: isDark ? status.warningDark : status.warningLight,
          },
          standardError: {
            backgroundColor: isDark ? status.errorBgDark : status.errorBgLight,
            borderColor: isDark ? 'rgba(247,110,110,0.3)' : 'rgba(190,27,27,0.2)',
            color: isDark ? status.errorDark : status.errorLight,
          },
          standardSuccess: {
            backgroundColor: isDark ? status.successBgDark : status.successBgLight,
            borderColor: isDark ? 'rgba(61,214,140,0.3)' : 'rgba(21,128,61,0.2)',
            color: isDark ? status.successDark : status.successLight,
          },
          standardInfo: {
            backgroundColor: isDark ? status.infoBgDark : status.infoBgLight,
            borderColor: isDark ? 'rgba(77,184,240,0.3)' : 'rgba(3,105,161,0.2)',
            color: isDark ? status.infoDark : status.infoLight,
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40, borderBottom: `1px solid ${surface.border}` },
          indicator: { height: 2, borderRadius: '2px 2px 0 0' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 40,
            padding: '8px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: text.secondary,
            '&.Mui-selected': { color: isDark ? blue[300] : blue[600] },
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: { fontSize: '0.75rem', fontWeight: 650 },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          root: { width: 36, height: 20, padding: 0 },
          switchBase: {
            padding: 2,
            '&.Mui-checked': { transform: 'translateX(16px)' },
            '&.Mui-checked + .MuiSwitch-track': { opacity: 1 },
          },
          thumb: { width: 16, height: 16, boxShadow: shadow.sm },
          track: { borderRadius: radius.pill, opacity: 1, backgroundColor: isDark ? '#333C4A' : slate[300] },
        },
      },

      MuiCircularProgress: { styleOverrides: { circle: { strokeLinecap: 'round' } } },

      MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, color: text.muted } } },

      MuiBackdrop: {
        styleOverrides: { root: { backgroundColor: surface.overlay } },
      },
    },
  });
}

export { monoStack };
export const theme = buildTheme('light');
