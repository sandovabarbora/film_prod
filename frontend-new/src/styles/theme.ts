import type { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    primary: {
      dark: '#0a0a0a',
      light: '#ffffff',
    },
    accent: {
      main: '#e50914',
      muted: '#b81d24',
    },
    gray: {
      100: '#f5f5f5',
      300: '#e0e0e0',
      400: '#bdbdbd',  // Přidáno
      500: '#9e9e9e',
      700: '#616161',
      800: '#424242',  // Přidáno
      850: '#303030',  // Přidáno
      900: '#212121',
    },
    status: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    },
  },
  fonts: {
    display: "'Bebas Neue', sans-serif",
    body: "'Inter', sans-serif",
  },
  sizes: {
    h1: '3.5rem',
    h2: '2.5rem',
    h3: '2rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1rem',
    body: '1rem',
    small: '0.875rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem',
    xxxl: '6rem',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  transitions: {
    fast: '150ms ease-out',
    normal: '300ms ease-out',
    slow: '500ms ease-out',
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.12)',
    large: '0 8px 16px rgba(0,0,0,0.15)',
    xl: '0 12px 24px rgba(0,0,0,0.18)',
  },
};
