// src/styles/theme.ts - Cinema Grade Design System
export const Theme = {
  colors: {
    // Cinematic primary palette
    primary: '#f97316',        // Sunset orange - like golden hour
    primaryLight: '#fb923c',   
    primaryDark: '#ea580c',
    
    // Film noir palette
    secondary: '#1e1b4b',      // Deep midnight blue
    secondaryLight: '#312e81',
    secondaryDark: '#0f0e27',
    
    // Creative accents
    accent: '#8b5cf6',         // Director's purple
    accentLight: '#a78bfa',
    accentDark: '#7c3aed',
    
    // Electric highlights
    electric: '#06b6d4',       // Cyan highlights
    electricLight: '#22d3ee',
    electricDark: '#0891b2',
    
    // Status colors - vibrant
    success: '#10b981',
    successLight: '#34d399', 
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444', 
    errorLight: '#f87171',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    
    // Neutral system - warm
    text: '#0f172a',           // Rich black
    textSecondary: '#475569',  // Warm grey
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    
    // Background system
    background: '#fefefe',     // Pure white
    surface: '#ffffff',
    surfaceHover: '#f8fafc',   
    surfaceElevated: '#ffffff',
    surfaceGlass: 'rgba(255, 255, 255, 0.8)',
    
    // Border system
    border: 'rgba(148, 163, 184, 0.2)',
    borderHover: 'rgba(148, 163, 184, 0.4)',
    borderAccent: 'rgba(139, 92, 246, 0.3)',
    
    // Production status - cinematic
    development: '#8b5cf6',     // Purple - imagination
    preProduction: '#06b6d4',   // Cyan - planning
    production: '#f97316',      // Orange - action!
    postProduction: '#ef4444',  // Red - intensity
    completed: '#10b981',       // Green - success
    cancelled: '#64748b',       // Grey - neutral
    
    // Cinematic gradients
    gradients: {
      hero: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #8b5cf6 100%)',
      sunset: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #8b5cf6 100%)',
      ocean: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      glass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
      card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
      text: 'linear-gradient(135deg, #f97316 0%, #8b5cf6 100%)',
    }
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px  
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
    '5xl': '8rem',    // 128px
    '6xl': '12rem',   // 192px
  },
  
  typography: {
    fontFamily: {
      // Primary - modern sans
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      // Display - dramatic headers
      display: '"Space Grotesk", "Inter", sans-serif',
      // Mono - technical details
      mono: '"JetBrains Mono", "Fira Code", Monaco, monospace',
      // Elegant - for special content
      elegant: '"Manrope", "Inter", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem',     // 128px
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em', 
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    }
  },
  
  shadows: {
    // Subtle shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Cinematic colored shadows
    primary: '0 20px 40px rgba(249, 115, 22, 0.3), 0 8px 16px rgba(249, 115, 22, 0.1)',
    secondary: '0 20px 40px rgba(30, 27, 75, 0.3), 0 8px 16px rgba(30, 27, 75, 0.1)',
    accent: '0 20px 40px rgba(139, 92, 246, 0.3), 0 8px 16px rgba(139, 92, 246, 0.1)',
    
    // Glass effects
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    glassSm: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
    glassLg: '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
    
    // Glow effects
    glow: '0 0 20px rgba(249, 115, 22, 0.4)',
    glowAccent: '0 0 20px rgba(139, 92, 246, 0.4)',
    glowSuccess: '0 0 20px rgba(16, 185, 129, 0.4)',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    md: '0.375rem',    // 6px  
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    '4xl': '2rem',     // 32px
    full: '9999px',
  },
  
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px', 
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
  },
  
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
    cursor: 9999,
  },
  
  transitions: {
    none: 'none',
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
    slow: '0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    slowest: '0.75s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Cinematic easing
    bounce: '0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    dramatic: '0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // Glass morphism system
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.18)',
      backdrop: 'blur(16px) saturate(180%)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.1)',
      backdrop: 'blur(24px) saturate(160%)',
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.05)',
      backdrop: 'blur(32px) saturate(200%)',
    }
  },
  
  // Blur effects
  blur: {
    sm: 'blur(4px)',
    md: 'blur(8px)', 
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)',
  },
  
  // Cinema industry specific
  cinema: {
    golden: '#f59e0b',         // Golden hour
    filmRed: '#ef4444',        // Film reel red
    stageBlue: '#3b82f6',      // Stage lighting  
    spotlightYellow: '#eab308', // Spotlight
    filmNoir: '#0f172a',       // Classic noir
    vintage: '#92400e',        // Vintage film
    neon: '#8b5cf6',          // Neon signs
    chrome: '#e2e8f0',        // Chrome/metal
  }
};

export type Theme = typeof Theme;
export default Theme;
