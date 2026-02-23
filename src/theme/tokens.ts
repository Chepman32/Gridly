import {ColorSchemeName} from 'react-native';

export const tokens = {
  color: {
    bg: {
      primary: {light: '#F7F8FA', dark: '#0B0C0F'},
      secondary: {light: '#FFFFFF', dark: '#14151A'},
    },
    surface: {
      elevated: {light: '#FFFFFF', dark: '#1C1D24'},
    },
    text: {
      primary: {light: '#0B0C0F', dark: '#F5F6FA'},
      secondary: {
        light: 'rgba(11,12,15,0.66)',
        dark: 'rgba(245,246,250,0.68)',
      },
      tertiary: {
        light: 'rgba(11,12,15,0.45)',
        dark: 'rgba(245,246,250,0.46)',
      },
    },
    separator: {
      light: 'rgba(0,0,0,0.08)',
      dark: 'rgba(255,255,255,0.10)',
    },
    brand: {
      primary: '#3B5BFF',
      accent: '#1BC9FF',
    },
    semantic: {
      success: '#2ECC71',
      warning: '#F39C12',
      error: '#FF3B30',
    },
  },
  typography: {
    display: {fontSize: 34, lineHeight: 40, fontWeight: '600' as const},
    title1: {fontSize: 28, lineHeight: 34, fontWeight: '600' as const},
    title2: {fontSize: 22, lineHeight: 28, fontWeight: '600' as const},
    title3: {fontSize: 20, lineHeight: 26, fontWeight: '600' as const},
    headline: {fontSize: 17, lineHeight: 22, fontWeight: '600' as const},
    body: {fontSize: 17, lineHeight: 22, fontWeight: '400' as const},
    callout: {fontSize: 16, lineHeight: 21, fontWeight: '400' as const},
    subhead: {fontSize: 15, lineHeight: 20, fontWeight: '400' as const},
    footnote: {fontSize: 13, lineHeight: 18, fontWeight: '400' as const},
    caption2: {fontSize: 12, lineHeight: 16, fontWeight: '400' as const},
  },
  spacing: {s1: 8, s2: 16, s3: 24, s4: 32, s5: 40},
  radius: {s: 10, m: 14, l: 18, canvas: 16},
  motion: {
    spring: {
      standard: {damping: 18, stiffness: 220, mass: 1},
      snappy: {damping: 16, stiffness: 320, mass: 0.9},
      gentle: {damping: 22, stiffness: 180, mass: 1.1},
    },
    timing: {fast: 160, normal: 220, slow: 320},
  },
  tapTargetMin: 44,
};

export const getTheme = (scheme: ColorSchemeName) => {
  const dark = scheme === 'dark';
  return {
    dark,
    colors: {
      background: dark ? tokens.color.bg.primary.dark : tokens.color.bg.primary.light,
      backgroundSecondary: dark
        ? tokens.color.bg.secondary.dark
        : tokens.color.bg.secondary.light,
      surface: dark
        ? tokens.color.surface.elevated.dark
        : tokens.color.surface.elevated.light,
      textPrimary: dark
        ? tokens.color.text.primary.dark
        : tokens.color.text.primary.light,
      textSecondary: dark
        ? tokens.color.text.secondary.dark
        : tokens.color.text.secondary.light,
      textTertiary: dark
        ? tokens.color.text.tertiary.dark
        : tokens.color.text.tertiary.light,
      separator: dark ? tokens.color.separator.dark : tokens.color.separator.light,
      brandPrimary: tokens.color.brand.primary,
      brandAccent: tokens.color.brand.accent,
      success: tokens.color.semantic.success,
      warning: tokens.color.semantic.warning,
      error: tokens.color.semantic.error,
    },
  };
};

export type AppTheme = ReturnType<typeof getTheme>;
