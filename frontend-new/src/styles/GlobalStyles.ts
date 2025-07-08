// src/styles/GlobalStyles.ts - Cinematic Global Styles
import { createGlobalStyle } from 'styled-components';
import theme, { type Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  /* Import cinematic fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');

  /* CSS Reset & Base */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily.sans};
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.background};
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    font-weight: ${props => props.theme.typography.fontWeight.normal};
    overflow-x: hidden;
    
    /* Cinema-grade background texture */
    background: 
      radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.01) 0%, transparent 50%),
      ${props => props.theme.colors.background};
      
    /* Ultra-subtle film grain */
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.015;
      background-image: 
        radial-gradient(circle, transparent 1px, rgba(0,0,0,0.05) 1px);
      background-size: 4px 4px;
      animation: grain 8s steps(10) infinite;
      z-index: 1;
    }
  }

  @keyframes grain {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -10%); }
    20% { transform: translate(-15%, 5%); }
    30% { transform: translate(7%, -25%); }
    40% { transform: translate(-5%, 25%); }
    50% { transform: translate(-15%, 10%); }
    60% { transform: translate(15%, 0%); }
    70% { transform: translate(0%, 15%); }
    80% { transform: translate(3%, 35%); }
    90% { transform: translate(-10%, 10%); }
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  /* Cinematic Typography System */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.typography.fontFamily.display};
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    line-height: ${props => props.theme.typography.lineHeight.tight};
    margin-bottom: ${props => props.theme.spacing.lg};
    letter-spacing: ${props => props.theme.typography.letterSpacing.tight};
    
    /* Cinematic text shadow */
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    /* Optional gradient text for special headings */
    &.gradient-text {
      background: ${props => props.theme.colors.gradients.text};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  h1 { 
    font-size: clamp(${props => props.theme.typography.fontSize['3xl']}, 8vw, ${props => props.theme.typography.fontSize['6xl']}); 
    font-weight: ${props => props.theme.typography.fontWeight.black};
    letter-spacing: ${props => props.theme.typography.letterSpacing.tighter};
  }
  
  h2 { 
    font-size: clamp(${props => props.theme.typography.fontSize['2xl']}, 6vw, ${props => props.theme.typography.fontSize['5xl']}); 
    font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  }
  
  h3 { 
    font-size: clamp(${props => props.theme.typography.fontSize.xl}, 4vw, ${props => props.theme.typography.fontSize['3xl']}); 
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  h4 { 
    font-size: ${props => props.theme.typography.fontSize['2xl']}; 
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }
  
  h5 { 
    font-size: ${props => props.theme.typography.fontSize.xl}; 
    font-weight: ${props => props.theme.typography.fontWeight.medium};
  }
  
  h6 { 
    font-size: ${props => props.theme.typography.fontSize.lg}; 
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    text-transform: uppercase;
    letter-spacing: ${props => props.theme.typography.letterSpacing.widest};
    color: ${props => props.theme.colors.textSecondary};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.text};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
    font-weight: ${props => props.theme.typography.fontWeight.normal};
    
    &.large {
      font-size: ${props => props.theme.typography.fontSize.lg};
      font-family: ${props => props.theme.typography.fontFamily.elegant};
    }
    
    &.small {
      font-size: ${props => props.theme.typography.fontSize.sm};
      color: ${props => props.theme.colors.textSecondary};
    }
  }

  /* Enhanced Interactive Elements */
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: all ${props => props.theme.transitions.normal};
    position: relative;
    font-weight: ${props => props.theme.typography.fontWeight.medium};

    &:hover {
      color: ${props => props.theme.colors.primaryDark};
      transform: translateY(-1px);
    }

    &:focus {
      outline: none;
      border-radius: ${props => props.theme.borderRadius.sm};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}40;
    }

    /* Cinematic underline animation */
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: ${props => props.theme.colors.gradients.sunset};
      transition: width ${props => props.theme.transitions.spring};
      border-radius: ${props => props.theme.borderRadius.full};
    }

    &:hover::after {
      width: 100%;
    }
  }

  /* Glass Morphism Button System */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    transition: all ${props => props.theme.transitions.normal};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    position: relative;
    overflow: hidden;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}40;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    /* Glass button variant */
    &.glass {
      background: ${props => props.theme.glass.light.background};
      backdrop-filter: ${props => props.theme.glass.light.backdrop};
      border: 1px solid ${props => props.theme.glass.light.border};
      
      &:hover {
        background: ${props => props.theme.glass.medium.background};
        transform: translateY(-2px);
        box-shadow: ${props => props.theme.shadows.glassSm};
      }
    }

    /* Shimmer effect for premium buttons */
    &.shimmer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.6s;
    }

    &.shimmer:hover::before {
      left: 100%;
    }
  }

  /* Cinematic Form Elements */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    border: 2px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius['2xl']};
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing['2xl']};
    transition: all ${props => props.theme.transitions.normal};
    background: ${props => props.theme.glass.light.background};
    backdrop-filter: ${props => props.theme.glass.light.backdrop};
    font-weight: ${props => props.theme.typography.fontWeight.normal};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 
        0 0 0 4px ${props => props.theme.colors.primary}20,
        ${props => props.theme.shadows.glassSm};
      transform: translateY(-2px);
    }

    &::placeholder {
      color: ${props => props.theme.colors.textMuted};
      font-style: italic;
      font-weight: ${props => props.theme.typography.fontWeight.light};
    }

    &:disabled {
      background: ${props => props.theme.colors.background};
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  textarea {
    resize: vertical;
    min-height: 140px;
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
  }

  /* Enhanced Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${props => props.theme.spacing['2xl']};
    background: ${props => props.theme.glass.light.background};
    backdrop-filter: ${props => props.theme.glass.light.backdrop};
    border-radius: ${props => props.theme.borderRadius['2xl']};
    overflow: hidden;
    box-shadow: ${props => props.theme.shadows.glassSm};
  }

  th, td {
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border};
    transition: background-color ${props => props.theme.transitions.fast};
  }

  th {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.glass.medium.background};
    font-size: ${props => props.theme.typography.fontSize.sm};
    text-transform: uppercase;
    letter-spacing: ${props => props.theme.typography.letterSpacing.wider};
  }

  tr:hover td {
    background: ${props => props.theme.colors.surfaceHover};
  }

  /* Cinematic Code Styling */
  code, pre {
    font-family: ${props => props.theme.typography.fontFamily.mono};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }

  code {
    background: ${props => props.theme.glass.light.background};
    padding: 0.25em 0.5em;
    border-radius: ${props => props.theme.borderRadius.md};
    color: ${props => props.theme.colors.accent};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    border: 1px solid ${props => props.theme.colors.borderAccent};
  }

  pre {
    background: ${props => props.theme.glass.medium.background};
    backdrop-filter: ${props => props.theme.glass.medium.backdrop};
    padding: ${props => props.theme.spacing.xl};
    border-radius: ${props => props.theme.borderRadius['2xl']};
    overflow-x: auto;
    margin-bottom: ${props => props.theme.spacing.xl};
    border-left: 4px solid ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.glassSm};
  }

  /* Ultra-Modern Scrollbars */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.glass.light.background};
    border-radius: ${props => props.theme.borderRadius.full};
    margin: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gradients.sunset};
    border-radius: ${props => props.theme.borderRadius.full};
    border: 2px solid transparent;
    background-clip: content-box;

    &:hover {
      background: ${props => props.theme.colors.gradients.ocean};
      background-clip: content-box;
    }
  }

  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Cinematic Selection */
  ::selection {
    background: ${props => props.theme.colors.primary}30;
    color: ${props => props.theme.colors.text};
    text-shadow: none;
  }

  /* Loading States with Glass Morphism */
  .loading {
    pointer-events: none;
    opacity: 0.7;
    position: relative;
    overflow: hidden;
  }

  .loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.theme.glass.light.background}, 
      transparent
    );
    animation: shimmer 1.8s infinite;
  }

  /* Enhanced Animations */
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(40px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes glow {
    0%, 100% { 
      box-shadow: 0 0 5px ${props => props.theme.colors.primary}40; 
    }
    50% { 
      box-shadow: 0 0 30px ${props => props.theme.colors.primary}80; 
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
    40%, 43% { transform: translateY(-30px); }
    70% { transform: translateY(-15px); }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Utility Animation Classes */
  .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
  .slide-in-right { animation: slideInRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
  .scale-in { animation: scaleIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
  .float { animation: float 6s ease-in-out infinite; }
  .glow { animation: glow 2s ease-in-out infinite; }
  .pulse { animation: pulse 2s infinite; }
  .bounce { animation: bounce 1s; }
  .rotate { animation: rotate 2s linear infinite; }

  /* Delay variations */
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-500 { animation-delay: 0.5s; }

  /* Glass Morphism Utility Classes */
  .glass-light {
    background: ${props => props.theme.glass.light.background};
    backdrop-filter: ${props => props.theme.glass.light.backdrop};
    border: 1px solid ${props => props.theme.glass.light.border};
    box-shadow: ${props => props.theme.shadows.glassSm};
  }

  .glass-medium {
    background: ${props => props.theme.glass.medium.background};
    backdrop-filter: ${props => props.theme.glass.medium.backdrop};
    border: 1px solid ${props => props.theme.glass.medium.border};
    box-shadow: ${props => props.theme.shadows.glass};
  }

  .glass-heavy {
    background: ${props => props.theme.glass.heavy.background};
    backdrop-filter: ${props => props.theme.glass.heavy.backdrop};
    border: 1px solid ${props => props.theme.glass.heavy.border};
    box-shadow: ${props => props.theme.shadows.glassLg};
  }

  /* Gradient Text Utility */
  .gradient-text {
    background: ${props => props.theme.colors.gradients.text};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }

  /* Status Indicators */
  .status-development { color: ${props => props.theme.colors.development}; }
  .status-pre-production { color: ${props => props.theme.colors.preProduction}; }
  .status-production { color: ${props => props.theme.colors.production}; }
  .status-post-production { color: ${props => props.theme.colors.postProduction}; }
  .status-completed { color: ${props => props.theme.colors.completed}; }
  .status-cancelled { color: ${props => props.theme.colors.cancelled}; }

  /* Interactive Enhancement */
  .interactive {
    transition: all ${props => props.theme.transitions.normal};
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: ${props => props.theme.shadows.xl};
    }

    &:active {
      transform: translateY(-2px);
      transition: all ${props => props.theme.transitions.fast};
    }
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Responsive Utilities */
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    html { font-size: 14px; }
    
    .hide-mobile { display: none !important; }
    
    h1 { font-size: ${props => props.theme.typography.fontSize['3xl']}; }
    h2 { font-size: ${props => props.theme.typography.fontSize['2xl']}; }
    h3 { font-size: ${props => props.theme.typography.fontSize.xl}; }
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    .hide-desktop { display: none !important; }
  }

  /* Accessibility Enhancements */
  @media (prefers-contrast: high) {
    button, input, select, textarea {
      border-width: 3px;
    }
    
    a::after {
      height: 3px;
    }
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    body::before {
      animation: none;
    }
  }

  /* Print Optimization */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    .no-print {
      display: none !important;
    }

    body::before {
      display: none;
    }

    a, a:visited {
      text-decoration: underline;
    }

    a[href]:after {
      content: " (" attr(href) ")";
    }

    thead {
      display: table-header-group;
    }

    tr, img {
      page-break-inside: avoid;
    }

    p, h2, h3 {
      orphans: 3;
      widows: 3;
    }

    h2, h3 {
      page-break-after: avoid;
    }
  }

  /* Ultra-wide screen optimizations */
  @media (min-width: ${props => props.theme.breakpoints['3xl']}) {
    .container-ultra {
      max-width: 1600px;
      margin: 0 auto;
    }
  }
`;
