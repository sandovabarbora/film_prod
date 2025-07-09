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

    // Background system - FIX: Add missing backgrounds!
    background: {
      primary: '#0f0f23',       // Dark midnight
      secondary: '#1a1a2e',     // Rich charcoal 
      surface: '#16213e',       // Steel blue
      elevated: 'rgba(255, 255, 255, 0.05)',
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

    // Status colors
    status: {
      prep: '#eab308',          // Golden prep
      shoot: '#10b981',         // Green shooting
      post: '#8b5cf6',          // Purple post
      wrap: '#ef4444',          // Red wrap
    },
  },

  // 📝 Typography
  typography: {
    fontFamily: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      heading: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif", 
      mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      accent: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
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
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
      none: 1,
    },
  },

  // 📏 Spacing
  spacing: {
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
  },

  // 🔲 Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // 🌊 Shadows
  shadows: {
    cinema: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    glow: '0 0 20px rgba(102, 126, 234, 0.4)',
    glowHover: '0 0 30px rgba(102, 126, 234, 0.6)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // ⏱️ Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease', 
    slow: '0.5s ease',
    cinema: '0.3s cubic-bezier(0.19, 1, 0.22, 1)',
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
    fadeIn: 'fadeIn 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards',
    slideUp: 'slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards',
    scaleIn: 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    gradientShift: 'gradientShift 6s ease-in-out infinite',
    float: 'float 6s ease-in-out infinite',
    glow: 'glow 2s ease-in-out infinite alternate',
  },

  // 🎬 Cinema-specific Design Tokens
  cinema: {
    blur: {
      sm: 'blur(10px)',
      md: 'blur(20px)',
      lg: 'blur(40px)',
      xl: 'blur(60px)',
    },

    backdrop: {
      light: 'blur(20px) saturate(150%)',
      medium: 'blur(30px) saturate(180%)',
      heavy: 'blur(60px) saturate(200%)',
    },

    aspect: {
      cinema: '2.39 / 1',      // Cinemascope
      widescreen: '16 / 9',    // Standard widescreen
      academy: '4 / 3',        // Academy ratio
      square: '1 / 1',         // Square
    },
  },
};

export type Theme = typeof Theme;
