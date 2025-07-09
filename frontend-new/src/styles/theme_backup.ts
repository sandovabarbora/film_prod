// src/styles/theme.ts - Cinema-Grade Design System
export const Theme = {
  // 🎨 Cinema Color Palette
  colors: {
    // Primary cinema colors
    cinema: {
      midnight: '#0f0f23',      // Deep space black
      charcoal: '#1a1a2e',      // Rich charcoal 
      steel: '#16213e',         // Steel blue shadows
      gold: '#eab308',          // Golden hour
      silver: '#8892b0',        // Silver screen
      ruby: '#ef4444',          // Ruby red (danger/action)
      emerald: '#10b981',       // Emerald success
      sapphire: '#3b82f6',      // Sapphire blue
      amethyst: '#8b5cf6',      // Amethyst purple
    },

    // Glassmorphism surfaces
    glass: {
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderHover: 'rgba(255, 255, 255, 0.25)',
    },

    // Gradient system
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cinema: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #8b5cf6 100%)',
      golden: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
      ruby: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      midnight: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
    },

    // Text hierarchy
    text: {
      primary: '#f8fafc',       // Pure white text
      secondary: '#cbd5e1',     // Light grey
      muted: '#94a3b8',         // Muted grey
      accent: '#667eea',        // Accent blue
      warning: '#eab308',       // Warning gold
      danger: '#ef4444',        // Danger red
      success: '#10b981',       // Success green
    },

    // Background system
    background: {
      primary: '#0f0f23',       // Main dark background
      secondary: '#1a1a2e',     // Secondary dark
      surface: '#16213e',       // Card surfaces
      overlay: 'rgba(15, 15, 35, 0.95)', // Modal overlays
    },

    // Status colors for film production
    status: {
      prep: '#f59e0b',          // Pre-production (amber)
      shoot: '#ef4444',         // Shooting (red)
      post: '#3b82f6',          // Post-production (blue) 
      wrap: '#10b981',          // Wrapped (green)
      archived: '#6b7280',      // Archived (grey)
    },
  },

  // 🎭 Typography System
  typography: {
    fontFamily: {
      display: "'Space Grotesk', sans-serif",    // Headings, hero text
      body: "'Inter', sans-serif",               // Body text, UI
      mono: "'JetBrains Mono', monospace",       // Code, data, timestamps
      accent: "'Manrope', sans-serif",           // Special emphasis
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem',      // 96px
      '9xl': '8rem',      // 128px
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // 📐 Spacing System
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
    40: '10rem',     // 160px
    48: '12rem',     // 192px
    56: '14rem',     // 224px
    64: '16rem',     // 256px
  },

  // 🌊 Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',     // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    full: '9999px',
  },

  // 🎭 Cinema Shadows
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
    
    // Cinema-specific shadows
    cinema: '0 25px 50px rgba(15, 15, 35, 0.3), 0 10px 20px rgba(15, 15, 35, 0.2)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3), 0 0 40px rgba(102, 126, 234, 0.1)',
    glowHover: '0 0 30px rgba(102, 126, 234, 0.4), 0 0 60px rgba(102, 126, 234, 0.2)',
  },

  // ⚡ Transitions
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    cinema: '0.6s cubic-bezier(0.19, 1, 0.22, 1)',
  },

  // 📱 Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // 🔢 Z-Index Scale
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800',
  },

  // 🌀 Animation Curves
  animation: {
    // Entrance animations
    fadeIn: 'fadeIn 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards',
    slideUp: 'slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards',
    scaleIn: 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    
    // Interactive animations
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    
    // Cinema-specific
    gradientShift: 'gradientShift 6s ease-in-out infinite',
    float: 'float 6s ease-in-out infinite',
    glow: 'glow 2s ease-in-out infinite alternate',
  },

  // 🎬 Cinema-specific Design Tokens
  cinema: {
    // Glass morphism settings
    blur: {
      sm: 'blur(10px)',
      md: 'blur(20px)',
      lg: 'blur(40px)',
      xl: 'blur(60px)',
    },

    // Backdrop effects
    backdrop: {
      light: 'blur(20px) saturate(150%)',
      medium: 'blur(30px) saturate(180%)',
      heavy: 'blur(60px) saturate(200%)',
    },

    // Film-specific measurements
    aspect: {
      cinema: '2.39 / 1',      // Cinemascope
      widescreen: '16 / 9',    // Standard widescreen
      academy: '4 / 3',        // Academy ratio
      square: '1 / 1',         // Square
    },
  },
};

export type Theme = typeof Theme;
